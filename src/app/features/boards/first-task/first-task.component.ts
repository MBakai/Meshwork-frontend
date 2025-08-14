import { Component } from '@angular/core';
import { TaskComponent } from "../task/task.component";
import { CommonModule } from '@angular/common';
import { SubtaskComponent } from "../subtask/subtask.component";

@Component({
  selector: 'app-first-task',
  standalone: true,
  imports: [CommonModule, TaskComponent, SubtaskComponent],
  templateUrl: './first-task.component.html',
  styleUrl: './first-task.component.css'
})
export class FirstTaskComponent {

  viewCreateTask = false;
  viewCreateSubtask = false;
  idTaskPadre: string | null = null;

  createTask(){
    this.viewCreateTask = true;
  }
  createSubTask(taskId: string){
    this.idTaskPadre = taskId;
    this.viewCreateSubtask = true;
  }

}
