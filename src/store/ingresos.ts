import type { StateCreator } from 'zustand'
import { db } from '../db/schema'
import { nuevoId } from '../lib/id'
import type { Ingreso } from '../lib/tipos'
import type { Tienda } from './tienda'

export type IngresosSlice = {
  ingresos: Ingreso[]
  cargarIngresos: () => Promise<void>
  agregarIngreso: (datos: Omit<Ingreso, 'id'>) => Promise<Ingreso>
  borrarIngreso: (id: string) => Promise<void>
}

export const crearIngresosSlice: StateCreator<Tienda, [], [], IngresosSlice> = (set, get) => ({
  ingresos: [],

  cargarIngresos: async () => {
    const ingresos = await db.ingresos.toArray()
    set({ ingresos })
  },

  agregarIngreso: async (datos) => {
    const ingreso: Ingreso = { ...datos, id: nuevoId() }
    await db.ingresos.add(ingreso)
    set({ ingresos: [...get().ingresos, ingreso] })
    return ingreso
  },

  borrarIngreso: async (id) => {
    await db.ingresos.delete(id)
    set({ ingresos: get().ingresos.filter((i) => i.id !== id) })
  },
})
