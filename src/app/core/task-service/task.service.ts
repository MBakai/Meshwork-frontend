import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Task } from './interfaces/task.interface';
import { CreateTask } from './interfaces/create-task.interface';
import { CreateTaskResponse } from './interfaces/create-task-response.interface';
import { Estado } from '../auth-service/interface/estados.interface';
import { TaskFull } from './interfaces/task-full.interface';
import { UpdateTask } from './interfaces/updateTask.inteface';
import { TaskColaborador } from './interfaces/task-colaborador.interface';

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

  getTaskkparcialColaborador(id: string): Observable<TaskColaborador> {
    return this.http.get<TaskColaborador>(`${this.apiUrl}/tasks/get-task-colab/${id}`);
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
