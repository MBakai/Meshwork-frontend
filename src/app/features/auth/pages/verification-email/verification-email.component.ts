import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../core/auth-service/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-verification-email',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './verification-email.component.html',
  styleUrl: './verification-email.component.css'
})
export class VerificationEmailComponent {

  loading = true;
  success = false;
  error = '';
  countdown = 3;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Obtener el token de la URL
    const token = this.route.snapshot.queryParams['token'];
    
    if (token) {
      this.verifyAccount(token);
    } else {
      this.error = 'Token de verificación no encontrado';
      this.loading = false;
    }
  }

  verifyAccount(token: string): void {
    this.authService.verifyAccount(token).subscribe({
      next: (response) => {
        this.success = true;
        this.loading = false;
        this.startCountdown();
      },
      error: (error) => {
        this.error = error.error.message || 'Error al verificar la cuenta';
        this.loading = false;
      }
    });
  }

  startCountdown(): void {
    const interval = setInterval(() => {
      this.countdown--;
      
      if (this.countdown <= 0) {
        clearInterval(interval);
        this.router.navigate(['']);
      }
    }, 1000); // Ejecutar cada segundo
  }

  goToLogin(): void {
    this.router.navigate(['']);
  }

}
