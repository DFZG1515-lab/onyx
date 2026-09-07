import type { StateCreator } from 'zustand'
import { db } from '../db/schema'
import { nuevoId } from '../lib/id'
import type { GastoFijo } from '../lib/tipos'
import type { Tienda } from './tienda'

export type FijosSlice = {
  gastosFijos: GastoFijo[]
  cargarFijos: () => Promise<void>
  agregarFijo: (datos: Omit<GastoFijo, 'id'>) => Promise<GastoFijo>
  actualizarFijo: (id: string, cambios: Partial<Omit<GastoFijo, 'id'>>) => Promise<void>
  borrarFijo: (id: string) => Promise<void>
}

export const crearFijosSlice: StateCreator<Tienda, [], [], FijosSlice> = (set, get) => ({
  gastosFijos: [],

  cargarFijos: async () => {
    const gastosFijos = await db.gastosFijos.toArray()
    set({ gastosFijos })
  },

  agregarFijo: async (datos) => {
    const fijo: GastoFijo = { ...datos, id: nuevoId() }
    await db.gastosFijos.add(fijo)
    set({ gastosFijos: [...get().gastosFijos, fijo] })
    return fijo
  },

  actualizarFijo: async (id, cambios) => {
    await db.gastosFijos.update(id, cambios)
    set({ gastosFijos: get().gastosFijos.map((f) => (f.id === id ? { ...f, ...cambios } : f)) })
  },

  borrarFijo: async (id) => {
    await db.gastosFijos.delete(id)
    set({ gastosFijos: get().gastosFijos.filter((f) => f.id !== id) })
  },
})
