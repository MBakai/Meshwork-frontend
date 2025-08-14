import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TaskService } from '../../../core/task-service/task.service';
import { Task } from '../../../core/task-service/interfaces/task.interface';
import { TaskType } from '../../../core/task-service/interfaces/type.enum';
import { noFechaPasadaValidator } from './validators/fecha-inicio-no-valida.validator';
import { fechaFinNoValidator } from './validators/fecha-final-no-valida.validator';
import { TaskEventService } from '../../../core/eventos-service/task-event.service';
import Swal from 'sweetalert2'

@Component({
  selector: 'app-task',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './task.component.html',
  styleUrl: './task.component.css'
})
export class TaskComponent implements OnInit {

  taskForm: FormGroup;
  backendErrors = '';
  tasks: Task[] = [];
  isEditMode = false;
  tipoActual: string = '';
  taskTieneSubtasks: boolean = false;

  @Input() taskId: string | null = null;
  @Output() cerrar = new EventEmitter<void>();
  @Output() tareaCompuestaCreada = new EventEmitter<string>();

  taskTypes = Object.values(TaskType);
  viewSubTaskForm: boolean = false;

  constructor(
  private fb: FormBuilder,
  private taskService: TaskService,
  private taskEventService: TaskEventService,
){
    this.taskForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.maxLength(50)]],
      descripcion: ['', [Validators.required, Validators.maxLength(500)]],
      type: ['', [Validators.required]],
      startDate: ['', [Validators.required, noFechaPasadaValidator]],
      endDate: ['', Validators.required]
    }, { validators: fechaFinNoValidator });
    
  }

  ngOnInit(): void {

    this.taskForm.get('type')?.valueChanges.subscribe((newType: string) => {
      // Si está en modo edición y es una tarea compuesta con subtareas, no permitas cambiar a SIMPLE
      if (this.isEditMode && this.taskTieneSubtasks && newType === 'SIMPLE') {
        // Revertimos el cambio
        this.taskForm.patchValue({ type: 'COMPOSITE' });
        this.tipoActual = 'COMPOSITE';
        Swal.fire({
          icon: 'warning',
          title: 'No permitido',
          text: 'No puedes cambiar a tipo SIMPLE porque esta tarea ya tiene subtareas'
        });
        return;
      }

      // Si se cambia a COMPUESTA, limpia fechas
      if (newType === 'COMPOSITE') {
        this.taskForm.patchValue({
          startDate: null,
          endDate: null
        });
      }

      this.ajustarValidadoresPorTipo(newType)
      this.tipoActual = newType;
    });
    
    if (this.taskId) {
      this.isEditMode = true;
      this.loadTask();
      
    }
  }

  loadTask(): void {
    this.taskService.getTaskById(this.taskId!).subscribe(task => {
      const formatDate = (dateStr: string | null | undefined): string => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toISOString().split('T')[0]; // Devuelve 'YYYY-MM-DD'
      };

      this.taskForm.patchValue({
        titulo: task.titulo,
        descripcion: task.descripcion,
        type: task.type,
        startDate: formatDate(task.startDate),
        endDate: formatDate(task.endDate),
        
      });
        this.tipoActual = task.type;

        this.taskTieneSubtasks = Array.isArray(task.subtasks) && task.subtasks.length > 0;
        this.ajustarValidadoresPorTipo(task.type);
      });
  }

   get titulo() {
      return this.taskForm.get('titulo');
    }
    get descripcion() {
      return this.taskForm.get('descripcion');
    }

    get type() {
      return this.taskForm.get('type');
    }

   onCreateTask() {

    if (this.taskForm.invalid)  return 

    if(!this.isEditMode){

      const formData = this.taskForm.value;
      const tipoTarea = formData.type;
      
      if (!formData.startDate) delete formData.startDate;
      if (!formData.endDate) delete formData.endDate;

      const now = new Date();
      const createdAt = now.toLocaleString('sv-SE').replace(' ', 'T');

      const dataConFecha = {
        ...formData,
        createdAt
      };

      this.taskService.createTask(dataConFecha).subscribe({
        next: (response) => {
          this.backendErrors = '';
          
          if (tipoTarea === 'SIMPLE') {
            this.taskForm.reset();
            this.taskEventService.emitTaskCreated();
            this.cerrarModal(); 
            this.messageSuccess();
          } else {
            // Guarda ID u objeto de tarea creada
            const taskId = response.task.id;
            this.tareaCompuestaCreada.emit(taskId); 
            this.taskForm.reset();
            this.cerrarModal();
          }
        },
        error: (error) => {
          if (error.status === 400 && error.error?.message) {
            this.messageInvalid();
            this.backendErrors = error.error.message;
          } else {
            this.backendErrors = 'Ocurrió un error inesperado.';
          }
        }
      });

    } else {
      
     const formData = this.taskForm.value;
     const tipoTarea = formData.type;
     console.log('valores formulario', formData);
     
     
      if (tipoTarea === 'COMPOSITE') {
        formData.startDate = formData.startDate ? formData.startDate : null;
        formData.endDate = formData.endDate ? formData.endDate : null;
      }
      // Si es SIMPLE, elimina los campos si no tienen valor (como antes)
      else {
        if (!formData.startDate) delete formData.startDate;
        if (!formData.endDate) delete formData.endDate;
      }
      this.taskService.updateTask(this.taskId!, formData).subscribe({
        next: (response) => {
          if (tipoTarea === 'SIMPLE') {
            this.taskEventService.emitTaskCreated();
            this.cerrarModal(); 
            this.messageSuccess();
          } else {
            // Guarda ID u objeto de tarea creada 
            const taskId = this.taskId!;
            this.taskForm.reset();
            this.tareaCompuestaCreada.emit(taskId); 
            this.cerrarModal();
          }
        },
        error: (error) => {
          this.backendErrors = 'Ocurrió un error al actualizar la tarea.';
          console.error(error);
        }
      });
    }
  }

   cerrarModal() {
    this.cerrar.emit();
  }
  stopPropagation(event: MouseEvent){
    event.stopPropagation();
  }

  private ajustarValidadoresPorTipo(tipo: string) {
    if (tipo === 'COMPOSITE') {
      this.taskForm.get('startDate')?.clearValidators();
      this.taskForm.get('endDate')?.clearValidators();
    } else {
      this.taskForm.get('startDate')?.setValidators(Validators.required);
      this.taskForm.get('endDate')?.setValidators(Validators.required);
    }
    this.taskForm.get('startDate')?.updateValueAndValidity();
    this.taskForm.get('endDate')?.updateValueAndValidity();
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

  messageInvalid(){
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Solo puedes crear 4 tareas"
    });
  }
}
