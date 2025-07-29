import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class NotificacionesService {
  private socket!: Socket;
  private isConnected = false;
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  conectar(userId: string) {
    if (this.isConnected) return; // Evita reconexiones innecesarias

    this.socket = io(environment.apiSocket, {
      query: { userId },
      transports: ['websocket'], // Fuerza usar WebSocket
      reconnectionAttempts: 5, // Intentos de reconexión
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
      console.log('✅ Conectado al servidor WebSocket con el userID', userId );
    });

    this.socket.on('connect_error', (err) => {
      console.error('❌ Error de conexión WebSocket:', err.message);
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      console.log('⚠️ Desconectado del servidor WebSocket');
    });
  }

  escucharNotificaciones(): Observable<any> {
    return new Observable(observer => {
      this.socket?.on('notificacion', (data: any) => {
        observer.next(data);
      });
    });
  }

  obtenerMisNotificaciones(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/notificaciones/mis-notificaciones`);
  }

  obtenerNoLeidas(): Observable<{ noLeidas: number }>{
    return this.http.get<{ noLeidas: number }>(`${this.apiUrl}/notificaciones/contador`);
  }

  marcarComoTodasLeidas(): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/notificaciones/todas-leidas`, {});
  }

  marcarComoLeida(id: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/notificaciones/leida/${id}`, {});
  }

  desconectar() {
    if (this.socket) {
      this.socket.disconnect();
      this.isConnected = false;
    }
  }
}