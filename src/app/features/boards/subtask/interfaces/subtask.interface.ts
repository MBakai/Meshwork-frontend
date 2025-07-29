import { User } from "../../../../shared/interface/user.interface";
import { Task } from "../../task/interface/task.interface";

export interface Subtask {
  id: string;
  titulo: string;
  descripcion: string | null;
  estados?: {
    id: number;
    nombre: string;
  };        
  task?: Task;               
  asignados: {
    id: string;
    nombre: string;
  }[];
  startDate: string | null;   
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}
