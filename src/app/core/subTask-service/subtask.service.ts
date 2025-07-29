import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CreateSubTask } from '../../features/boards/subtask/interfaces/createSubtask.interface';
import { UpdateSubTask } from '../../features/boards/subtask/interfaces/updateSubTask.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SubtaskService {

  private apiUrl = environment.apiUrl;
  
    constructor(private http: HttpClient) { }
  
   createSubTask(data: CreateSubTask, taskId: string) {
    return this.http.post(`${this.apiUrl}/sub-task/create/${taskId}`, data);
  }

  updateSubTask(id: string, data: UpdateSubTask): Observable<UpdateSubTask> {
      return this.http.patch<UpdateSubTask>(`${this.apiUrl}/sub-task/update/${id}`, data);
  }

  deleteSubTask(id: string) {
    return this.http.delete(`${this.apiUrl}/sub-task/remove/${id}`);
  }
}
