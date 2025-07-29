import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../../core/auth-service/auth.service';
import Swal from 'sweetalert2'

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {

  submitted = false;
  
  @Output() cerrar = new EventEmitter<void>();

  loginForm: FormGroup;
  mostrarPassword: boolean = false
  modoRecoveryPassword = false;

  private readonly router = inject(Router); 
  
  constructor(
    private fb: FormBuilder, 
    private routerUser: Router,
    private authService: AuthService,
  ) 
  {

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

    get email() {
      return this.loginForm.get('email');
    }
    get password() {
      return this.loginForm.get('password');
    }

  togglePasswordVisibility(): void {
    this.mostrarPassword = !this.mostrarPassword;
  }

  onLogin(): void {

    this.submitted = true;

    if (this.modoRecoveryPassword) {
    this.onRecoverPassword();
    return;
  }

    if (this.loginForm.invalid) {
      return;
    }

    const { email, password } = this.loginForm.value;

    this.authService.login({ email, password }).subscribe({
      next: () => {
        // Mostrar mensaje de éxito
        Swal.fire({
          icon: 'success',
          title: 'Bienvenido',
          text: 'Inicio de sesión exitoso',
          timer: 1500,
          showConfirmButton: false
        });

        // Redirigir después de un pequeño delay
        setTimeout(() => {
          this.router.navigate(['/dashboard'], { replaceUrl: true });
        }, 1600); // Espera que el Swal se cierre
      },
      error: (err) => {
        const mensaje = err.error?.message || 'Error inesperado';
        const code = err.error?.Code;

        if (err.status === 401) {
          switch (code) {
            case 'INVALID_CREDENTIALS':
              Swal.fire('Credenciales incorrectas', 'Por favor verifica tu correo o contraseña.', 'error');
              break;
            case 'ACCOUNT_DISABLED':
              Swal.fire('Cuenta deshabilitada', 'Tu cuenta ya no está activa.', 'warning');
              break;
            case 'ACCOUNT_NOT_VERIFIED':
              Swal.fire('Cuenta no verificada', 'Debes verificar tu correo electrónico para continuar.', 'info');
              break;
            default:
              Swal.fire('Error', mensaje, 'error');
              break;
          }
        } else {
          Swal.fire('Error', 'Ocurrió un error inesperado al iniciar sesión', 'error');
        }
      }
    });
  }

  toggleForgotPasswordMode() {
    this.modoRecoveryPassword = !this.modoRecoveryPassword;
  }

  onRecoverPassword() {
    const email = this.loginForm.get('email')?.value;

    if (!email) return;

    this.authService.forgorPassword(email).subscribe({
      next: () => {

        Swal.fire({
          icon: 'success',
          title: 'Correo enviado',
          text: `Se ha enviado un enlace de recuperación a ${email}`,
          confirmButtonText: 'Aceptar'
        });
      },
      error: (err) => {
        const mensaje = err.error?.message || 'Error inesperado';
        const code = err.error?.Code;

        if (err.status === 401) {
          switch (code) {
            case 'ACCOUNT_DISABLED':
              Swal.fire('Cuenta deshabilitada', 'Tu cuenta ya no está activa.', 'warning');
              break;
            case 'ACCOUNT_NOT_VERIFIED':
              Swal.fire('Cuenta no verificada', 'Debes verificar tu correo electrónico para continuar.', 'info');
              break;
            default:
              Swal.fire('Error', mensaje, 'error');
              break;
          }
        } else {
          Swal.fire('Error', 'Ocurrió un error inesperado al iniciar sesión', 'error');
        }
      }
    })


    // Opcional: volver al modo login después de mostrar el mensaje
    this.modoRecoveryPassword = false;

    // También podrías limpiar el formulario
    this.loginForm.reset();
  }


  cerrarModal() {
    this.cerrar.emit();
  }
  stopPropagation(event: MouseEvent){
    event.stopPropagation();
  }

}
