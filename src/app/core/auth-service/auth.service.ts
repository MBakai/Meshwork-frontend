import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, map, Observable } from 'rxjs';

import { User } from '../../shared/interface/user.interface';
import { environment } from '../../../environments/environment';
import { LoginRequest } from '../../shared/interface/login.interface';
import { AuthResponse } from '../../shared/interface/auth-response.interface';
import { ResetPassword } from '../../shared/interface/reset-password.interface';
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private apiUrl = environment.apiUrl; // http://localhost:3000

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    
    const isBrowser = typeof window !== 'undefined';

    const storedUser = isBrowser ? localStorage.getItem('currentUser') : null;
    const parsedUser = storedUser && storedUser !== 'undefined' ? JSON.parse(storedUser) : null;
    this.currentUserSubject = new BehaviorSubject<User | null>(parsedUser);

    this.currentUser = this.currentUserSubject.asObservable();
  }
  register(userData: User): Observable<any> {
    return this.http.post(`${this.apiUrl}/user/register`, userData);
  }

  login(credentials: LoginRequest) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/user/login`, credentials, {
      withCredentials: true
    }).pipe(
        map(response => {
          // Guardar el token y usuario en localStorage
          localStorage.setItem('access_token', response.access_token);
          localStorage.setItem('currentUser', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
          return response;
        })
      );
  }

  verifyAccount(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/send-email/mail-account?token=${token}`);
  }
  
  forgorPassword(email: string){
    return this.http.post(`${this.apiUrl}/user/forgot-password`, email);
  }

  verifyPasswordToken(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/verify-token?token=${token}`);
  }

  resetPassword(data: ResetPassword) {
    return this.http.post(`${this.apiUrl}/user/reset-password`, data);
  }


  logout(): void {
    // Remover datos del localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('currentUser');

    this.currentUserSubject.next(null);
    
    this.router.navigate(['']);
  }

  refreshToken(): Observable<string> {
    return this.http.post<{ access_token: string }>(
      `${this.apiUrl}/user/refresh`,{},{ withCredentials: true })
      .pipe(
      map(response => {
        const token = response.access_token;
        this.saveAccessToken(token); 
        return token;
      })
    );
  }

  saveAccessToken(token: string) {
    localStorage.setItem('access_token', token);
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }
  
  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp;
      const now = Math.floor(Date.now() / 1000);
      return exp > now;
    } catch (e) {
      return false;
    }
  }


}
