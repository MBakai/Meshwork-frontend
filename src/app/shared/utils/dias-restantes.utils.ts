export function calcularDiasRestantes(fechaFin: string | Date): number {
  const hoy = new Date();
  // Convertir a formato local si es string (ej: "2025/08/13")
  const fin = typeof fechaFin === "string" ? new Date(fechaFin.replace(/-/g, "/")) : new Date(fechaFin);

  hoy.setHours(0, 0, 0, 0);
  fin.setHours(0, 0, 0, 0);

  return Math.ceil((fin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
}