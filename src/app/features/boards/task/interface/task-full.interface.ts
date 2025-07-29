import { Colaboradores } from "./colaborador.interface";
import { Task } from "./task.interface";


export interface TaskFull {
  tarea: Task;
  colaboradores: Colaboradores[];
}