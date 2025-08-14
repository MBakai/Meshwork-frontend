import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { Notificaciones } from '../../core/notificaciones/interfaces/notificaciones.interface';
import { NotificacionesService } from '../../core/notificaciones/notificaciones.service';
import { ColaboradorService } from '../../core/colaborador-service/colaborador.service';

@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notificaciones.component.html',
  styleUrl: './notificaciones.component.css'
})
export class NotificacionesComponent {

  @Input() notificaciones: Notificaciones[] = [];
  @Input() cargando: boolean = false;
  
  @Output() cerrar = new EventEmitter<void>();
  @Output() marcarTodasLeidas = new EventEmitter<void>();
  @Output() notificacionClick = new EventEmitter<Notificaciones>();
  @Output() solicitudAceptada = new EventEmitter<Notificaciones>();
  @Output() solicitudRechazada = new EventEmitter<Notificaciones>();

  userId: string = '';

  constructor(private readonly colaboradorService: ColaboradorService,
      private readonly notificacionesService: NotificacionesService
  ){}

  OnInit(){
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      const user = JSON.parse(userData);
      this.userId = user.id || '';
    }
  }

  /**
   * Formatea la fecha de la notificación
   */
  formatearFecha(fecha: Date | string): string {
    if (!fecha) return '';
    
    const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
    const ahora = new Date();
    const diferencia = ahora.getTime() - fechaObj.getTime();
    
    const minutos = Math.floor(diferencia / (1000 * 60));
    const horas = Math.floor(diferencia / (1000 * 60 * 60));
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    
    if (minutos < 1) {
      return 'Ahora';
    } else if (minutos < 60) {
      return `Hace ${minutos} min`;
    } else if (horas < 24) {
      return `Hace ${horas}h`;
    } else if (dias < 7) {
      return `Hace ${dias}d`;
    } else {
      return fechaObj.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short'
      });
    }
  }

  /**
   * Verifica si hay notificaciones no leídas
   */
  tieneNoLeidas(): boolean {
    return this.notificaciones.some(noti => !noti.leida);
  }

  /**
   * Marca una notificación como leída
   */
  marcarComoLeida(notificacion: Notificaciones): void {

    if (!notificacion.leida) {
      this.notificacionesService.marcarComoLeida(notificacion.id).subscribe({
        next: () => {
          notificacion.leida = true;
          this.notificacionClick.emit(notificacion);
        },
        error: (err) => {
          console.error('Error al marcar como leída:', err);
        }
      });
    }
  }

  /**
   * Marca todas las notificaciones como leídas
   */
  marcarTodasComoLeidas(): void {
    this.notificacionesService.marcarComoTodasLeidas().subscribe({
      next:()=>{
        this.notificaciones.forEach(noti => {
          noti.leida = true;
        });
        this.marcarTodasLeidas.emit();
      }
    })
  }

  /**
   * Acepta una solicitud de colaboración
   */
  aceptarSolicitud(notificacion: Notificaciones, event: Event): void {

    this.colaboradorService.aceptarSolicitud(notificacion.data.solicitudId).subscribe({
      next:()=>{
        event.stopPropagation();
        this.solicitudAceptada.emit(notificacion);
      },
       error: (err) => {
        console.error('Error al aceptar la notificacion:', err);
      }
    })

  }

  /**
   * Rechaza una solicitud de colaboración
   */
  rechazarSolicitud(notificacion: Notificaciones, event: Event): void {

    this.colaboradorService.rechazarSolicitud(notificacion.data.solicitudId).subscribe({
      next:()=>{
        event.stopPropagation();
        this.solicitudRechazada.emit(notificacion);
      },
       error: (err) => {
        console.error('Error al aceptar la notificacion:', err);
      }
    })
  }

  /**
   * Cierra el panel de notificaciones
   */
  cerrarPanel(): void {
    const panel = document.querySelector('.panel-notificaciones');
    if (panel) {
        panel.classList.add('cerrando');
        setTimeout(() => this.cerrar.emit(), 300); // Espera a que termine la animación
    }
  }
}
