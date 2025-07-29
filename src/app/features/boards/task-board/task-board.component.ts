import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
 import { take } from 'rxjs';
import { TaskService } from '../../../core/task-service/task.service';
import { TaskFull } from '../task/interface/task-full.interface';
import { UpdateSubTask } from '../subtask/interfaces/updateSubTask.interface';
import { SubtaskService } from '../../../core/subTask-service/subtask.service';
import { Subtask } from '../subtask/interfaces/subtask.interface';
import { calcularDiasRestantes } from '../../../shared/utils/dias-restantes.utils';
import { Estado } from '../../../shared/interface/estados.interface';
import { noFechaPasadaValidator } from '../task/validators/fecha-inicio-no-valida.validator';
import { fechaFinNoValidator } from '../task/validators/fecha-final-no-valida.validator';
import Swal from 'sweetalert2'
import { SubtaskComponent } from '../subtask/subtask.component';
import { TaskEventService } from '../../../core/eventos-service/task-event.service';
import { showTaskSuccess } from '../../../shared/utils/message-alerts.ts/message-alert-taskBoard';

interface SubtaskUIState {
  expandida: boolean;
  editandoTitulo: boolean;
  editandoDescripcion: boolean;
  tituloTemporal?: string;
  descripcionTemporal?: string;
}

@Component({
  selector: 'app-task-board',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SubtaskComponent],
  templateUrl: './task-board.component.html',
  styleUrl: './task-board.component.css'
})
export class TaskBoardComponent implements OnInit {

  tasksFull!: TaskFull;
  currentIndex: number = 0;
  estados: Estado[] = [];
  isEditMode = false;

  editandoTitulo = false;
  editandoDescripcion = false;

  tituloOriginal: string = '';
  descripcion: string = '';
  counSubTask: number = 0;

  tareaForm!: FormGroup;
  subtareasUI: Record<string, SubtaskUIState> = {};
  subtaskForms: Record<string, FormGroup> = {};
  subtaskFechasForms: { [key: string]: FormGroup } = {};
  subtaskAsignacionForms: { [key: string]: FormGroup } = {};

  viewSubTaskForm = false;
  idTareaPadre: string | null = null;

  constructor(
    private readonly taskService: TaskService,
    private readonly subTaskService: SubtaskService,
    private readonly taskEventService:TaskEventService,
    private readonly route: ActivatedRoute,
    private fb: FormBuilder
  ){}

  ngOnInit(): void {
    const taskId = this.route.snapshot.paramMap.get('id');

      if (taskId) {
        this.loadTaskFull(taskId);
    }

    this.loadEstados(); // <-- Agrega esto
  }

  loadEstados(): void {
      this.taskService.getStatus().subscribe({
        next: (data) => {
          this.estados = data;
          console.log('Estados cargados:', this.estados);
        },
        error: (err) => console.error('Error al cargar estados', err)
    });
  }
  
  loadTaskFull(taskId: string) {
    this.taskService.getTaskFull(taskId).subscribe({
      next: (data: TaskFull) => {
        this.tasksFull = data;
        this.counSubTask =  data.tarea.subtasks.length;
        console.log(this.counSubTask);
        
        
        this.inicializarSubtareasUI();
        this.inicializarFormulariosSubtareas();

        this.tareaForm = this.fb.group({
          titulo: [this.tasksFull.tarea.titulo, Validators.required],
          descripcion: [this.tasksFull.tarea.descripcion]
        });
      },
      error: (err) => {
        console.error('Error al recargar tareas:', err);
      }
    }); 
  }
  
  inicializarSubtareasUI() {
    this.tasksFull.tarea.subtasks.forEach(sub => {
      this.subtareasUI[sub.id] = {
        expandida: false,
        editandoTitulo: false,
        editandoDescripcion: false,
      };
    });
  }

  inicializarFormulariosSubtareas() {
    this.tasksFull.tarea.subtasks.forEach(sub => {
      this.subtaskForms[sub.id]= this.fb.group({
        titulo: [sub.titulo, Validators.required],
        descripcion: [sub.descripcion, Validators.required],
      });
       this.subtaskFechasForms[sub.id] = this.fb.group({
          startDate: [this.formatearFecha(sub.startDate), [Validators.required, noFechaPasadaValidator]],
          endDate: [this.formatearFecha(sub.endDate), Validators.required]
        }, { validators: fechaFinNoValidator });

        this.subtaskAsignacionForms[sub.id] = this.fb.group({
          asignado: ['', Validators.required]
        });
    });
  }
  

  private formatearFecha(fecha: string | null | undefined): string | null {
    if (!fecha || fecha === 'null') return null;

    const partes = fecha.split('T')[0].split(' ')[0]; // 2025-07-10
    return /^\d{4}-\d{2}-\d{2}$/.test(partes) ? partes : null;
  }

  get tarea() {
    return this.tasksFull?.tarea;
  }

  toggleSubtarea(id: string) {
    this.subtareasUI[id].expandida = !this.subtareasUI[id].expandida;
  }

// ======== Tarea principal: Título y descripción =========

  editarTitulo() {
    this.editandoTitulo = true;
    this.tituloOriginal = this.tareaForm.get('titulo')?.value;
  }

  cancelarEdicionTitulo() {
    this.editandoTitulo = false;
    this.tareaForm.get('titulo')?.reset(this.tituloOriginal);
  }

  guardarTitulo() {
    if (this.tareaForm.get('titulo')?.invalid) return;

    const nuevoTitulo = this.tareaForm.get('titulo')?.value;
    this.taskService.updateTask(this.tasksFull.tarea.id, { titulo: nuevoTitulo }).subscribe({
      next: () => {
        this.tasksFull.tarea.titulo = nuevoTitulo;
        this.editandoTitulo = false;
        showTaskSuccess('edit');
      },
      error: (err) => console.error('Error al actualizar título:', err),
    });
  }

  editarDescripcion() {
    this.editandoDescripcion = true;
    this.descripcion = this.tareaForm.get('descripcion')?.value;
  }

  cancelarEdicionDescripcion() {
    this.editandoDescripcion = false;
    this.tareaForm.get('descripcion')?.reset(this.descripcion);
  }

  guardarDescripcion() {
    const nuevaDesc = this.tareaForm.get('descripcion')?.value;
    this.taskService.updateTask(this.tasksFull.tarea.id, { descripcion: nuevaDesc }).subscribe({
      next: () => {
        this.tasksFull.tarea.descripcion = nuevaDesc;
        this.editandoDescripcion = false;
        showTaskSuccess('edit');
      },
      error: (err) => console.error('Error al actualizar descripción:', err),
    });
  }

  // ======== Subtarea: Título y descripción =========

  editarTituloSubtarea(sub: Subtask) {
    this.subtareasUI[sub.id].editandoTitulo = true;
    this.subtareasUI[sub.id].tituloTemporal = this.subtaskForms[sub.id].get('titulo')?.value;
  }

  cancelarEdicionTituloSubtarea(sub: Subtask) {
    const original = this.subtareasUI[sub.id].tituloTemporal;

    this.subtaskForms[sub.id].patchValue({ titulo: original });
    this.subtareasUI[sub.id].editandoTitulo = false;
  }

  guardarTituloSubtarea(sub: Subtask) {

    const form = this.subtaskForms[sub.id];

    if (form.get('titulo')?.invalid) {
      form.get('titulo')?.markAsTouched();
      return;
    }

    const payload: UpdateSubTask = {
      titulo: form.get('titulo')?.value
    };

    this.subTaskService.updateSubTask(sub.id, payload).subscribe({
      next: () => {
        sub.titulo = payload.titulo!;
        this.subtareasUI[sub.id].editandoTitulo = false;
        showTaskSuccess('edit');
      },
      error: (err) => console.error('Error actualizando título:', err),
    });
  }

  editarDescripcionSubtarea(sub: Subtask) {
    this.subtareasUI[sub.id].editandoDescripcion = true;
    this.subtareasUI[sub.id].descripcionTemporal = this.subtaskForms[sub.id].get('descripcion')?.value;
  }

  cancelarEdicionDescripcionSubtarea(sub: Subtask) {
    const original = this.subtareasUI[sub.id].tituloTemporal;
    this.subtaskForms[sub.id].patchValue({ descripcion: original });
    this.subtareasUI[sub.id].editandoDescripcion = false;
  }

  guardarDescripcionSubtarea(sub: Subtask) {

    const form = this.subtaskForms[sub.id];

    if (form.get('descripcion')?.invalid) {
      form.get('descripcion')?.markAsTouched();
      return;
    }

    const payload: UpdateSubTask = {
      descripcion: form.get('descripcion')?.value
    };

    this.subTaskService.updateSubTask(sub.id, payload).subscribe({
      next: () => {
        sub.descripcion = payload.descripcion!;
        this.subtareasUI[sub.id].editandoDescripcion = false;
        showTaskSuccess('edit');
      },
      error: (err) => console.error('Error actualizando descripción:', err),
    });
  }


  // ======== Subtarea: Estado, Fechas, Usuarios ==========


  cambiarEstado(sub: Subtask): void {
    
    const actualId = sub.estados?.id;
    if (!actualId) return;

    const siguiente = this.getSiguienteEstado(actualId); 
    if (!siguiente) return;

    // 🔔 Confirmación con SweetAlert
    Swal.fire({
      title: '¿Estás seguro?',
      text: `Una vez cambiado a "${siguiente.nombre}", no podrás volver a un estado anterior.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cambiar estado',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        const payload: UpdateSubTask = { id_estado: siguiente.id };

        this.subTaskService.updateSubTask(sub.id, payload).subscribe({
          next: () => {
            sub.estados = siguiente;
            showTaskSuccess('edit');

            Swal.fire({
              icon: 'success',
              title: 'Estado actualizado',
              text: `La tarea ha pasado al estado "${siguiente.nombre}".`,
              timer: 2000,
              showConfirmButton: false,
            });
            if(siguiente.nombre === 'Terminado'){
              showTaskSuccess('task-completed');
            }
          },
          error: (err) => {
            console.error('Error al cambiar estado', err);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo cambiar el estado de la tarea.',
            });
          },
        });
      }
    });
  }

  getSiguienteEstado(actualId: number): Estado | undefined {

    if (!this.estados.length) return;

    const actualIndex = this.estados.findIndex(e => e.id === actualId);

    if (actualIndex === -1 || actualIndex + 1 >= this.estados.length) {
      console.warn(`No se encontró el siguiente estado para id: ${actualId}`);
      return;
    }

    return this.estados[actualIndex + 1];
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

  cambiarFechas(sub: Subtask) {

    const form = this.subtaskFechasForms[sub.id];
    form.updateValueAndValidity();

    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }

    const payload: UpdateSubTask = {
      startDate: form.get('startDate')?.value,
      endDate: form.get('endDate')?.value
    };
    console.log(payload);
    

    this.subTaskService.updateSubTask(sub.id!, payload).subscribe({
      next: () => {
        showTaskSuccess('update-date');
      },
      error: (err) => {
        console.error('Error al actualizar fechas', err);
      }
    });
  }

  listaColaborador(sub: Subtask, event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.subtaskAsignacionForms[sub.id].get('asignado')?.setValue(value);
  }

  colaboradoresDisponibles(sub: Subtask) {
    return this.tasksFull.colaboradores.filter(colab => 
      !sub.asignados.some(asignado => asignado.id === colab.id)
    );
  }

  agregarColaborador(sub: Subtask) {
    const form = this.subtaskAsignacionForms[sub.id];
    const idAsignado = form.get('asignado')?.value;
    if (!idAsignado) return;

    const payload: UpdateSubTask = {
      asignados: [idAsignado] 
    };

    console.log(payload); // Debe verse: { asignados: ['id123'] }

    this.subTaskService.updateSubTask(sub.id, payload).subscribe({
      next: () => {
        const colaborador = this.tasksFull.colaboradores.find(c => c.id === idAsignado);
        if (colaborador) {
          sub.asignados.push(colaborador);
        }
        form.get('asignado')?.reset('');
        showTaskSuccess('add-collaborator');
      },
      error: (err) => console.error('Error agregando colaborador:', err)
    });

    form.get('asignado')?.reset('');
  }

  removerColaborador(sub: Subtask, idUser: string) {

    const payload: UpdateSubTask = {
      quitarAsignados: [idUser]
    };
    console.log(payload);
    

    this.subTaskService.updateSubTask(sub.id, payload).subscribe({
      next: () => {
        // Elimina visualmente también (puedes hacerlo directamente del array)
        sub.asignados = sub.asignados.filter(user => user.id !== idUser);
        showTaskSuccess('remove-collaborator');
      },
      error: (err) => console.error('Error removiendo colaborador:', err)
    });
  }

  getDiasParaTarea(tarea: Subtask): string {
    if (!tarea.endDate) return '';
    const dias = calcularDiasRestantes(tarea.endDate);
    if (dias > 1) return `Faltan ${dias} días`;
    if (dias === 1) return 'Falta 1 día';
    if (dias === 0) return 'Vence hoy';
    return `Venció hace ${Math.abs(dias)} día(s)`;
  }

  detenerPropagacion(event: Event) {
    event.stopPropagation();
  }

 

  abrirSubtarea(taskId: string) {
    this.taskService.getTaskFull(taskId).subscribe({
      next: (data) => {
        const subtasksCount = data.tarea.subtasks.length;

        if (subtasksCount < 5) {
          this.idTareaPadre = taskId;
          this.viewSubTaskForm = true;

          this.taskEventService.subTaskCreate$.subscribe(() => {
            if (this.idTareaPadre) {
              this.loadTaskFull(this.idTareaPadre);
            }
          });
        } else {
          this.messageInvalid();
        }
      },
      error: (err) => {
        console.error('Error al obtener la tarea para contar subtareas:', err);
      }
    });
  }

  deleteSubTask(sub: Subtask): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará la tarea permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
        backdrop: false,  
    }).then((result) => {
      if (result.isConfirmed) {
        this.subTaskService.deleteSubTask(sub.id).subscribe({
          next: () => {
            this.tasksFull.tarea.subtasks = this.tasksFull.tarea.subtasks.filter(s => s.id !== sub.id);

            Swal.fire('Eliminada', 'La tarea fue eliminada.', 'success');
          },
          error: (err) => {
            console.error('Error al eliminar tarea:', err);
            Swal.fire('Error', 'No se pudo eliminar la tarea.', 'error');
          }
        });
      }
    });
  }

  messageInvalid() {
    Swal.fire({
      icon: 'warning',
      title: 'Límite alcanzado',
      text: 'Solo se permiten 5 subtareas por tarea.',
      confirmButtonText: 'Entendido',
    });
  }



}
