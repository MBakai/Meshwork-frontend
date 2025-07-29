import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/auth-service/auth.service';
import { MessegeRegisterModalComponent } from '../messege-register-modal/messege-register-modal.component';
import Swal from 'sweetalert2'

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MessegeRegisterModalComponent
  ],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent implements OnInit {

  loading: boolean = false;
  success: boolean= false;
  submitted: boolean = false;
  mostrarPassword: boolean = false
  mostrarConfirmPassword: boolean = false
  registroForm!: FormGroup;
  showVerificationModal = false;
  registeredEmail = '';
  backendErrors = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private fb: FormBuilder
  ){}

    ngOnInit(): void {
      
      this.registroForm = this.fb.group({
          nombre: ['', [Validators.required]],
          email: ['', [Validators.required, Validators.email]],
          id_genero: ['', [Validators.required]],
          password: ['', [
            Validators.required, 
            Validators.minLength(6),
            this.validarFortalezaPassword // Opcional: validar fortaleza
          ]],
          confirmPassword: ['', [Validators.required]]
        }, { 
          validators: this.validarPasswordsCoinciden // Validador a nivel de FormGroup
      });

      this.registroForm.get('password')?.valueChanges.subscribe(() => {
        this.registroForm.get('confirmPassword')?.updateValueAndValidity();
      });
    }

  

   // Validador a nivel de FormGroup
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

    // Validador opcional para fortaleza de contraseña
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

    get nombre() {
      return this.registroForm.get('nombre');
    }
    get id_genero() {
       return this.registroForm.get('id_genero'); 
    }
    get email() {
      return this.registroForm.get('email');
    }
    get password() {
      return this.registroForm.get('password');
    }
    get confirmPassword() {
      return this.registroForm.get('confirmPassword');
    }
  
    generos = [
      { value: 1, viewValue: 'Masculino' },
      { value: 2, viewValue: 'Femenino' },
      { value: 3, viewValue: 'Otro' }
    ];

  async onRegister() {

    if (this.registroForm.valid) {


      const formData = {
        ...this.registroForm.value,
        id_genero: Number(this.registroForm.value.id_genero), // <-- convertir a número
      };
      this.authService.register(formData).subscribe({
        next:(response) => { 
          this.success = true;
          this.loading = false;

          console.log('Formulario válido:', this.registroForm.value);

          this.registeredEmail = this.registroForm.value.email;
          this.showVerificationModal = true;
          
        },
        error: (error) => {
          console.error('Error del backend:', error);
          if (error.status === 400) {
            this.backendErrors = error.error.message;
          }
        }
      });

    } else {
      console.log('Formulario inválido');
      this.marcarTodosTocados();
    }

    
  }

  private marcarTodosTocados() {
    Object.keys(this.registroForm.controls).forEach(key => {
      this.registroForm.get(key)?.markAsTouched();
    });
  }

  closeVerificationModal() { 
    this.showVerificationModal = false;
  }


  messageSuccess(){
      Swal.fire({
        position: "center",
        icon: "success",
        title: "Bienvenido",
        showConfirmButton: false,
        timer: 1500
      });
    }

}
