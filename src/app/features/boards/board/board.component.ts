import { Component, inject } from '@angular/core';
import { TaskService } from '../../../core/task-service/task.service';
import { Task } from '../task/interface/task.interface';
import { CommonModule } from '@angular/common';
import { FirstTaskComponent } from '../first-task/first-task.component';
import { TaskEventService } from '../../../core/eventos-service/task-event.service';
import { Subject, takeUntil } from 'rxjs';
import Swal from 'sweetalert2';
import { calcularDiasRestantes } from '../../../shared/utils/dias-restantes.utils';
import { Estado } from '../../../shared/interface/estados.interface';
import { TaskComponent } from '../task/task.component';
import { SubtaskComponent } from '../subtask/subtask.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, FirstTaskComponent, TaskComponent, SubtaskComponent],
  templateUrl: './board.component.html',
  styleUrl: './board.component.css'
})
export class BoardComponent {

  tasks: Task[] = [];
  estados: Estado[] = [];
  cargandoTareas = false;
  isEditMode = false;
  numeroTareas = 0;
  viewUpdateTask = false;
  idTareaParaEditar: string | null = null;
  viewSubTaskForm = false;
  idSubTaskPadreEditar: string | null = null;
  private readonly router = inject(Router); 

  private destroy$ = new Subject<void>();

  constructor(
    private taskService: TaskService,
    private taskEventService: TaskEventService,
  ) {}

  ngOnInit(): void {
    
    this.cargarTareas();
    
    this.taskService.getStatus().subscribe(data => {
      console.log('estado cargado');
      this.estados = data;
    });

    this.taskEventService.taskCreated$
    .pipe(takeUntil(this.destroy$))
    .subscribe(() => {
      this.cargarTareas();
    });

  this.taskEventService.subTaskCreate$
    .pipe(takeUntil(this.destroy$))
    .subscribe(() => {
      this.cargarTareas();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  currentIndex = 0;

  nextTask() {
    this.currentIndex = (this.currentIndex + 1) % this.tasks.length;
  }

  prevTask() {
    this.currentIndex =
      (this.currentIndex - 1 + this.tasks.length) % this.tasks.length;
  }

  get currentTask(): Task | null {
    return this.tasks.length > 0 ? this.tasks[this.currentIndex] : null;
  }

  cargarTareas() {

    this.taskService.getTaskSimple().subscribe({
      next: (data: Task[]) => {
        this.numeroTareas = data.length;
        if(this.numeroTareas > 1){
          this.cargandoTareas = true;
        }
        this.tasks = data;
        this.currentIndex = 0;
        
      },
      error: (err) => {
        console.error('Error al recargar tareas:', err);
      }
    });
  }

  deleteTask(id: string): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará la tarea permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.taskService.deleteTask(id).subscribe({
          next: () => {
            Swal.fire('Eliminada', 'La tarea fue eliminada.', 'success');
            this.cargarTareas();
            
          },
          error: (err) => {
            console.error('Error al eliminar tarea:', err);
            Swal.fire('Error', 'No se pudo eliminar la tarea.', 'error');
          }
        });
      }
    });
  }

  editarTarea(taskId: string) {
    this.idTareaParaEditar = taskId;
    this.viewUpdateTask = true;
  }

  editsubTask(taskId: string){
    this.idSubTaskPadreEditar = taskId;
    this.viewUpdateTask = false; // ocultamos la modal actual
    this.viewSubTaskForm = true;
  }

  viewTaskDetalis(taskId: string){
    this.router.navigate(['/dashboard/task-detalis', taskId]);
  }
  

  cerrarModal() {
    this.viewUpdateTask = false;
    this.idTareaParaEditar = null;
  }

  getDiasParaTarea(tarea: Task): string {
    if (!tarea.endDate) return '';

    const dias = calcularDiasRestantes(tarea.endDate);

    if (dias > 1) return `Faltan ${dias} días`;
    if (dias === 1) return 'Falta 1 día';
    if (dias === 0) return 'Vence hoy';
    return `Venció hace ${Math.abs(dias)} día(s)`;
  }

  cambiarEstado(taskId: string, sub: Estado): void {

    Swal.fire({
      title: '¿Estás seguro?',
      text: `Una vez cambiado a "${sub.nombre}", no podrás volver a un estado anterior.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cambiar estado',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    })
    .then((result)=> {
     if(result.isConfirmed){

      this.taskService.cambiarEstado(taskId, sub.id).subscribe({ 
        next: () => {
           // actualiza la lista de tareas o solo la tarea modificada
           this.taskService.getTaskSimple().subscribe((data) => {
             this.tasks = data;
           });
           this.isEditMode = sub.nombre !== 'Terminado';
           this.successStatus();
   
           Swal.fire({
             icon: 'success',
             title: 'Estado actualizado',
             text: `La tarea ha pasado al estado "${sub.nombre}".`,
             timer: 2000,
             showConfirmButton: false,
           });
           if(sub.nombre === 'Terminado'){
             this.isEditMode =  true;
             this.successStatus();
           }
         },
          error: (err) => {
           console.error('Error al cambiar estado', err);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo cambiar el estado de la tarea.',
            });
          }
        });
      }
    });

  }

  getSiguienteEstado(actualId: number): Estado | undefined {
    return this.estados.find(e => e.id === actualId + 1);
  }

  getStatusLightClass(estado: string): string {
    if (!estado) return 'light-inactive';
    
    const estadoNormalizado = estado.toLowerCase().trim();
    
    switch (estadoNormalizado) {

      case 'creado':
        return 'light-inactive';
        
      case 'empezado':
        return 'light-pending';

      case 'en-proceso':
        return 'light-active';
      
      case 'terminado':
        return 'light-completed';
      
      
      default:
        return 'light-inactive';
    }
  }

  messageSuccess(){
    Swal.fire({
      position: "center",
      icon: "success",
      title: this.isEditMode ? "Tarea actualizada correctamente" : "Tarea creada correctamente",
      showConfirmButton: false,
      timer: 1500
    });
  }

  successStatus() {
    if (this.isEditMode) {
      Swal.fire({
        position: "center",
        icon: "success",
        title: "Tarea finalizada",
        showConfirmButton: false,
        timer: 1500
      });
    }
  }

}
