import { AbstractControl, ValidationErrors } from '@angular/forms';

export function noFechaPasadaValidator(control: AbstractControl): ValidationErrors | null {
  const valor: string = control.value;
  if (!valor) return null;

  const [year, month, day] = valor.split('-').map(Number);
  const fechaIngresada = new Date(year, month - 1, day); // 👈 Esto sí es local
  fechaIngresada.setHours(0, 0, 0, 0);

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  return fechaIngresada < hoy ? { fechaPasada: true } : null;
}