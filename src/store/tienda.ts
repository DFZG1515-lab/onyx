import { create } from 'zustand'
import { db } from '../db/schema'
import type { Respaldo } from '../lib/respaldo'
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
  /** Reemplaza todo con un respaldo. Las fotos de tickets no se tocan. */
  restaurarRespaldo: (datos: Respaldo['datos']) => Promise<void>
  /** Borra todos los datos del dispositivo. */
  borrarTodo: () => Promise<void>
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
    restaurarRespaldo: async (datos) => {
      await db.transaction('rw', [db.gastos, db.categorias, db.ciclos, db.gastosFijos, db.comprasMSI, db.ajustes], async () => {
        await Promise.all([db.gastos.clear(), db.categorias.clear(), db.ciclos.clear(), db.gastosFijos.clear(), db.comprasMSI.clear(), db.ajustes.clear()])
        await db.gastos.bulkPut(datos.gastos)
        await db.categorias.bulkPut(datos.categorias)
        await db.ciclos.bulkPut(datos.ciclos)
        await db.gastosFijos.bulkPut(datos.gastosFijos)
        await db.comprasMSI.bulkPut(datos.comprasMSI)
        if (datos.ajustes) await db.ajustes.put(datos.ajustes)
      })
      await get().cargarTodo()
    },
    borrarTodo: async () => {
      await db.transaction('rw', [db.gastos, db.categorias, db.ciclos, db.gastosFijos, db.comprasMSI, db.ajustes, db.fotos], async () => {
        await Promise.all([db.gastos.clear(), db.ciclos.clear(), db.gastosFijos.clear(), db.comprasMSI.clear(), db.ajustes.clear(), db.fotos.clear()])
      })
      await get().cargarTodo()
    },
  }
})
