import { Task } from "./task.interface";

export interface CreateTaskResponse {
  message: string;
  task: Task;
}