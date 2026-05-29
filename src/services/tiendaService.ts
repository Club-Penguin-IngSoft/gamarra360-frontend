/**
 * Capa de acceso al backend para el módulo `usuario` (comerciantes/tiendas).
 * Hoy con data mockeada — pendiente de cablear al backend Spring Boot.
 */

import type { ITienda } from '../types/ITienda';
import type { IFiltrosTiendas } from '../types/IFiltro';
import apiClient from './apiClient';

const MOCK_TIENDAS: ITienda[] = [
  {
    id: 'c1',
    nombre: 'Urban Chic Damas',
    descripcion:
      'Tienda enfocada en prendas básicas y modernas para el día a día.',
    descripcionLarga:
      'Más de 10 años creando prendas básicas y versátiles para la mujer moderna. Combinamos algodón Pima peruano con cortes contemporáneos para tu día a día.',
    logo: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80',
    verificada: true,
    categorias: ['MUJER'],
    tiposServicio: ['COMPRA_DIRECTA'],
    tiposProducto: ['Blusas', 'Vestidos', 'Faldas'],
    galeria: 'GALERIA_DAMIANI',
    direccion: '2do Piso, Stand 215',
  },
  {
    id: 'c2',
    nombre: 'Estilo Killa',
    descripcion: 'Ofrece ropa femenina con diseños actuales y versátiles.',
    descripcionLarga:
      'Especialistas en moda femenina personalizable. Combinamos diseños actuales con la posibilidad de adaptar cada prenda a tu estilo único.',
    logo: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80',
    verificada: true,
    categorias: ['MUJER'],
    tiposServicio: ['PERSONALIZABLE', 'COMPRA_DIRECTA'],
    tiposProducto: ['Blusas', 'Vestidos'],
    galeria: 'GALERIA_PLAZA',
    direccion: '1er Piso, Stand 108',
  },
  {
    id: 'c3',
    nombre: 'Denim House Perú',
    descripcion:
      'Especializada en jeans y prendas de denim para hombre y mujer.',
    logo: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=600&q=80',
    verificada: true,
    categorias: ['HOMBRE', 'MUJER'],
    tiposServicio: ['COMPRA_DIRECTA'],
    tiposProducto: ['Pantalones', 'Casacas'],
    galeria: 'GAMARRA_CENTRO',
  },
  {
    id: 'c4',
    nombre: 'Textiles Nova',
    descripcion:
      'Fabricantes de uniformes corporativos y producciones a gran escala.',
    descripcionLarga:
      'Más de 15 años fabricando uniformes corporativos y producciones a gran escala. Atendemos pedidos desde 50 unidades con materiales de primera calidad.',
    logo: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80',
    verificada: true,
    categorias: ['UNISEX_ADULTOS'],
    tiposServicio: ['COTIZACION'],
    tiposProducto: ['Casacas', 'Pantalones'],
    galeria: 'GALERIA_GUIZADO',
    direccion: '3er Piso, Stand 312-B',
    servicioCotizacion: {
      titulo: 'Producciones Corporativas a Medida',
      descripcion:
        'Confeccionamos uniformes y prendas corporativas con tu logo. Atendemos pedidos desde 50 unidades con plazos garantizados.',
      imagen:
        'https://images.unsplash.com/photo-1607344645866-009c320b63e0?auto=format&fit=crop&w=800&q=80',
    },
  },
  {
    id: 'c5',
    nombre: 'Boutique Samantha',
    descripcion:
      'Boutique de ropa casual y femenina con estilo juvenil.',
    logo: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=600&q=80',
    verificada: true,
    categorias: ['MUJER'],
    tiposServicio: ['COMPRA_DIRECTA'],
    tiposProducto: ['Vestidos', 'Blusas', 'Faldas'],
    galeria: 'GALERIA_DAMIANI',
  },
  {
    id: 'c6',
    nombre: 'Peque Moda Kids',
    descripcion:
      'Ropa infantil cómoda y duradera para niños de 2 a 12 años.',
    logo: 'https://images.unsplash.com/photo-1503944168849-8bf86038c91b?auto=format&fit=crop&w=600&q=80',
    verificada: true,
    categorias: ['NINOS', 'UNISEX_NINOS'],
    tiposServicio: ['COMPRA_DIRECTA'],
    tiposProducto: ['Polos', 'Pantalones', 'Pijamas'],
    galeria: 'GALERIA_DON_PEDRO',
  },
  {
    id: 'c7',
    nombre: 'Elegance Store',
    descripcion:
      'Camisas y trajes formales premium para hombre ejecutivo.',
    logo: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80',
    verificada: true,
    categorias: ['HOMBRE'],
    tiposServicio: ['COMPRA_DIRECTA', 'PERSONALIZABLE'],
    tiposProducto: ['Camisas'],
    galeria: 'GALERIA_PLAZA',
  },
  {
    id: 'c8',
    nombre: 'Rosa Urbana',
    descripcion:
      'Tendencias urbanas femeninas con estampados exclusivos.',
    logo: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=600&q=80',
    verificada: true,
    categorias: ['MUJER'],
    tiposServicio: ['COMPRA_DIRECTA'],
    tiposProducto: ['Faldas', 'Blusas'],
    galeria: 'GAMARRA_CENTRO',
  },
  {
    id: 'c9',
    nombre: 'Sastrería León',
    descripcion:
      'Confección artesanal de trajes y prendas formales a medida.',
    descripcionLarga:
      'Especialistas en Slim Fit Suits y confección a medida de alta gama. Con más de 20 años en el corazón de Gamarra, transformamos el arte textil en elegancia contemporánea para el caballero moderno.',
    logo: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=600&q=80',
    verificada: true,
    categorias: ['HOMBRE'],
    tiposServicio: ['COTIZACION'],
    tiposProducto: ['Casacas', 'Camisas', 'Pantalones'],
    galeria: 'GALERIA_GUIZADO',
    direccion: '3er Piso, Stand 302-A',
    servicioCotizacion: {
      titulo: 'Servicio de Confección a Medida',
      descripcion:
        'Ajuste perfecto garantizado. Seleccionamos las mejores lanas y algodones para crear una prenda única que refleje tu personalidad.',
      imagen:
        'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?auto=format&fit=crop&w=800&q=80',
    },
  },
  {
    id: 'c10',
    nombre: 'Street Wear Gamarra',
    descripcion:
      'Ropa urbana oversize para los amantes del streetwear.',
    logo: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=600&q=80',
    verificada: true,
    categorias: ['UNISEX_ADULTOS'],
    tiposServicio: ['COMPRA_DIRECTA'],
    tiposProducto: ['Polos', 'Casacas'],
    galeria: 'GAMARRA_CENTRO',
  },
  {
    id: 'c11',
    nombre: 'Urban Cotton Co.',
    descripcion:
      'Algodón Pima 100% peruano en prendas básicas premium.',
    logo: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=600&q=80',
    verificada: true,
    categorias: ['UNISEX_ADULTOS'],
    tiposServicio: ['COMPRA_DIRECTA'],
    tiposProducto: ['Polos'],
    galeria: 'GALERIA_PLAZA',
  },
  {
    id: 'c-textiles-sur',
    nombre: 'Textiles del Sur',
    descripcion:
      'Confecciones premium en cuero y materiales nobles.',
    descripcionLarga:
      'Trabajamos con cuero genuino y materiales nobles para confeccionar piezas atemporales. Cada casaca pasa por un riguroso control de calidad antes de llegar a tus manos.',
    logo: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=200&q=80',
    verificada: true,
    categorias: ['HOMBRE'],
    tiposServicio: ['COMPRA_DIRECTA'],
    tiposProducto: ['Casacas'],
    galeria: 'GALERIA_DAMIANI',
    direccion: '2do Piso, Stand 220',
  },
  {
    id: 'c-moda-urbana',
    nombre: 'Moda Urbana Gamarra',
    descripcion:
      'Polos y básicos urbanos para todos los días.',
    logo: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80',
    verificada: true,
    categorias: ['HOMBRE'],
    tiposServicio: ['COMPRA_DIRECTA'],
    tiposProducto: ['Polos'],
    galeria: 'GAMARRA_CENTRO',
  },
  {
    id: 'c-mini-moda',
    nombre: 'Mini Moda Perú',
    descripcion:
      'Estampados divertidos para los más pequeños de la casa.',
    logo: 'https://images.unsplash.com/photo-1503944168849-8bf86038c91b?auto=format&fit=crop&w=600&q=80',
    verificada: true,
    categorias: ['NINOS'],
    tiposServicio: ['PERSONALIZABLE'],
    tiposProducto: ['Polos'],
    galeria: 'GALERIA_DON_PEDRO',
  },
];

/**
 * Lista todas las tiendas del directorio aplicando filtros opcionales.
 */
export async function listarTiendas(
  filtros?: Partial<IFiltrosTiendas>,
): Promise<ITienda[]> {
  // TODO: const { data } = await apiClient.get<ITienda[]>('/tiendas', { params: filtros });

  let resultado = MOCK_TIENDAS;

  if (filtros?.categorias && filtros.categorias.length > 0) {
    resultado = resultado.filter((t) =>
      t.categorias?.some((c) => filtros.categorias!.includes(c)),
    );
  }
  if (filtros?.tiposProducto && filtros.tiposProducto.length > 0) {
    resultado = resultado.filter((t) =>
      t.tiposProducto?.some((p) => filtros.tiposProducto!.includes(p)),
    );
  }
  if (filtros?.tipoServicio) {
    resultado = resultado.filter((t) =>
      t.tiposServicio?.includes(filtros.tipoServicio!),
    );
  }
  if (filtros?.galeria) {
    resultado = resultado.filter((t) => t.galeria === filtros.galeria);
  }

  return Promise.resolve(resultado);
}

export async function listarTiendasDestacadas(): Promise<ITienda[]> {
  // TODO: const { data } = await apiClient.get<ITienda[]>('/tiendas/destacadas');
  return Promise.resolve(MOCK_TIENDAS.slice(0, 3));
}

export async function obtenerTienda(id: string): Promise<ITienda> {
  // TODO: const { data } = await apiClient.get<ITienda>(`/tiendas/${id}`);
  const t = MOCK_TIENDAS.find((x) => x.id === id);
  if (!t) throw new Error(`Tienda ${id} no encontrada`);
  return Promise.resolve(t);
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
