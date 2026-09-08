import type { StateCreator } from 'zustand'
import { db } from '../db/schema'
import { nuevoId } from '../lib/id'
import type { Deuda } from '../lib/tipos'
import type { Tienda } from './tienda'

export type DeudasSlice = {
  deudas: Deuda[]
  cargarDeudas: () => Promise<void>
  agregarDeuda: (datos: Omit<Deuda, 'id'>) => Promise<Deuda>
  marcarCobrada: (id: string) => Promise<void>
  borrarDeuda: (id: string) => Promise<void>
}

export const crearDeudasSlice: StateCreator<Tienda, [], [], DeudasSlice> = (set, get) => ({
  deudas: [],

  cargarDeudas: async () => {
    const deudas = await db.deudas.toArray()
    set({ deudas })
  },

  agregarDeuda: async (datos) => {
    const deuda: Deuda = { ...datos, id: nuevoId() }
    await db.deudas.add(deuda)
    set({ deudas: [...get().deudas, deuda] })
    return deuda
  },

  marcarCobrada: async (id) => {
    await db.deudas.update(id, { cobrada: true })
    set({ deudas: get().deudas.map((d) => (d.id === id ? { ...d, cobrada: true } : d)) })
  },

  borrarDeuda: async (id) => {
    await db.deudas.delete(id)
    set({ deudas: get().deudas.filter((d) => d.id !== id) })
  },
})
