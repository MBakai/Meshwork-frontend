import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth-service/auth.service';
import { TaskComponent } from '../boards/task/task.component';
import { SubtaskComponent } from '../boards/subtask/subtask.component';
import { ColaboradorService } from '../../core/colaborador-service/colaborador.service';
import { ColaboradorResponse } from '../../core/auth-service/interface/colaborador-response.interface';
import { debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs';
import { NotificacionesService } from '../../core/notificaciones/notificaciones.service';
import { NotificacionesComponent } from '../notificaciones/notificaciones.component';
import Swal from 'sweetalert2';
import { Notificaciones } from '../../core/notificaciones/interfaces/notificaciones.interface';
import { SubtaskAsignComponent } from '../boards/subtask-asign/subtask-asign.component';
import { subtaskResponse } from '../../core/subTask-service/interfaces/subtask-response.interface';
import { SubtaskService } from '../../core/subTask-service/subtask.service';
import { showUserSuccess } from '../../shared/utils/message-alerts.ts/message-alert-taskBoard';

const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 1500,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
  });

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    RouterOutlet,
    RouterModule,
    ReactiveFormsModule,
    TaskComponent,
    SubtaskComponent,
    NotificacionesComponent,
    SubtaskAsignComponent
],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  viewCreateTask = false;
  viewSubTaskForm = false;
  viewNotification = false; 

  idTareaPadre: string | null = null;
  userName: string = '';
  userId: string = '';

  formNombre!: FormGroup;
  nombreOriginal: string = '';
  editandoNombre = false;
  
  @ViewChild('searchInput') searchInputRef!: ElementRef;
  busquedaCorreoControl = new FormControl('');
  busquedaCorreo: string = '';
  usuariosEncontrados: ColaboradorResponse[] = [];
  
  notiNoLeidas = 0;
  cargandoNotificaciones: boolean = false;
  solicitudesEnviadas: string[] = [];
  notificaciones: Notificaciones[] = [];
  
  mostrarResultados = false;
  cargandoUsuarios: boolean = false;

  private searchSubject = new Subject<string>();
  private hideTimeout: any;

  // Estado del panel de subtareas
  isSubtaskMenuOpen: boolean = false;
  subtaskCount: number = 0;
  subtasks: subtaskResponse[] = [];
  
  constructor(
    private authService: AuthService,
    private colacoradorService: ColaboradorService,
     private notificacionesService: NotificacionesService,
     private subtaskService: SubtaskService,
     private router: Router,
     private fb: FormBuilder
  ){
    this.searchSubject.pipe(
      debounceTime(300), 
      distinctUntilChanged(), 
      switchMap(term => {
        if (!term.trim()) {
          this.usuariosEncontrados = [];
          this.cargandoUsuarios = false;
          return [];
        }
        
        this.cargandoUsuarios = true;
        return this.colacoradorService.buscarUsuariosPorCorreo(term);
      })
    ).subscribe({
      next: (usuarios) => {
        this.usuariosEncontrados = usuarios;
        
        this.cargandoUsuarios = false;
      },
      error: (err) => {
        console.error('Error al buscar usuarios:', err);
        this.usuariosEncontrados = [];
        this.cargandoUsuarios = false;
      }
    });
  }

  ngOnInit(): void {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      const user = JSON.parse(userData);
      this.userName = user.name || ''; 
      this.userId = user.id || '';
      this.conectarSocket();

      this.notificacionesService.obtenerNoLeidas().subscribe({
        next: ({ noLeidas }) => {
          this.notiNoLeidas = noLeidas;
        }
      });
      this.cargarSubtareas();
    }
    this.busquedaCorreoControl.valueChanges.subscribe(valor => {
        this.busquedaCorreo = valor!.trim(); // si aún la necesitas por compatibilidad
      
      this.buscarUsuarios();
    });

    this.formNombre = this.fb.group({
        nombre: [ Validators.required],
    });
  }

  editarNombre() {
    Swal.fire({
      title: 'Editar nombre',
      input: 'text',
      inputLabel: 'Nuevo nombre',
      inputValue: this.userName,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value.trim()) {
          return 'El nombre no puede estar vacío';
        }
        return null;
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        // Aquí llamas a tu servicio para actualizar
        this.authService.updateUser(this.userId, { nombre: result.value }).subscribe({
          next: (updatedUser) => {
            this.userName = result.value;
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            currentUser.name = updatedUser.nombre;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));

            Swal.fire('Éxito', 'Nombre actualizado correctamente', 'success');
          },
          error: () => {
            Swal.fire('Error', 'No se pudo actualizar el nombre', 'error');
          }
        });
      }
    });
  }


  logout() {
    let timerInterval: ReturnType<typeof setInterval>;;

    Swal.fire({
      title: "Cerrando sesión",
      timer: 1000,
      timerProgressBar: true,
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
        const popup = Swal.getPopup();
        const timer = popup?.querySelector("b");

        timerInterval = setInterval(() => {
          if (timer) {
            timer.textContent = `${Swal.getTimerLeft()}`;
          }
        }, 100);
      },
      willClose: () => {
        clearInterval(timerInterval);
      }
    }).then((result) => {
      if (result.dismiss === Swal.DismissReason.timer) {
        this.authService.logout();
        this.notificaciones = [];
        this.notiNoLeidas = 0;
        this.router.navigate(['']);
      }
    });
  }

  conectarSocket() {
    if (!this.userId) {
      return;
    }
    
    this.notificacionesService.conectar(this.userId);

    this.notificacionesService.escucharNotificaciones().subscribe({
      next: (noti) => {

        this.notificaciones.unshift(noti); 
        this.notiNoLeidas++;  
      },
      error: (err) => {
        console.error('Error al escuchar notificaciones:', err);
      }
    });
  }
  
  ngOnDestroy() {
    this.notificacionesService.desconectar();
    if (this.hideTimeout) clearTimeout(this.hideTimeout);
  }
// notificaciones
  toggleNotificaciones() {
    this.viewNotification = !this.viewNotification;
    
    if (this.viewNotification && this.notificaciones.length === 0) {
      this.cargarNotificaciones();
    }
  }
  
  marcarNotificacionesLeidas() {
    this.notiNoLeidas = 0;
  }

  cargarNotificaciones() {
    this.cargandoNotificaciones = true;

    setTimeout(() => {
      this.notificacionesService.obtenerMisNotificaciones().subscribe({
        next: (notis) => {
          this.notificaciones = notis;
          this.notiNoLeidas = notis.filter(n => !n.leida).length;
          
        },
        error: (err) => {
          console.error('Error al cargar notificaciones:', err);
        }
      });
      
      this.cargandoNotificaciones = false;
    }, 500);
  }

  // Agrega estos métodos para manejar las acciones de notificaciones:
  onNotificacionClick(notificacion: Notificaciones) {
    if(notificacion.leida){
      this.notiNoLeidas --;
    }
  }

  onSolicitudAceptada(notificacion: Notificaciones) {
    this.viewNotification = false;
    this.cargarNotificaciones();
    this.mostrarNotificacion('Solicitud aceptada exitosamente', 'success');

  }

  onSolicitudRechazada(notificacion: Notificaciones) {
    this.viewNotification = false;
    this.cargarNotificaciones();
    this.mostrarNotificacion('Solicitud rechazada', 'success');
  }


// fin de las funciones de nootificacion

  buscarUsuarios() {
    this.mostrarResultados = true;
    this.searchSubject.next(this.busquedaCorreo);
  }

  seleccionarUsuario(usuario: ColaboradorResponse) {
    
    this.busquedaCorreo = `${usuario.nombre} (${usuario.email})`;
    
    this.mostrarResultados = false;
    this.usuariosEncontrados = [];
  
    if (this.searchInputRef) {
      this.searchInputRef.nativeElement.blur();
    }
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const clickedInside = this.searchInputRef?.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.ocultarConRetardo();
    } else {
      this.mostrarResultados = true;
    }
  }

  ocultarConRetardo() {
    // Limpiar timeout anterior si existe
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }
    
    this.hideTimeout = setTimeout(() => {
      this.mostrarResultados = false;
    }, 200);
  }
  
  // Función para obtener iniciales del nombre
  getInitials(nombre: string): string {
    
    if (!nombre) return '?';
    
    const words = nombre.split(' ');
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  }

  // Función para limpiar la búsqueda
  limpiarBusqueda() {
    this.busquedaCorreo = '';
    this.usuariosEncontrados = [];
    this.mostrarResultados = false;
    this.cargandoUsuarios = false;
  }

  // Función para manejar teclas especiales
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.mostrarResultados = false;
    }
    
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      // Aquí puedes agregar navegación con teclado si quieres
      event.preventDefault();
    }
    
    if (event.key === 'Enter' && this.usuariosEncontrados.length > 0) {
      // Seleccionar el primer resultado con Enter
      this.seleccionarUsuario(this.usuariosEncontrados[0]);
    }
  }


  enviarSolicitud(usuario: ColaboradorResponse, event: Event) {
    event.stopPropagation(); 
    
    this.colacoradorService.enviarSolicitud(usuario.id).subscribe({
      next: (response) => {

        // Actualizar estado localmente
        usuario.estadoSolicitud = 'pendiente';
        usuario.fueEnviadaPorMi = true;

        this.mostrarNotificacion(`Solicitud enviada a ${usuario.nombre}`, 'success');
      },
      error: (error) => {
        console.error('Error al enviar solicitud:', error);
        this.mostrarNotificacion(`Error al enviar solicitud a ${usuario.nombre}`, 'error');
      }
    });
  }

   // Función para mostrar notificaciones
  private mostrarNotificacion(mensaje: string, tipo: 'success' | 'error') {
    Toast.fire({
      icon: tipo,
      title: mensaje
    });
  }

  cargarSolicitudesEnviadas() {
    this.colacoradorService.obtenerSolicitudesEnviadas().subscribe({
      next: (solicitudes) => {
        this.solicitudesEnviadas = solicitudes.map(s => s.usuarioId);
      },
      error: (error) => {
        console.error('Error al cargar solicitudes enviadas:', error);
      }
    });
  }


  createTask(){
    this.viewCreateTask = true;
  }

   /**
   * Alternar la visibilidad del menú de subtareas
   */
  toggleSubtaskMenu() {
    this.isSubtaskMenuOpen = !this.isSubtaskMenuOpen;
    this.cargarSubtareas();
  }

  /**
   * Cerrar el menú de subtareas
   */
  closeSubtaskMenu() {
    this.isSubtaskMenuOpen = false;
  }

  
    // Cargar subtareas asignadas
   
  private cargarSubtareas() {
    this.subtaskService.getSubtaskColaborador().subscribe({
      next: (subtasks) => {
        
        this.subtasks = subtasks;
        this.subtaskCount = subtasks.length;
      },
      error: (error) => {
        console.error('Error al cargar subtareas:', error);
      }
    });
  }

  abrirSubtarea(taskId: string) {
    this.idTareaPadre = taskId;
    this.viewCreateTask = false; 
    this.viewSubTaskForm = true; 
  }

  

}
