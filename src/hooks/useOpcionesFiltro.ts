/**
 * Hook para obtener las opciones de filtros del catálogo desde el backend.
 *
 * Usa un caché a nivel de módulo para evitar múltiples llamadas a la API
 * cuando FilterPanel se monta en CatalogoPage y DetalleTiendaPage a la vez.
 * La primera llamada fetcha de /api/v1/productos/opciones-filtro; las
 * siguientes usan el resultado en memoria.
 */

import { useEffect, useState } from 'react';
import { obtenerOpcionesFiltro } from '../services/catalogoService';
import type { IOpcionesFiltro } from '../services/catalogoService';

const OPCIONES_VACIAS: IOpcionesFiltro = {
  colores: [],
  materiales: [],
  tallas: [],
  tiposProducto: [],
};

// Caché en módulo — se popula una sola vez por sesión de navegador
let cache: IOpcionesFiltro | null = null;
let promesaEnCurso: Promise<IOpcionesFiltro> | null = null;

export function useOpcionesFiltro(): IOpcionesFiltro {
  const [opciones, setOpciones] = useState<IOpcionesFiltro>(
    cache ?? OPCIONES_VACIAS,
  );

  useEffect(() => {
    // Si ya tenemos el caché, úsalo directamente (sin re-render extra)
    if (cache) {
      setOpciones(cache);
      return;
    }
    // Si hay una llamada en vuelo, adjúntate a ella
    if (!promesaEnCurso) {
      promesaEnCurso = obtenerOpcionesFiltro();
    }
    promesaEnCurso
      .then((data) => {
        cache = data;
        setOpciones(data);
      })
      .catch(() => {
        // Si falla la API, el panel queda con listas vacías (sin opciones visibles)
        // Esto es preferible a mostrar opciones que no coincidan con la BD.
      });
  }, []);

  return opciones;
}
