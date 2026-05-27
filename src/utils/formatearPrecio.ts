/**
 * Formatea un precio en Soles peruanos (PEN) con el formato `S/ 0.00`.
 *
 * @example formatearPrecio(40)      // "S/ 40.00"
 * @example formatearPrecio(40.5)    // "S/ 40.50"
 * @example formatearPrecio(undefined) // "Bajo Pedido"
 */
export function formatearPrecio(precio: number | undefined | null): string {
  if (precio === undefined || precio === null) return 'Bajo Pedido';
  return `S/ ${precio.toFixed(2)}`;
}

/**
 * Calcula el porcentaje de descuento entre un precio base y un precio final.
 * Retorna 0 si no hay descuento o si los precios no son válidos.
 *
 * @example calcularDescuento(450, 405) // 10
 */
export function calcularDescuento(
  precioBase: number | undefined,
  precioFinal: number | undefined,
): number {
  if (!precioBase || !precioFinal || precioBase <= 0) return 0;
  if (precioFinal >= precioBase) return 0;
  return Math.round(((precioBase - precioFinal) / precioBase) * 100);
}
