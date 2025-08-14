import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { subtaskResponse } from '../../../core/subTask-service/interfaces/subtask-response.interface';

@Component({
  selector: 'app-subtask-asign',
  standalone: true,
  imports: [CommonModule,],
  templateUrl: './subtask-asign.component.html',
  styleUrl: './subtask-asign.component.css'
})

export class SubtaskAsignComponent implements OnInit, OnDestroy {

  @Input() isVisible: boolean = false;
  @Input() subtasks: subtaskResponse[] = [];
  @Output() cerrar = new EventEmitter<void>();
  @Output() closeMenu = new EventEmitter<void>();
  
  cargando: boolean = true;

  constructor(private router: Router) {}

  ngOnInit() {
    // Simular carga de datos
    setTimeout(() => {
      this.cargando = false;
    }, 500);

    // Escuchar eventos de teclado para cerrar con Escape
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  ngOnDestroy() {
    document.removeEventListener('keydown', this.handleKeyDown.bind(this));
  }

  /**
   * Maneja la pulsación de teclas
   */
  private handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape' && this.isVisible) {
      this.cerrarPanel();
    }
  }

  /**
   * Cierra el panel
   */
  cerrarPanel() {
    this.cerrar.emit();
    this.closeMenu.emit();
  }

  /**
   * Ver detalle de la subtarea (click en el item)
   */
  verDetalleSubtarea(subtask: subtaskResponse) {
    console.log('Ver detalle de subtarea:', subtask);
    // Aquí puedes implementar la lógica para mostrar el detalle
    // Por ejemplo, abrir un modal o navegar a una página específica
  }

  /**
   * Ver tarea completa (click en "Ver tarea completa")
   */
  viewTaskDetail(subtaskId: string, event?: Event) {
    if (event) {
      event.stopPropagation(); // Evitar que se ejecute el click del item padre
    }
    
    console.log('Navegando a tarea:', subtaskId);
    // Cerrar el panel antes de navegar
    this.cerrarPanel();
  
    // Navegar a la tarea
    this.router.navigate(['/dashboard/subtask-board-colaborador', subtaskId]);
  }

  /**
   * Obtiene la clase CSS según el estado de la subtarea
   */
  getSubtaskClass(subtask: subtaskResponse): string {
    let classes = 'subtask-item';  
    // Aquí puedes agregar más lógica para diferentes estados
    return classes;
  }

  /**
   * Formatea la fecha de asignación
   */
  formatearFecha(fecha: Date): string {
    if (!fecha) return '';
    
    const ahora = new Date();
    const fechaAsignacion = new Date(fecha);
    const diferencia = ahora.getTime() - fechaAsignacion.getTime();
    const dias = Math.floor(diferencia / (1000 * 3600 * 24));
    const horas = Math.floor(diferencia / (1000 * 3600));
    const minutos = Math.floor(diferencia / (1000 * 60));

    if (dias > 0) {
      return `hace ${dias} día${dias !== 1 ? 's' : ''}`;
    } else if (horas > 0) {
      return `hace ${horas} hora${horas !== 1 ? 's' : ''}`;
    } else if (minutos > 0) {
      return `hace ${minutos} minuto${minutos !== 1 ? 's' : ''}`;
    } else {
      return 'hace un momento';
    }
  }

  /**
   * Obtiene el icono según el tipo de subtarea
   */
 
}
