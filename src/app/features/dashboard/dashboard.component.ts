import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth-service/auth.service';
import { TaskComponent } from '../boards/task/task.component';
import { SubtaskComponent } from '../boards/subtask/subtask.component';
import { ColaboradorService } from '../../core/colaborador-service/colaborador.service';
import { ColaboradorResponse } from '../../shared/interface/colaborador-response.interface';
import { debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs';
import { NotificacionesService } from '../../core/notificaciones/notificaciones.service';
import { NotificacionesComponent } from '../notificaciones/notificaciones.component';
import Swal from 'sweetalert2';
import { Notificaciones } from '../notificaciones/interfaces/notificaciones.interface';

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
    TaskComponent,
    SubtaskComponent,
    NotificacionesComponent
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
  
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;
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
  
  constructor(
    private authService: AuthService,
    private colacoradorService: ColaboradorService,
     private notificacionesService: NotificacionesService,
     private router: Router,
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
          console.log('entre', this.notiNoLeidas)
        }
      });
    }
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
      console.error('No hay userId para conectar el socket');
      return;
    }
    
    this.notificacionesService.conectar(this.userId);

    console.log(this.userId);
    
    this.notificacionesService.escucharNotificaciones().subscribe({
      next: (noti) => {

        this.notificaciones.unshift(noti); 
        this.notiNoLeidas++;  
        console.log('Nueva notificación:', noti);
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
    console.log('Todas las notificaciones marcadas como leídas');
  }

  cargarNotificaciones() {
    this.cargandoNotificaciones = true;

    setTimeout(() => {
      this.notificacionesService.obtenerMisNotificaciones().subscribe({
        next: (notis) => {
          this.notificaciones = notis;
          this.notiNoLeidas = notis.filter(n => !n.leida).length;
          console.log(this.notificaciones, this.notiNoLeidas);
          
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
    console.log('Usuario seleccionado:', usuario);
    
    this.busquedaCorreo = `${usuario.nombre} (${usuario.email})`;
    
    this.mostrarResultados = false;
    this.usuariosEncontrados = [];
  
    if (this.searchInput) {
      this.searchInput.nativeElement.blur();
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
    console.log(usuario);
    
    this.colacoradorService.enviarSolicitud(usuario.id).subscribe({
      next: (response) => {
        console.log('Solicitud enviada exitosamente:', response);

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

  abrirSubtarea(taskId: string) {
    this.idTareaPadre = taskId;
    this.viewCreateTask = false; 
    this.viewSubTaskForm = true; 
  }

  

}
