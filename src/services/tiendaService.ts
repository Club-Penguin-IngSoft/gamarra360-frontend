/**
 * Capa de acceso al backend para el módulo `usuario` (comerciantes/tiendas).
 * Conectado a los endpoints públicos del backend Spring Boot.
 */

import type { ITienda } from '../types/ITienda';
import type { IFiltrosTiendas } from '../types/IFiltro';
import apiClient from './apiClient';

/* ── Tipo que devuelve el backend ──────────────────────────────────────── */

interface ITiendaBackend {
  idTienda: number;
  nombreComercial: string;
  informacion?: string;
  foto: string;
  verificada?: boolean;
  categorias?: string[];     // Categorías que vende la tienda
  tiposServicio?: string[];  // Tipos de servicio que ofrece
}

/* ── Adaptador backend → ITienda ──────────────────────────────────────── */

function adaptarTienda(t: ITiendaBackend): ITienda {
  return {
    id: String(t.idTienda),
    nombre: t.nombreComercial,
    descripcion: t.informacion,
    //informacion: t.informacion,
    logo: t.foto,
    verificada: t.verificada,
    categorias: t.categorias as any, // Mapear al tipo Categoria[] del frontend
    tiposServicio: (t.tiposServicio as any) ?? ['COMPRA_DIRECTA'],
  };
}

/* ── Filtrado client-side para tiendas ────────────────────────────────── */

function aplicarFiltrosTiendaClienteSide(
  tiendas: ITienda[],
  filtros: Partial<IFiltrosTiendas>,
): ITienda[] {
  let resultado = tiendas;

  // Filtrar por categorías: la tienda debe tener AL MENOS UNA categoría que coincida
  if (filtros.categorias && filtros.categorias.length > 0) {
    resultado = resultado.filter((t) =>
      t.categorias?.some((c) => filtros.categorias!.includes(c)),
    );
  }

  // Filtrar por tipo de servicio: la tienda debe tener AL MENOS UN tipo que coincida
  if (filtros.tipoServicio) {
    resultado = resultado.filter((t) =>
      t.tiposServicio?.includes(filtros.tipoServicio!),
    );
  }

  // Filtrar por galería (si se envía)
  if (filtros.galeria) {
    resultado = resultado.filter((t) => t.galeria === filtros.galeria);
  }

  return resultado;
}

/**
 * Lista todas las tiendas del directorio (endpoint público).
 * Llamada a GET /tiendas/publico
 * Los filtros se aplican client-side.
 */
export async function listarTiendas(
  filtros?: Partial<IFiltrosTiendas>,
): Promise<ITienda[]> {
  const { data } = await apiClient.get<ITiendaBackend[]>('/tiendas/publico');
  const tiendas = data.map(adaptarTienda);
  return filtros ? aplicarFiltrosTiendaClienteSide(tiendas, filtros) : tiendas;
}

/**
 * Obtiene tiendas destacadas (temporalmente trae todas y retorna los primeros 4).
 * Cuando el backend implemente /tiendas/publico/destacadas, cambiar aquí.
 */
export async function listarTiendasDestacadas(): Promise<ITienda[]> {
  const tiendas = await listarTiendas();
  return tiendas.slice(0, 4);
}

/**
 * Obtiene el perfil público de una tienda por su ID.
 * Llamada a GET /tiendas/publico/{id}
 */
export async function obtenerTienda(id: string): Promise<ITienda> {
  const { data } = await apiClient.get<ITiendaBackend>(`/tiendas/publico/${id}`);
  return adaptarTienda(data);
}
