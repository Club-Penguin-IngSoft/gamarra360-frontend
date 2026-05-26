/**
 * Validación de formato de email — solo a nivel de UX (CLAUDE.md §4:
 * "Las validaciones del cliente nunca reemplazan las del servidor").
 */

const REGEX_EMAIL = /^[\w.+-]+@[\w-]+(\.[\w-]+)+$/;

export function validarEmail(correo: string): boolean {
  return REGEX_EMAIL.test(correo.trim());
}
