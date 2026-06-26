/**
 * Contexto del carrito de compras (módulo `carrito`).
 * Implementación local — operaciones in-memory. Se sincronizará con el backend
 * cuando estén disponibles los endpoints `/api/v1/carrito`.
 *
 * También administra el estado del **drawer lateral** que se abre cuando el
 * usuario hace click en "Añadir al carrito" desde el detalle de producto.
 */

import {
  createContext,
  useCallback,
  useEffect,  
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import type { ICarrito, IItemCarrito } from '../types/ICarrito';
import type { IProducto } from '../types/IProducto';

/** Snapshot del último item agregado, mostrado en el alert verde del drawer. */
export interface IJustAddedItem {
  titulo: string;
  color?: string;
  talla?: string;
}

interface ICarritoContextValue extends ICarrito {
  agregarAlCarrito: (
    producto: IProducto,
    cantidad: number,
    idVariante?: string,
  ) => void;
  quitarDelCarrito: (idItem: string) => void;
  actualizarCantidad: (idItem: string, cantidad: number) => void;
  vaciarCarrito: () => void;
  cantidadTotal: number;

  /* ------------------------ Estado del drawer lateral ----------------------- */
  drawerOpen: boolean;
  /** Item recién agregado — usado para el alert verde "se agregó a tu carrito" */
  justAdded: IJustAddedItem | null;
  abrirDrawer: () => void;
  cerrarDrawer: () => void;
}

export const CarritoContext = createContext<ICarritoContextValue | undefined>(
  undefined,
);

export function CarritoProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<IItemCarrito[]>(() => {
    try {
      const stored = localStorage.getItem('carrito');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  useEffect(() => {
  localStorage.setItem('carrito', JSON.stringify(items));
}, [items]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [justAdded, setJustAdded] = useState<IJustAddedItem | null>(null);

  const agregarAlCarrito = useCallback(
    (producto: IProducto, cantidad: number, idVariante?: string) => {
      setItems((actuales) => {
        const variante = producto.variantes?.find((v) => v.id === idVariante);
        const stockDisponible = variante?.stock ?? Infinity;

        const indice = actuales.findIndex(
          (i) => i.producto.id === producto.id && i.idVariante === idVariante,
        );

        if (indice >= 0) {
          const cantidadActual = actuales[indice].cantidad;
          const nuevaCantidad = Math.min(cantidadActual + cantidad, stockDisponible);
          // Si ya tiene el máximo, no cambia nada
          if (nuevaCantidad === cantidadActual) return actuales;
          const copia = [...actuales];
          copia[indice] = { ...copia[indice], cantidad: nuevaCantidad };
          return copia;
        }

        const cantidadFinal = Math.min(cantidad, stockDisponible);
        if (cantidadFinal <= 0) return actuales;

        const nuevo: IItemCarrito = {
          id: `${producto.id}-${idVariante ?? 'default'}-${Date.now()}`,
          producto,
          idVariante,
          cantidad: cantidadFinal,
          precioUnitario: variante?.precioEfectivo ?? producto.precioFinal ?? producto.precioBase ?? 0,
        };
        return [...actuales, nuevo];
      });

      const variante = producto.variantes?.find((v) => v.id === idVariante);
      setJustAdded({
        titulo: producto.titulo,
        color: variante?.color,
        talla: variante?.talla,
      });
      setDrawerOpen(true);
    },
    [],
  );

  const quitarDelCarrito = useCallback((idItem: string) => {
    setItems((actuales) => actuales.filter((i) => i.id !== idItem));
  }, []);

  const actualizarCantidad = useCallback((idItem: string, cantidad: number) => {
    if (cantidad <= 0) {
      setItems((actuales) => actuales.filter((i) => i.id !== idItem));
      return;
    }
    setItems((actuales) =>
      actuales.map((i) => {
        if (i.id !== idItem) return i;
        const variante = i.producto.variantes?.find((v) => v.id === i.idVariante);
        const stockDisponible = variante?.stock ?? Infinity;
        return { ...i, cantidad: Math.min(cantidad, stockDisponible) };
      }),
    );
  }, []);

  const vaciarCarrito = useCallback(() => setItems([]), []);

  const abrirDrawer = useCallback(() => setDrawerOpen(true), []);

  const cerrarDrawer = useCallback(() => {
    setDrawerOpen(false);
    // Limpiar el alert después de la animación de salida (~300ms)
    window.setTimeout(() => setJustAdded(null), 300);
  }, []);

  const value = useMemo<ICarritoContextValue>(() => {
    const subtotal = items.reduce(
      (acc, i) => acc + i.precioUnitario * i.cantidad,
      0,
    );
    const cantidadTotal = items.reduce((acc, i) => acc + i.cantidad, 0);
    return {
      items,
      subtotal,
      cantidadTotal,
      agregarAlCarrito,
      quitarDelCarrito,
      actualizarCantidad,
      vaciarCarrito,
      drawerOpen,
      justAdded,
      abrirDrawer,
      cerrarDrawer,
    };
  }, [
    items,
    drawerOpen,
    justAdded,
    agregarAlCarrito,
    quitarDelCarrito,
    actualizarCantidad,
    vaciarCarrito,
    abrirDrawer,
    cerrarDrawer,
  ]);

  return (
    <CarritoContext.Provider value={value}>{children}</CarritoContext.Provider>
  );
}
