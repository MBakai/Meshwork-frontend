// Puedes mover esto a un archivo shared/utils o service general
import Swal from 'sweetalert2'

type TaskAction =
  | 'create'
  | 'edit'
  | 'update-date'
  | 'add-collaborator'
  | 'remove-collaborator'
  | 'task-completed';

const successMessages: Record<TaskAction, string> = {
  create: 'Tarea creada correctamente',
  edit: 'Tarea actualizada correctamente',
  'update-date': 'Fechas actualizadas correctamente',
  'add-collaborator': 'Colaborador asignado correctamente',
  'remove-collaborator': 'Colaborador desasignado correctamente',
  'task-completed': 'Tarea finalizada',
};

export function showTaskSuccess(action: TaskAction) {
  Swal.fire({
    position: 'center',
    icon: 'success',
    title: successMessages[action],
    showConfirmButton: false,
    timer: 1000,
  });
}
