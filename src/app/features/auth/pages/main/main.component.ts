import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RegistroComponent } from '../registro/registro.component';
import { LoginComponent } from '../login/login.component';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    CommonModule,
    RegistroComponent,
    LoginComponent
    
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css',
})
export class MainComponent {

  mostrarLogin = false;

  constructor(
    private router: Router
  ){}

  registro(){
    this.router.navigate(['']);
  }

  abrirLogin() {
    this.mostrarLogin = true;
  }


}
