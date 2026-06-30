/**
 * Validaciones de documento de identidad y celular peruano.
 * Reglas de negocio:
 *  - DNI: exactamente 8 caracteres, estrictamente numérico.
 *  - Carné de Extranjería: entre 8 y 12 caracteres, alfanumérico.
 *  - Pasaporte: entre 6 y 12 caracteres, alfanumérico.
 *  - Celular: +51 seguido de 9 dígitos que empiezan con 9 (formato peruano).
 *    Acepta espacios intermedios, que se limpian antes de validar.
 */

export function validarDocumento(tipoDoc: string, numeroDoc: string): string | null {
  const valor = numeroDoc.trim();

  if (!valor) return 'El número de documento es obligatorio.';

  switch (tipoDoc) {
    case 'DNI':
      if (!/^\d{8}$/.test(valor)) {
        return 'El DNI debe tener exactamente 8 dígitos numéricos.';
      }
      return null;

    case 'Carnet de extranjería':
      if (!/^[A-Za-z0-9]{8,12}$/.test(valor)) {
        return 'El Carné de Extranjería debe tener entre 8 y 12 caracteres alfanuméricos.';
      }
      return null;

    case 'Pasaporte':
      if (!/^[A-Za-z0-9]{6,12}$/.test(valor)) {
        return 'El Pasaporte debe tener entre 6 y 12 caracteres alfanuméricos.';
      }
      return null;

    default:
      return 'Selecciona un tipo de documento válido.';
  }
}

export function validarCelularPeru(celular: string): string | null {
  const limpio = celular.replace(/\s+/g, '');

  if (!limpio) return 'El celular es obligatorio.';

  // Acepta tanto "+51999999999" como "999999999"
  if (!/^(\+51)?9\d{8}$/.test(limpio)) {
    return 'El celular debe tener 9 dígitos y empezar con 9 (ej. 999999999).';
  }

  return null;
}

/** Limpia espacios y normaliza el celular, agregando +51 si no lo tiene. */
export function limpiarCelular(celular: string): string {
  const sinEspacios = celular.replace(/\s+/g, '');
  return sinEspacios.startsWith('+51') ? sinEspacios : `+51${sinEspacios}`;
}