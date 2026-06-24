/**
 * Capa de acceso al backend para el módulo `usuario` (comerciantes/tiendas).
 * Conectado a los endpoints públicos del backend Spring Boot.
 */

import type { ITienda, GaleriaGamarra } from '../types/ITienda';
import type { IFiltrosTiendas } from '../types/IFiltro';
import apiClient from './apiClient';

/* ── Tipo que devuelve el backend ──────────────────────────────────────── */

interface ITiendaBackend {
  idTienda: number;
  nombreComercial: string;
  informacion?: string;
  foto: string;
  verificada?: boolean;
  categorias?: string[];
  tiposServicio?: string[];
  tiposProducto?: string[];
  galeria?: string;
  piso?: string;
  stand?: string;
  ofreceEnvio?: boolean;
}

/* ── Adaptador backend → ITienda ──────────────────────────────────────── */

function adaptarTienda(t: ITiendaBackend): ITienda {
  return {
    id: String(t.idTienda),
    nombre: t.nombreComercial,
    descripcion: t.informacion,
    logo: t.foto,
    verificada: t.verificada,
    categorias: t.categorias ?? [],
    tiposServicio: (t.tiposServicio as any) ?? ['COMPRA_DIRECTA'],
    tiposProducto: t.tiposProducto ?? [],
    galeria: t.galeria as GaleriaGamarra | undefined,
    piso: t.piso,
    stand: t.stand,
    ofreceEnvio: t.ofreceEnvio ?? false,
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
  if (filtros.tipoServicio && filtros.tipoServicio.length > 0) {
    resultado = resultado.filter((t) =>
      t.tiposServicio?.some((ts) => filtros.tipoServicio!.includes(ts)),
    );
  }

  // Filtrar por galería: la tienda debe pertenecer a AL MENOS UNA de las galerías seleccionadas
  if (filtros.galerias && filtros.galerias.length > 0) {
    const galerias = filtros.galerias;
    resultado = resultado.filter(
      (t) => t.galeria != null && galerias.includes(t.galeria as GaleriaGamarra),
    );
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
  return shuffleDiario(tiendas, semillaDelDia()).slice(0, 3);
}

/**
 * Fisher-Yates determinista con semilla explícita.
 * Exportada para reutilizarse en InicioPage y otros módulos.
 * Usar `semillaDelDia()` como seed para rotación diaria consistente.
 */
export function shuffleDiario<T>(arr: T[], seed: number): T[] {
  const copia = [...arr];
  let s = seed;
  for (let i = copia.length - 1; i > 0; i--) {
    s = Math.imul(s, 1664525) + 1013904223;
    const j = Math.abs(s) % (i + 1);
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/** Semilla del día: número YYYYMMDD, cambia cada medianoche. */
export function semillaDelDia(): number {
  const hoy = new Date();
  return (
    hoy.getFullYear() * 10000 +
    (hoy.getMonth() + 1) * 100 +
    hoy.getDate()
  );
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

/* ── Perfil del comerciante autenticado ──────────────────────────────────── */

export interface IPerfilComerciante {
  // Negocio
  nombreTienda: string;
  razonSocial: string;
  ruc: string;
  galeria?: string;
  piso?: string;
  stand?: string;
  logoUrl?: string;
  foto?: string;
  informacion?: string;
  verificada?: boolean;
  // Titular
  email: string;
  nombres: string;
  primerApellido: string;
  segundoApellido?: string;
  tipoDocumento: string;
  dni: string;
  telefono: string;
}

export interface IPerfilComerciantePayload {
  nombreTienda: string;
  razonSocial: string;
  galeria?: string;
  piso?: string;
  stand?: string;
  logoUrl?: string;
  foto?: string;
  informacion?: string;
  nombres: string;
  primerApellido: string;
  segundoApellido: string;
  tipoDocumento: string;
  dni: string;
  telefono: string;
}

export async function obtenerPerfilComerciante(): Promise<IPerfilComerciante> {
  const { data } = await apiClient.get<IPerfilComerciante>('/comerciantes/perfil');
  return data;
}

export async function actualizarPerfilComerciante(
  payload: IPerfilComerciantePayload,
): Promise<IPerfilComerciante> {
  const { data } = await apiClient.put<IPerfilComerciante>('/comerciantes/perfil', payload);
  return data;
}
