
import { Subtask } from "../../subTask-service/interfaces/subtask.interface";
import { TaskType } from "./type.enum";


export interface Task {
  id: string;
  titulo: string;
  descripcion: string;
  type: TaskType;
  estados?: {
    id: number;
    nombre: string;
  };
  subtasks: Subtask[];
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}