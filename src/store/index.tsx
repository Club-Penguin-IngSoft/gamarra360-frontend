/**
 * Provider raíz que compone todos los contextos globales.
 * Se monta en `main.tsx` envolviendo al RouterProvider.
 *
 * También monta componentes globales que viven en cualquier ruta:
 *  - `CartDrawer`: drawer lateral del carrito que se abre al agregar items
 */

import type { ReactNode } from 'react';
import { AuthProvider } from './AuthContext';
import { CarritoProvider } from './CarritoContext';
import CartDrawer from '../components/CartDrawer';

export { AuthContext, AuthProvider } from './AuthContext';
export { CarritoContext, CarritoProvider } from './CarritoContext';

export function StoreProvider({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CarritoProvider>
        {children}
        <CartDrawer />
      </CarritoProvider>
    </AuthProvider>
  );
}
