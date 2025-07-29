import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/auth-service/auth.service';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent {

  resetForm!: FormGroup;
  mostrarPassword = false;
  mostrarConfirmPassword = false;

  token!: string;
  tokenValido = false;
  cargando = true;

  constructor(
      private router: Router,
      private authService: AuthService,
      private fb: FormBuilder,
      private route: ActivatedRoute
    ){}

  ngOnInit(): void {
        // Leer token desde URL
    this.token = this.route.snapshot.queryParamMap.get('token') || '';

    if (!this.token) {
      Swal.fire('Error', 'Token no encontrado en la URL.', 'error');
      this.router.navigate(['']);
      return;
    }

    // Verificar token
    this.authService.verifyPasswordToken(this.token).subscribe({
      next: () => {
        this.tokenValido = true;
        this.initForm();
        this.cargando = false;
      },
      error: () => {
        this.tokenValido = false;
        this.cargando = false;
        Swal.fire('Token inválido', 'El enlace ha expirado o ya fue utilizado.', 'error');
        this.router.navigate(['']);
      }
    });
  }

  initForm() {
    this.resetForm = this.fb.group({
      password: ['', [
        Validators.required,
        Validators.minLength(6),
        this.validarFortalezaPassword
      ]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.validarPasswordsCoinciden
    });

    this.resetForm.get('password')?.valueChanges.subscribe(() => {
      this.resetForm.get('confirmPassword')?.updateValueAndValidity();
    });
  }

  private validarPasswordsCoinciden(formGroup: AbstractControl): ValidationErrors | null {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    
    if (password && confirmPassword && password !== confirmPassword) {
      // Agregamos el error al control confirmPassword
      formGroup.get('confirmPassword')?.setErrors({ passwordNoCoincide: true });
      return { passwordsNoCoinciden: true };
    } else {
      // Limpiamos el error si las contraseñas coinciden
      const confirmPasswordControl = formGroup.get('confirmPassword');
      if (confirmPasswordControl?.hasError('passwordNoCoincide')) {
        delete confirmPasswordControl.errors!['passwordNoCoincide'];
        if (Object.keys(confirmPasswordControl.errors || {}).length === 0) {
          confirmPasswordControl.setErrors(null);
        }
      }
    }
    
    return null;
  }

  private validarFortalezaPassword(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const errors: any = {};

    // Al menos una mayúscula
    if (!/[A-Z]/.test(value)) {
      errors.sinMayuscula = true;
    }

    // Al menos una minúscula
    if (!/[a-z]/.test(value)) {
      errors.sinMinuscula = true;
    }

    // Al menos un número
    if (!/\d/.test(value)) {
      errors.sinNumero = true;
    }

    // Al menos un carácter especial
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
      errors.sinCaracterEspecial = true;
    }

    return Object.keys(errors).length > 0 ? errors : null;
  }

  get passwordsCoinciden(): boolean {
    const password = this.password?.value;
    const confirmPassword = this.confirmPassword?.value;
    return password === confirmPassword && password && confirmPassword;
  }
  togglePasswordVisibility(): void {
      this.mostrarPassword = !this.mostrarPassword;
    }

    toggleConfirmPasswordVisibility(): void{
      this.mostrarConfirmPassword = !this.mostrarConfirmPassword;
    }

  get password() {
    return this.resetForm.get('password');
  }
  get confirmPassword() {
    return this.resetForm.get('confirmPassword');
  }

  onChangePassword() {
    if (this.resetForm.invalid || !this.token) return;

    const { password } = this.resetForm.value;

    console.log('Este es el token:',this.token, 'Esta es la contraseña: ',this.password?.value);
    
    this.authService.resetPassword({
      token: this.token,
      newPassword: password
    }).subscribe({
      next: () => {
        Swal.fire('¡Éxito!', 'Tu contraseña ha sido restablecida.', 'success');
        this.router.navigate(['']);
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Error', 'No se pudo restablecer la contraseña.', 'error');
      }
    });
  }
}
