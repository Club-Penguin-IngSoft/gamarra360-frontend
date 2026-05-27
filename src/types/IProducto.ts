/**
 * Modelos de dominio: Producto y tipos asociados.
 * Alineado con el módulo `catalogo` del backend (Spring Boot) y el schema BD.
 *
 * Tablas mapeadas:
 *  - `productos`              → IProducto
 *  - `variantes_producto`     → IVarianteProducto
 *  - `imagenes_producto`      → IImagenProducto
 *  - `especificaciones`       → IEspecificacionProducto
 *  - `descuentos_volumen`     → IDescuentoVolumen
 *  - `categorias`             → ICategoria
 */

/**
 * Etiqueta visible del producto en cards y badges.
 *
 * IMPORTANTE: la BD NO tiene un enum "tipo_servicio". El concepto se deriva así:
 *  - COMPRA_DIRECTA  = `productos.es_personalizable = FALSE` (default)
 *  - PERSONALIZABLE  = `productos.es_personalizable = TRUE`
 *  - COTIZACION      = flujo aparte (tabla `solicitudes`), NO es atributo del producto
 *
 * Por ahora mantenemos el enum aquí porque la UI lo necesita para los tags
 * y filtros. Cuando se conecte al backend, el campo `tipoServicio` será
 * derivado en el mapper/DTO del backend a partir de `es_personalizable`.
 */
export type TipoServicio = 'COMPRA_DIRECTA' | 'PERSONALIZABLE' | 'COTIZACION';

/**
 * Categorías visibles en filtros y badges.
 * NOTA: en la BD las categorías son una tabla (`categorias`), NO un enum.
 * Este type es solo para el frontend para mantener los filtros tipados.
 * Cuando se conecte al backend, vendrán los `id_categoria` y se hará un join
 * con la tabla `categorias` para obtener `nombre_categoria`.
 */
export type Categoria =
  | 'HOMBRE'
  | 'MUJER'
  | 'NINOS'
  | 'UNISEX_ADULTOS'
  | 'UNISEX_NINOS';

/**
 * `categorias` (tabla independiente).
 * Útil para futuros filtros dinámicos cuando el backend devuelva la lista
 * real desde la BD en lugar del enum estático de arriba.
 */
export interface ICategoria {
  idCategoria: number;
  nombreCategoria: string;
  descripcion?: string;
}

/**
 * `variantes_producto` — combinación color × talla con stock y precio ajustado.
 */
export interface IVarianteProducto {
  id: string;
  /** SKU único de la variante (campo `sku` en BD) */
  sku?: string;
  talla?: string;
  color?: string;
  /** Hex del color, para mostrarse como swatch — derivado de `colores.cod_hex` */
  colorHex?: string;
  /** Stock real disponible — campo `stock` en BD */
  stock: number;
  /** Umbral mínimo de stock (alertas de reposición) — `minimo_stock` */
  minimoStock?: number;
  /**
   * Precio específico de esta variante si difiere del precio base del producto.
   * Si está definido, sobreescribe `producto.precioBase`. Campo `precio_ajustado`.
   */
  precioAjustado?: number;
  /** Si la variante está habilitada para venta — campo `disponible` */
  disponible?: boolean;
}

/**
 * `imagenes_producto` — galería de imágenes del producto.
 * Una de ellas es la imagen principal (`es_principal = TRUE`).
 */
export interface IImagenProducto {
  idImagen: number;
  url: string;
  esPrincipal: boolean;
}

/**
 * `especificaciones` — pares nombre/descripción técnica del producto.
 * Ej: nombre="Material", descripcion="Cuero Top Grain".
 */
export interface IEspecificacionProducto {
  idEspecificacion?: number;
  nombre: string;
  descripcion?: string;
}

/**
 * `descuentos_volumen` — regla de descuento por volumen.
 *
 * Ej: si compras entre 10 y 49 unidades → 5% de descuento;
 *     si compras 50 o más → 10% de descuento.
 *
 * El "precio con oferta" mostrado en la UI sale de aplicar la regla más
 * ventajosa para la cantidad seleccionada (en CatalogoSection se asume
 * cantidad=1, en el detalle se recalcula al cambiar el stepper).
 */
export interface IDescuentoVolumen {
  idDescuento?: number;
  cantidadMinima: number;
  cantidadMaxima?: number;
  porcentajeDescuento: number;
  activo: boolean;
}

/**
 * `productos` — producto del catálogo.
 *
 * Mapeo de campos relevantes:
 *  - id              ← productos.id_producto
 *  - titulo          ← productos.nombre
 *  - descripcion     ← productos.descripcion (VARCHAR(1000))
 *  - precioBase      ← productos.precio_base (FLOAT)
 *  - esPersonalizable← productos.es_personalizable (BIT)
 *  - activo          ← productos.activo (BIT) — usado para excluir productos desactivados
 *  - idComerciante   ← tiendas.id_comerciante (FK indirecto: productos.id_tienda → tiendas)
 *  - nombreTienda    ← tiendas.nombre_comercial
 */
export interface IProducto {
  id: string;
  titulo: string;
  descripcion?: string;
  /** Si está inactivo (activo=false), no debe aparecer en el catálogo público */
  activo: boolean;
  /** Si es personalizable → tag verde + abre formulario de personalización */
  esPersonalizable: boolean;
  /** ID de la tienda dueña del producto — FK directa `productos.id_tienda` */
  idTienda: string;
  /** ID del comerciante dueño (multi-tenant) — derivado vía `tienda.comerciante.usuarioId` */
  idComerciante: string;
  nombreTienda: string;
  imagenes: string[];
  /**
   * Categoría visible (enum del frontend). En el backend será un join con la
   * tabla `categorias` por `id_categoria` vía la N:M `producto_categoria`.
   */
  categoria: Categoria;
  /**
   * Tag visible derivado de `esPersonalizable` + lógica de UI.
   * En el backend NO es un campo de la tabla `productos`.
   */
  tipoServicio: TipoServicio;
  /** Precio base del producto (sin descuentos aplicados). Undefined cuando es COTIZACION puro */
  precioBase?: number;
  /**
   * Precio final que se muestra al usuario (con descuentos por volumen aplicados
   * a cantidad=1, si la regla aplica). Si no hay reglas activas, es igual a precioBase.
   * Derivado en backend con la regla `descuentos_volumen` que mejor aplique.
   */
  precioFinal?: number;
  variantes?: IVarianteProducto[];
  /** Especificaciones técnicas — tabla `especificaciones` */
  especificaciones?: IEspecificacionProducto[];
  /** Reglas de descuento por volumen activas para este producto */
  descuentosVolumen?: IDescuentoVolumen[];
}

/** Etiqueta visible del producto en cards y badges */
export type EtiquetaProducto = 'COMPRA DIRECTA' | 'PERSONALIZABLE' | 'COTIZACIÓN';

/** Mapeo del enum del backend al texto visible en UI */
export const ETIQUETA_POR_TIPO_SERVICIO: Record<TipoServicio, EtiquetaProducto> = {
  COMPRA_DIRECTA: 'COMPRA DIRECTA',
  PERSONALIZABLE: 'PERSONALIZABLE',
  COTIZACION: 'COTIZACIÓN',
};

/**
 * Color de fondo del tag por tipo de servicio (clases Tailwind).
 * Colores extraídos del Figma de Gamarra 360°:
 *  - COMPRA_DIRECTA: #C83771 (brand-500)
 *  - PERSONALIZABLE: #146C43 (verde corporativo)
 *  - COTIZACION:    #087990 (cyan corporativo)
 */
export const COLOR_BG_TAG_POR_TIPO_SERVICIO: Record<TipoServicio, string> = {
  COMPRA_DIRECTA: 'bg-brand-500',
  PERSONALIZABLE: 'bg-[#146C43]',
  COTIZACION: 'bg-[#087990]',
};

/**
 * Deriva el TipoServicio visible a partir del campo BD `es_personalizable`.
 * Útil cuando el backend devuelva el producto.
 *
 * NOTA: COTIZACION no se deriva del producto, es un flujo aparte. Si el cliente
 * quiere una cotización custom, inicia el flujo desde otra parte de la UI.
 */
export function derivarTipoServicio(esPersonalizable: boolean): TipoServicio {
  return esPersonalizable ? 'PERSONALIZABLE' : 'COMPRA_DIRECTA';
}
