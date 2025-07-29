export function calcularDiasRestantes(fechaFin: string | Date): number {
  const hoy = new Date();
  const fin = new Date(fechaFin);

  hoy.setHours(0, 0, 0, 0);
  fin.setHours(0, 0, 0, 0);

  return Math.ceil((fin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
}