import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Task } from '../task/interface/task.interface';
import { fechaFinNoValidator } from '../task/validators/fecha-final-no-valida.validator';
import { noFechaPasadaValidator } from '../task/validators/fecha-inicio-no-valida.validator';
import { SubtaskService } from '../../../core/subTask-service/subtask.service';
import { TaskEventService } from '../../../core/eventos-service/task-event.service';
import { CreateSubTask } from './interfaces/createSubtask.interface';
import Swal from 'sweetalert2'

@Component({
  selector: 'app-subtask',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule
  ],
  templateUrl: './subtask.component.html',
  styleUrl: './subtask.component.css'
})
export class SubtaskComponent {

  subTaskForm: FormGroup;
  backendErrors = '';
  tasks: Task[] = [];
  @Output() cerrar = new EventEmitter<void>();

  viewSubTaskForm: boolean = false;
  @Input() cerrarAlClickAfuera: boolean = true;
  @Input() taskId!: string;

   constructor(
      private fb: FormBuilder,
      private subTaskService: SubtaskService,
      private taskEventService: TaskEventService,
      private elRef: ElementRef
    ){
       this.subTaskForm = this.fb.group({
            titulo: ['', [Validators.required, Validators.maxLength(50)]], 
            descripcion: ['', [Validators.required, Validators.maxLength(500)]],
            startDate: ['',[Validators.required,noFechaPasadaValidator]],
            endDate: ['', Validators.required ]
          }, { validators: fechaFinNoValidator });
    }

  get titulo() {
    return this.subTaskForm.get('titulo');
  }
  get descripcion() {
    return this.subTaskForm.get('descripcion');
  } 


  onCreateSubTask() {
    if (this.subTaskForm.valid) {

      const { titulo, descripcion, startDate, endDate } = this.subTaskForm.value;

      const subtaskData: CreateSubTask = {
        titulo,
        descripcion,
        startDate,
        endDate
      };

      this.subTaskService.createSubTask(subtaskData, this.taskId).subscribe({
        next: () => {
          this.taskEventService.emitSubTaskCreated();
          this.subTaskForm.reset();
          this.cerrarFormulario();
          this.messageSuccess();
        },
        error: (err) => {
          this.messageInvalid();
          this.cerrarFormulario();
          console.error('Error al crear subtarea:', err);
        }
      });
    } else {
      this.subTaskForm.markAllAsTouched();
    }
  }

  cerrarFormulario() {
    this.cerrar.emit();
  }

  @HostListener('document:click', ['$event.target'])
    public onClickFuera(target: HTMLElement) {
      if (!this.cerrarAlClickAfuera) return;

      const clicDentro = this.elRef.nativeElement.contains(target);
      if (!clicDentro) {
        this.cerrar.emit(); 
      }
  }
  
  messageSuccess(){
    Swal.fire({
      position: "center",
      icon: "success",
      title: "Tarea creada correctamente",
      showConfirmButton: false,
      timer: 1500
    });
  }

  messageInvalid(){
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Solo puedes crear 5 subtareas para esta tarea"
    });
  }
}