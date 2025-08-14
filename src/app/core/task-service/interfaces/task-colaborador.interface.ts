import { Subtask } from '../../subTask-service/interfaces/subtask.interface';

interface Estado {
  id: number;
  nombre: string;
}

interface UsuarioAsignado {
  nombre: string;
}

interface SubTask {
  id: string;
  titulo: string;
  descripcion: string;
  estados: Estado;
  startDate: string;
  endDate: string;
  asignados: UsuarioAsignado[];
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface TaskColaborador{
    id: string,
    titulo: string,
    descripcion: string,
    subtasks: SubTask[]
}