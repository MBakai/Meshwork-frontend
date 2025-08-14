import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TaskService } from '../../../core/task-service/task.service';
import { Estado } from '../../../core/auth-service/interface/estados.interface';
import { SubtaskService } from '../../../core/subTask-service/subtask.service';
import { calcularDiasRestantes } from '../../../shared/utils/dias-restantes.utils';
import Swal from 'sweetalert2'
import { UpdateSubTask } from '../../../core/subTask-service/interfaces/updateSubTask.interface';
import { showTaskSuccess } from '../../../shared/utils/message-alerts.ts/message-alert-taskBoard';
import { Subtask } from '../../../core/subTask-service/interfaces/subtask.interface';
import { TaskColaborador } from '../../../core/task-service/interfaces/task-colaborador.interface';

interface SubtaskUIState {
  expandida: boolean;
}

@Component({
  selector: 'app-subtask-board-colaborador',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './subtask-board-colaborador.component.html',
  styleUrl: './subtask-board-colaborador.component.css'
})
export class SubtaskBoardColaboradorComponent {

  estados: Estado[] = [];
  subtasksColaborador!: TaskColaborador;
  subtareasUI: Record<string, SubtaskUIState> = {};
  subtaskId: string | null = '';

  constructor(private readonly route: ActivatedRoute,
    private readonly taskService: TaskService,
    private readonly subtaskService: SubtaskService,
  ){}

  ngOnInit(): void {
    this.subtaskId = this.route.snapshot.paramMap.get('id');

      if (this.subtaskId) {
        this.loadTaskColaborador(this.subtaskId);
    }

    this.loadEstados();
  }

  loadEstados(): void {
      this.taskService.getStatus().subscribe({
        next: (data) => {
          this.estados = data;
        },
        error: (err) => console.error('Error al cargar estados', err)
    });
  }

  loadTaskColaborador(subtaskId: string) {
    this.taskService.getTaskkparcialColaborador(subtaskId).subscribe({
      next: (data) => {
        this.subtasksColaborador = data;
        
        this.inicializarSubtareasUI();
        // this.inicializarFormulariosSubtareas();
      },
      error: (err) => {
        console.error('Error al recargar tareas:', err);
      }
    }); 
  }

  inicializarSubtareasUI() {
    this.subtasksColaborador.subtasks.forEach(sub => {
      this.subtareasUI[sub.id] = {
        expandida: false,
      };
    });
  }

  toggleSubtarea(id: string) {
    this.subtareasUI[id].expandida = !this.subtareasUI[id].expandida;
  }

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

        this.subtaskService.updateSubTask(sub.id, payload).subscribe({
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


  getDiasParaTarea(tarea: Subtask): string {
    if (!tarea.endDate) return '';
    const dias = calcularDiasRestantes(tarea.endDate);
    if (dias > 1) return `Faltan ${dias} días`;
    if (dias === 1) return 'Falta 1 día';
    if (dias === 0) return 'Vence hoy';
    return `Venció hace ${Math.abs(dias)} día(s)`;
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
    
}
