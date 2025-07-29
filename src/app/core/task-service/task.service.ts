import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Task } from '../../features/boards/task/interface/task.interface';
import { CreateTask } from '../../features/boards/task/interface/create-task.interface';
import { CreateTaskResponse } from '../../features/boards/task/interface/create-task-response.interface';
import { Estado } from '../../shared/interface/estados.interface';
import { TaskFull } from '../../features/boards/task/interface/task-full.interface';
import { UpdateTask } from '../../features/boards/task/interface/updateTask.inteface';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  createTask(data: CreateTask): Observable<CreateTaskResponse>{
    return this.http.post<CreateTaskResponse>(`${this.apiUrl}/tasks/create-task`, data);
  }

  updateTask(id: string, data: UpdateTask): Observable<UpdateTask> {
    return this.http.patch<UpdateTask>(`${this.apiUrl}/tasks/update-task/${id}`, data);
  }

  getTaskById(id: string): Observable<Task> {
    return this.http.get<Task>(`${this.apiUrl}/tasks/get-for-id/${id}`);
  }

  getTaskSimple(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.apiUrl}/tasks/listarTasks`);
  }

  getTaskFull(id: string): Observable<TaskFull> {
    return this.http.get<TaskFull>(`${this.apiUrl}/tasks/get-full/${id}`);
  }

  cambiarEstado(taskId: string, estadoId: number): Observable<any> {
    const url = `${this.apiUrl}/tasks/update-status/${taskId}`;
    return this.http.patch(url, { estadoId });
  }

  getStatus(): Observable<Estado[]>{
    return this.http.get<Estado[]>(`${this.apiUrl}/estados`);
  }

  deleteTask(id: string) {
    return this.http.delete(`${this.apiUrl}/tasks/remove/${id}`);
  }
}
