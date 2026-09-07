import { create } from 'zustand'
import { crearAjustesSlice, type AjustesSlice } from './ajustes'
import { crearCategoriasSlice, type CategoriasSlice } from './categorias'
import { crearCiclosSlice, type CiclosSlice } from './ciclos'
import { crearFijosSlice, type FijosSlice } from './fijos'
import { crearGastosSlice, type GastosSlice } from './gastos'
import { crearMsiSlice, type MsiSlice } from './msi'

type Arranque = {
  /** true cuando todas las tablas ya se leyeron de IndexedDB. */
  listo: boolean
  cargarTodo: () => Promise<void>
}

/**
 * Única fuente de verdad en memoria. Cada acción escribe en Dexie primero
 * y después refleja el cambio aquí; así la UI nunca muestra algo que no esté guardado.
 */
export type Tienda = GastosSlice & CategoriasSlice & CiclosSlice & FijosSlice & MsiSlice & AjustesSlice & Arranque

export const useTienda = create<Tienda>()((...a) => {
  const [set, get] = a
  return {
    ...crearGastosSlice(...a),
    ...crearCategoriasSlice(...a),
    ...crearCiclosSlice(...a),
    ...crearFijosSlice(...a),
    ...crearMsiSlice(...a),
    ...crearAjustesSlice(...a),
    listo: false,
    cargarTodo: async () => {
      const { cargarGastos, cargarCategorias, cargarCiclos, cargarFijos, cargarMSI, cargarAjustes } = get()
      await Promise.all([cargarGastos(), cargarCategorias(), cargarCiclos(), cargarFijos(), cargarMSI(), cargarAjustes()])
      set({ listo: true })
    },
  }
})
