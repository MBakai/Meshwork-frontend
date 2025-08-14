
import { Task } from "../../task-service/interfaces/task.interface";

export interface Subtask {
  id: string;
  titulo: string;
  descripcion: string | null;
  estados?: {
    id: number;
    nombre: string;
  };                      
  asignados: {
    id?: string;
    nombre: string;
  }[];
  startDate: string | null;   
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  diasRestantesTexto?: string
}
