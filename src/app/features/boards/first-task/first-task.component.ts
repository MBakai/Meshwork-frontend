import { Component } from '@angular/core';
import { TaskComponent } from "../task/task.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-first-task',
  standalone: true,
  imports: [CommonModule, TaskComponent],
  templateUrl: './first-task.component.html',
  styleUrl: './first-task.component.css'
})
export class FirstTaskComponent {

  viewCreateTask = false;

  createTask(){
    this.viewCreateTask = true;
  }

}
