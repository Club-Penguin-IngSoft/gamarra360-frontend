/**
 * Capa de acceso al backend para el módulo `catalogo`.
 *
 * Hoy retorna data mockeada (frontend-only). Cuando el backend Spring Boot esté
 * disponible, basta con descomentar las llamadas a `apiClient` y eliminar los
 * mocks — el contrato (IProducto, IFiltrosCatalogo) ya está alineado con el API.
 *
 * Convención de enriquecimiento de mocks:
 *  - Todo producto con tipoServicio = COMPRA_DIRECTA debe tener imagenes (≥3),
 *    variantes (tallas × colores) y especificaciones (≥4). Esto satisface el
 *    diseño Figma "Detalle producto - compra directa" (node 2357-5727).
 *  - PERSONALIZABLE y COTIZACION solo necesitan datos básicos; sus pantallas
 *    de detalle siguen otro diseño (pendiente).
 */

import type { IProducto, IVarianteProducto, EtiquetaProducto } from '../types/IProducto';
import { ETIQUETA_POR_TIPO_SERVICIO } from '../types/IProducto';
import type { IFiltrosCatalogo } from '../types/IFiltro';
// import apiClient from './apiClient';

/* ------------------- Helpers para construir variantes ------------------- */

const TALLAS_ADULTOS = ['S', 'M', 'L', 'XL'];
const TALLAS_BLUSA = ['S', 'M', 'L'];
const TALLAS_NINOS = ['4', '6', '8', '10'];

const COLORES_BASICOS_HOMBRE = [
  { name: 'Blanco', hex: '#F5F5F5' },
  { name: 'Negro', hex: '#1A1A1A' },
  { name: 'Azul Marino', hex: '#1B2A4E' },
];
const COLORES_BASICOS_MUJER = [
  { name: 'Negro', hex: '#1A1A1A' },
  { name: 'Rosa Palo', hex: '#E78BA7' },
  { name: 'Camel', hex: '#C19A6B' },
];
const COLORES_DENIM = [
  { name: 'Azul Clásico', hex: '#2A4A7F' },
  { name: 'Negro', hex: '#1A1A1A' },
  { name: 'Gris Oscuro', hex: '#3F4145' },
];
const COLORES_INFANTIL = [
  { name: 'Azul', hex: '#5DADE2' },
  { name: 'Rojo', hex: '#E74C3C' },
  { name: 'Verde', hex: '#27AE60' },
];
const COLORES_NEUTROS_UNISEX = [
  { name: 'Negro', hex: '#1A1A1A' },
  { name: 'Gris Melange', hex: '#7F8C8D' },
  { name: 'Blanco', hex: '#F5F5F5' },
];
const COLORES_BLUSA_DENIM = [
  { name: 'Celeste Claro', hex: '#A6C7E0' },
  { name: 'Azul Denim', hex: '#4A6FA5' },
  { name: 'Blanco', hex: '#F5F5F5' },
];

/** Genera variantes (talla × color) con un stock fijo para mantener determinismo en mocks. */
function crearVariantes(
  tallas: string[],
  colores: { name: string; hex: string }[],
  stock = 8,
): IVarianteProducto[] {
  const out: IVarianteProducto[] = [];
  for (const color of colores) {
    for (const talla of tallas) {
      const idLimpio = `v-${color.name}-${talla}`
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/\s+/g, '-');
      out.push({
        id: idLimpio,
        talla,
        color: color.name,
        colorHex: color.hex,
        stock,
      });
    }
  }
  return out;
}

/* ------------- Plantillas de especificaciones por tipo de prenda ----------- */

const ESPECS_POLO = [
  { etiqueta: 'MATERIAL', valor: '100% Algodón Pima Peruano' },
  { etiqueta: 'ESTILO', valor: 'Slim Fit Casual' },
  { etiqueta: 'MANGAS', valor: 'Cortas con puño elástico' },
  { etiqueta: 'CUELLO', valor: 'Polo con tres botones' },
];

const ESPECS_JEAN = [
  { etiqueta: 'MATERIAL', valor: 'Denim premium (98% algodón, 2% elastano)' },
  { etiqueta: 'CORTE', valor: 'Slim Fit' },
  { etiqueta: 'CIERRE', valor: 'Cremallera YKK + botón metálico' },
  { etiqueta: 'BOLSILLOS', valor: '5 bolsillos clásicos' },
];

const ESPECS_VESTIDO = [
  { etiqueta: 'MATERIAL', valor: 'Viscosa con estampado floral' },
  { etiqueta: 'LARGO', valor: 'Midi (a la rodilla)' },
  { etiqueta: 'ESTILO', valor: 'Casual con vuelo' },
  { etiqueta: 'MANGAS', valor: 'Cortas tipo farol' },
];

const ESPECS_CAMISA = [
  { etiqueta: 'MATERIAL', valor: 'Algodón Oxford 100%' },
  { etiqueta: 'CORTE', valor: 'Slim Fit Ejecutivo' },
  { etiqueta: 'CUELLO', valor: 'Italiano semi-rígido' },
  { etiqueta: 'BOTONES', valor: 'Botones de nácar reforzados' },
];

const ESPECS_FALDA = [
  { etiqueta: 'MATERIAL', valor: 'Poliéster premium con caída' },
  { etiqueta: 'LARGO', valor: 'Midi plisado' },
  { etiqueta: 'CIERRE', valor: 'Cremallera lateral invisible' },
  { etiqueta: 'FORRO', valor: 'Forro interior antiestático' },
];

const ESPECS_CONJUNTO_INFANTIL = [
  { etiqueta: 'MATERIAL', valor: 'Algodón French Terry hipoalergénico' },
  { etiqueta: 'PIEZAS', valor: 'Polera + pantalón deportivo' },
  { etiqueta: 'CIERRE', valor: 'Pretina elástica con cordón' },
  { etiqueta: 'EDAD', valor: 'Niños de 4 a 10 años' },
];

const ESPECS_POLERA = [
  { etiqueta: 'MATERIAL', valor: 'French Terry 280 gsm' },
  { etiqueta: 'ESTILO', valor: 'Oversize Streetwear' },
  { etiqueta: 'MANGAS', valor: 'Largas con puño elástico' },
  { etiqueta: 'CUELLO', valor: 'Redondo reforzado' },
];

const ESPECS_TSHIRT = [
  { etiqueta: 'MATERIAL', valor: '100% Algodón Pima 220 gsm' },
  { etiqueta: 'ESTILO', valor: 'Oversize unisex' },
  { etiqueta: 'MANGAS', valor: 'Cortas drop-shoulder' },
  { etiqueta: 'CUELLO', valor: 'Redondo doble costura' },
];

const ESPECS_BLUSA_DENIM = [
  { etiqueta: 'MATERIAL', valor: '100% Algodón (Denim Ligero)' },
  { etiqueta: 'AJUSTE', valor: 'Regular Fit con detalle fruncido' },
  { etiqueta: 'CUIDADO', valor: 'Lavado a máquina agua fría' },
  { etiqueta: 'ESTILO', valor: 'Casual / Urbano' },
];

/* --------------------------- MOCK: catálogo ---------------------------- */

const MOCK_PRODUCTOS: IProducto[] = [
  {
    id: 'p1',
    titulo: 'Polo básico de algodón hombre',
    descripcion:
      'Polo de algodón Pima peruano con corte slim fit, ideal para el uso diario. Confeccionado en Lima con acabados de alta calidad.',
    idComerciante: 'c1',
    nombreTienda: 'Moda Urbana Gamarra',
    imagenes: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=600&q=80',
    ],
    categoria: 'HOMBRE',
    tipoServicio: 'COMPRA_DIRECTA',
    precioBase: 45,
    precioFinal: 35,
    variantes: crearVariantes(TALLAS_ADULTOS, COLORES_BASICOS_HOMBRE, 12),
    especificaciones: ESPECS_POLO,
  },
  {
    id: 'p2',
    titulo: 'Blusa denim manga larga mujer',
    descripcion:
      'Blusa de denim ligero con corte regular fit y detalle fruncido. Puedes personalizarla con estampado, bordado o impresión textil.',
    idComerciante: 'c2',
    nombreTienda: 'Estilo Killa',
    imagenes: [
      'https://images.unsplash.com/photo-1551489186-cf8726f514f8?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1604159624708-c5b6614128bb?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=600&q=80',
    ],
    categoria: 'MUJER',
    tipoServicio: 'PERSONALIZABLE',
    precioBase: 48,
    precioFinal: 40.8,
    variantes: crearVariantes(TALLAS_BLUSA, COLORES_BLUSA_DENIM, 9),
    especificaciones: ESPECS_BLUSA_DENIM,
  },
  {
    id: 'p3',
    titulo: 'Jeans slim fit hombre',
    descripcion:
      'Jean slim premium con denim peruano. Cómodo, resistente y con caída perfecta.',
    idComerciante: 'c3',
    nombreTienda: 'Denim House Perú',
    imagenes: [
      'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1604176354204-9268737828e4?auto=format&fit=crop&w=600&q=80',
    ],
    categoria: 'HOMBRE',
    tipoServicio: 'COMPRA_DIRECTA',
    precioBase: 89,
    precioFinal: 80.1,
    variantes: crearVariantes(TALLAS_ADULTOS, COLORES_DENIM, 4), // stock bajo → muestra "¡ÚLTIMAS!"
    especificaciones: ESPECS_JEAN,
  },
  {
    id: 'p4',
    titulo: 'Casaca drill unisex',
    descripcion:
      'Producto bajo cotización: ideal para uniformes corporativos o pedidos por volumen.',
    idComerciante: 'c4',
    nombreTienda: 'Textiles Nova',
    imagenes: [
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80',
    ],
    categoria: 'UNISEX_ADULTOS',
    tipoServicio: 'COTIZACION',
  },
  {
    id: 'p5',
    titulo: 'Vestido casual floral',
    descripcion:
      'Vestido midi de viscosa con estampado floral exclusivo. Perfecto para primavera.',
    idComerciante: 'c5',
    nombreTienda: 'Boutique Samantha',
    imagenes: [
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80',
    ],
    categoria: 'MUJER',
    tipoServicio: 'COMPRA_DIRECTA',
    precioBase: 75,
    precioFinal: 60,
    variantes: crearVariantes(TALLAS_ADULTOS, COLORES_BASICOS_MUJER, 8),
    especificaciones: ESPECS_VESTIDO,
  },
  {
    id: 'p6',
    titulo: 'Conjunto deportivo infantil',
    descripcion:
      'Conjunto deportivo en French Terry suave e hipoalergénico para niños de 4 a 10 años.',
    idComerciante: 'c6',
    nombreTienda: 'Peque Moda Kids',
    imagenes: [
      'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1503944168849-8bf86038c91b?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1622290291468-a28f7a7dc4f9?auto=format&fit=crop&w=600&q=80',
    ],
    categoria: 'NINOS',
    tipoServicio: 'COMPRA_DIRECTA',
    precioBase: 58,
    precioFinal: 51.04,
    variantes: crearVariantes(TALLAS_NINOS, COLORES_INFANTIL, 3), // stock bajo
    especificaciones: ESPECS_CONJUNTO_INFANTIL,
  },
  {
    id: 'p7',
    titulo: 'Camisa formal hombre',
    descripcion:
      'Camisa formal en algodón Oxford 100% con corte slim ejecutivo y botones de nácar.',
    idComerciante: 'c7',
    nombreTienda: 'Elegance Store',
    imagenes: [
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1626497764746-6dc36546b388?auto=format&fit=crop&w=600&q=80',
    ],
    categoria: 'HOMBRE',
    tipoServicio: 'COMPRA_DIRECTA',
    precioBase: 65,
    precioFinal: 61.75,
    variantes: crearVariantes(TALLAS_ADULTOS, COLORES_BASICOS_HOMBRE, 15),
    especificaciones: ESPECS_CAMISA,
  },
  {
    id: 'p8',
    titulo: 'Falda plisada mujer',
    descripcion:
      'Falda midi plisada con forro interior antiestático y cremallera lateral invisible.',
    idComerciante: 'c8',
    nombreTienda: 'Rosa Urbana',
    imagenes: [
      'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1517438476312-10d79c077509?auto=format&fit=crop&w=600&q=80',
    ],
    categoria: 'MUJER',
    tipoServicio: 'COMPRA_DIRECTA',
    precioBase: 42,
    precioFinal: 42,
    variantes: crearVariantes(TALLAS_ADULTOS, COLORES_BASICOS_MUJER, 7),
    especificaciones: ESPECS_FALDA,
  },
  {
    id: 'p9',
    titulo: 'Chaleco de vestir hombre',
    descripcion:
      'Chaleco a medida bajo cotización. Confección artesanal según especificaciones del cliente.',
    idComerciante: 'c9',
    nombreTienda: 'Sastrería León',
    imagenes: [
      'https://images.unsplash.com/photo-1598808503746-f34c53b9323e?auto=format&fit=crop&w=800&q=80',
    ],
    categoria: 'HOMBRE',
    tipoServicio: 'COTIZACION',
  },
  {
    id: 'p10',
    titulo: 'Polera oversize unisex',
    descripcion:
      'Polera oversize streetwear en French Terry 280 gsm. Diseño urbano y minimalista.',
    idComerciante: 'c10',
    nombreTienda: 'Street Wear Gamarra',
    imagenes: [
      'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1612202403229-f8f5feed7dbb?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=600&q=80',
    ],
    categoria: 'UNISEX_ADULTOS',
    tipoServicio: 'COMPRA_DIRECTA',
    precioBase: 72,
    precioFinal: 40.5,
    variantes: crearVariantes(TALLAS_ADULTOS, COLORES_NEUTROS_UNISEX, 5), // stock bajo
    especificaciones: ESPECS_POLERA,
  },
  {
    id: 'p11',
    titulo: 'T-Shirt Oversize',
    descripcion:
      'T-Shirt oversize en 100% algodón Pima 220 gsm con costura doble en cuello.',
    idComerciante: 'c11',
    nombreTienda: 'Urban Cotton Co.',
    imagenes: [
      'https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1622445275576-721325763afe?auto=format&fit=crop&w=600&q=80',
    ],
    categoria: 'UNISEX_ADULTOS',
    tipoServicio: 'COMPRA_DIRECTA',
    precioBase: 45,
    precioFinal: 40.5,
    variantes: crearVariantes(TALLAS_ADULTOS, COLORES_NEUTROS_UNISEX, 20),
    especificaciones: ESPECS_TSHIRT,
  },
  {
    id: 'p12',
    titulo: 'T-Shirt Oversize Manga Corta',
    descripcion:
      'Versión de manga corta drop-shoulder del clásico oversize. Algodón Pima 220 gsm.',
    idComerciante: 'c11',
    nombreTienda: 'Urban Cotton Co.',
    imagenes: [
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80',
    ],
    categoria: 'UNISEX_ADULTOS',
    tipoServicio: 'COMPRA_DIRECTA',
    precioBase: 45,
    precioFinal: 40.5,
    variantes: crearVariantes(TALLAS_ADULTOS, COLORES_NEUTROS_UNISEX, 11),
    especificaciones: ESPECS_TSHIRT,
  },
  // Producto detalle del Figma (Casaca biker premium) — mantiene su data original
  {
    id: 'casaca-biker-premium',
    titulo: 'Casaca de Cuero Biker Premium',
    descripcion:
      'Casaca de cuero genuino con cortes biker, forro premium y herrajes YKK.',
    idComerciante: 'c-textiles-sur',
    nombreTienda: 'Textiles del Sur',
    imagenes: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=80',
    ],
    categoria: 'HOMBRE',
    tipoServicio: 'COMPRA_DIRECTA',
    precioBase: 450,
    precioFinal: 405,
    variantes: [
      { id: 'v-s', talla: 'S', color: 'Negro Carbón', colorHex: '#1A1A1A', stock: 5 },
      { id: 'v-m', talla: 'M', color: 'Negro Carbón', colorHex: '#1A1A1A', stock: 5 },
      { id: 'v-l', talla: 'L', color: 'Negro Carbón', colorHex: '#1A1A1A', stock: 3 },
      { id: 'v-xl', talla: 'XL', color: 'Negro Carbón', colorHex: '#1A1A1A', stock: 2 },
    ],
    especificaciones: [
      { etiqueta: 'MATERIAL', valor: 'Cuero de Grano Entero (Top Grain)' },
      { etiqueta: 'FORRO', valor: 'Satinado Premium Antitranspirante' },
      { etiqueta: 'CIERRES', valor: 'YKK de Acero Niquelado' },
      { etiqueta: 'BOLSILLOS', valor: '3 Exteriores + 2 Internos de Seguridad' },
    ],
  },
];

/* ----------------------------- API pública ----------------------------- */

/**
 * Lista productos del catálogo aplicando filtros opcionales.
 * @param filtros estado actual de filtros del usuario
 */
export async function listarProductos(
  filtros?: Partial<IFiltrosCatalogo>,
): Promise<IProducto[]> {
  // TODO: reemplazar por:
  // const { data } = await apiClient.get<IProducto[]>('/productos', { params: filtros });
  // return data;

  let resultado = MOCK_PRODUCTOS;

  if (filtros?.categorias && filtros.categorias.length > 0) {
    resultado = resultado.filter((p) => filtros.categorias!.includes(p.categoria));
  }
  if (filtros?.tipoServicio) {
    resultado = resultado.filter((p) => p.tipoServicio === filtros.tipoServicio);
  }
  if (filtros?.precioMin != null) {
    resultado = resultado.filter(
      (p) => (p.precioFinal ?? Infinity) >= filtros.precioMin!,
    );
  }
  if (filtros?.precioMax != null) {
    resultado = resultado.filter(
      (p) => (p.precioFinal ?? 0) <= filtros.precioMax!,
    );
  }

  return Promise.resolve(resultado);
}

/**
 * Devuelve el detalle de un producto por id. Lanza error si no existe.
 */
export async function obtenerProducto(id: string): Promise<IProducto> {
  // TODO: reemplazar por:
  // const { data } = await apiClient.get<IProducto>(`/productos/${id}`);
  // return data;

  const encontrado = MOCK_PRODUCTOS.find((p) => p.id === id);
  if (!encontrado) {
    throw new Error(`Producto ${id} no encontrado`);
  }
  return Promise.resolve(encontrado);
}

/**
 * Devuelve los productos reales de una tienda específica (excluyendo
 * opcionalmente uno). Strict: solo productos cuyo `idComerciante` coincida.
 *
 * Si la tienda no tiene productos, retorna []. Las páginas que consumen este
 * método deben manejar el estado vacío (ocultar la sección, mostrar mensaje,
 * etc.) según corresponda.
 */
export async function listarProductosDeTienda(
  idComerciante: string,
  excluirId?: string,
): Promise<IProducto[]> {
  // TODO: const { data } = await apiClient.get<IProducto[]>('/productos', { params: { idComerciante } });
  return Promise.resolve(
    MOCK_PRODUCTOS.filter(
      (p) => p.idComerciante === idComerciante && p.id !== excluirId,
    ),
  );
}

/**
 * Convierte el enum TipoServicio del backend a la etiqueta visible en la UI.
 */
export function etiquetaDeProducto(producto: IProducto): EtiquetaProducto {
  return ETIQUETA_POR_TIPO_SERVICIO[producto.tipoServicio];
}
