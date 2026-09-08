import { create } from 'zustand'
import { db } from '../db/schema'
import type { Respaldo } from '../lib/respaldo'
import { crearAjustesSlice, type AjustesSlice } from './ajustes'
import { crearCategoriasSlice, type CategoriasSlice } from './categorias'
import { crearCiclosSlice, type CiclosSlice } from './ciclos'
import { crearDeudasSlice, type DeudasSlice } from './deudas'
import { crearFijosSlice, type FijosSlice } from './fijos'
import { crearGastosSlice, type GastosSlice } from './gastos'
import { crearIngresosSlice, type IngresosSlice } from './ingresos'
import { crearMsiSlice, type MsiSlice } from './msi'

type Arranque = {
  /** true cuando todas las tablas ya se leyeron de IndexedDB. */
  listo: boolean
  /** Mensaje si IndexedDB no abrió: modo privado, sin espacio, bloqueado. */
  errorAlmacenamiento: string | null
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
export type Tienda = GastosSlice & CategoriasSlice & CiclosSlice & FijosSlice & MsiSlice & AjustesSlice & IngresosSlice & DeudasSlice & Arranque

const TABLAS = () => [db.gastos, db.categorias, db.ciclos, db.gastosFijos, db.comprasMSI, db.ajustes, db.ingresos, db.deudas]

export const useTienda = create<Tienda>()((...a) => {
  const [set, get] = a
  return {
    ...crearGastosSlice(...a),
    ...crearCategoriasSlice(...a),
    ...crearCiclosSlice(...a),
    ...crearFijosSlice(...a),
    ...crearMsiSlice(...a),
    ...crearAjustesSlice(...a),
    ...crearIngresosSlice(...a),
    ...crearDeudasSlice(...a),
    listo: false,
    errorAlmacenamiento: null,
    cargarTodo: async () => {
      const { cargarGastos, cargarCategorias, cargarCiclos, cargarFijos, cargarMSI, cargarAjustes, cargarIngresos, cargarDeudas } = get()
      try {
        await Promise.all([cargarGastos(), cargarCategorias(), cargarCiclos(), cargarFijos(), cargarMSI(), cargarAjustes(), cargarIngresos(), cargarDeudas()])
        set({ listo: true, errorAlmacenamiento: null })
      } catch (e) {
        set({ listo: true, errorAlmacenamiento: e instanceof Error ? `${e.name}: ${e.message}` : String(e) })
      }
    },
    restaurarRespaldo: async (datos) => {
      await db.transaction('rw', TABLAS(), async () => {
        await Promise.all(TABLAS().map((t) => t.clear()))
        await db.gastos.bulkPut(datos.gastos)
        await db.categorias.bulkPut(datos.categorias)
        await db.ciclos.bulkPut(datos.ciclos)
        await db.gastosFijos.bulkPut(datos.gastosFijos)
        await db.comprasMSI.bulkPut(datos.comprasMSI)
        await db.ingresos.bulkPut(datos.ingresos)
        await db.deudas.bulkPut(datos.deudas)
        if (datos.ajustes) await db.ajustes.put(datos.ajustes)
      })
      await get().cargarTodo()
    },
    borrarTodo: async () => {
      await db.transaction('rw', [...TABLAS(), db.fotos], async () => {
        await Promise.all([db.gastos, db.ciclos, db.gastosFijos, db.comprasMSI, db.ajustes, db.fotos, db.ingresos, db.deudas].map((t) => t.clear()))
      })
      await get().cargarTodo()
    },
  }
})
