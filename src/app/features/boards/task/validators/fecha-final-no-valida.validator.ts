import { AbstractControl, ValidationErrors } from "@angular/forms";

export function fechaFinNoValidator(group: AbstractControl): ValidationErrors | null {
  const start = group.get('startDate')?.value;
  const end = group.get('endDate')?.value;

  // Si alguna está vacía, no validar
  if (!start || !end) return null;

  const startDate = new Date(start);
  const endDate = new Date(end);

  // Si alguna fecha es inválida (por null o mal formateada)
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return null;

  return endDate < startDate ? { fechaFinInvalida: true } : null;
}