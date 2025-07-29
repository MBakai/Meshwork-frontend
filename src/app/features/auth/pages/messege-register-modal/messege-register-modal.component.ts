import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-messege-register-modal',
  standalone: true,
  imports: [ CommonModule  ],
  templateUrl: './messege-register-modal.component.html',
  styleUrl: './messege-register-modal.component.css'
})
export class MessegeRegisterModalComponent {

  @Input() isVisible: boolean = false;
  @Input() userEmail: string = '';
  @Output() close = new EventEmitter<void>();
  // @Output() resend = new EventEmitter<void>();

   closeModal() {
    this.close.emit();
  }

  // resendEmail() {
  //   this.resend.emit();
  // }

}
