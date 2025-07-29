import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskEventService {

  private taskCreated = new BehaviorSubject<void>(undefined);
  private subTaskCreated = new BehaviorSubject<void>(undefined);

  subTaskCreate$ = this.subTaskCreated.asObservable();
  taskCreated$ = this.taskCreated.asObservable();

  emitTaskCreated() {
    this.taskCreated.next();
  }
  emitSubTaskCreated(){
    this.subTaskCreated.next();
  }
}
