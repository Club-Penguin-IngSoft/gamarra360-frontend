/**
 * Capa de acceso al backend para el módulo `usuario` (comerciantes/tiendas).
 * Conectado a los endpoints públicos del backend Spring Boot.
 */

import type { ITienda } from '../types/ITienda';
import type { Categoria } from '../types/IProducto';
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
  tiposProducto?: string[];  // Tipos de producto (Polos, Blusas, etc.)
}

/* ── Normaliza nombre de categoría DB → enum frontend ─────────────────── */
// Mismo algoritmo que mapearCategoria en catalogoService.ts

function normalizarCategoria(nombre: string): Categoria {
  const n = nombre
    .toUpperCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .replace(/\s+/g, '_');

  const tabla: Record<string, Categoria> = {
    HOMBRE:          'HOMBRE',
    MUJER:           'MUJER',
    NINOS:           'NINOS',
    NINO:            'NINOS',
    NINAS:           'NINOS',
    NINA:            'NINOS',
    INFANTIL:        'NINOS',
    UNISEX_ADULTOS:  'UNISEX_ADULTOS',
    UNISEX_ADULTO:   'UNISEX_ADULTOS',
    UNISEX:          'UNISEX_ADULTOS',
    UNISEX_NINOS:    'UNISEX_NINOS',
    UNISEX_NINO:     'UNISEX_NINOS',
  };

  return tabla[n] ?? 'HOMBRE';
}

/* ── Adaptador backend → ITienda ──────────────────────────────────────── */

function adaptarTienda(t: ITiendaBackend): ITienda {
  return {
    id: String(t.idTienda),
    nombre: t.nombreComercial,
    descripcion: t.informacion,
    logo: t.foto,
    verificada: t.verificada,
    // Normaliza "Hombre" → 'HOMBRE', "Mujer" → 'MUJER', etc.
    categorias: t.categorias?.map(normalizarCategoria) ?? [],
    tiposServicio: (t.tiposServicio as any) ?? ['COMPRA_DIRECTA'],
    tiposProducto: t.tiposProducto ?? [],
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

  // Filtrar por tipos de producto: la tienda debe vender AL MENOS UNO de los seleccionados
  if (filtros.tiposProducto && filtros.tiposProducto.length > 0) {
    resultado = resultado.filter((t) =>
      t.tiposProducto?.some((tp) => filtros.tiposProducto!.includes(tp)),
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
 * Obtiene tiendas destacadas: trae todas, baraja con semilla del día y devuelve 4.
 * Así cada día rotan CUÁLES tiendas aparecen (no solo el orden), igual que los productos.
 */
export async function listarTiendasDestacadas(): Promise<ITienda[]> {
  const tiendas = await listarTiendas();
  return shuffleDiario(tiendas).slice(0, 4);
}

/** Fisher-Yates determinista con semilla del día (YYYYMMDD). */
function shuffleDiario<T>(arr: T[]): T[] {
  const hoy = new Date();
  let seed =
    hoy.getFullYear() * 10000 +
    (hoy.getMonth() + 1) * 100 +
    hoy.getDate();
  const copia = [...arr];
  for (let i = copia.length - 1; i > 0; i--) {
    seed = Math.imul(seed, 1664525) + 1013904223;
    const j = Math.abs(seed) % (i + 1);
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/**
 * Obtiene el perfil público de una tienda por su ID.
 * Llamada a GET /tiendas/publico/{id}
 */
export async function obtenerTienda(id: string): Promise<ITienda> {
  const { data } = await apiClient.get<ITiendaBackend>(`/tiendas/publico/${id}`);
  return adaptarTienda(data);
}

export interface IMiTiendaResumen {
  idTienda: number;
  nombreComercial: string;
  ruc: string;
}

export async function obtenerMiTienda(): Promise<IMiTiendaResumen> {
  const { data } = await apiClient.get<IMiTiendaResumen>('/tiendas/mi-tienda');
  return data;
}
