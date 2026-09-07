import type { StateCreator } from 'zustand'
import { db } from '../db/schema'
import { nuevoId } from '../lib/id'
import type { CompraMSI } from '../lib/tipos'
import type { Tienda } from './tienda'

export type MsiSlice = {
  comprasMSI: CompraMSI[]
  cargarMSI: () => Promise<void>
  agregarMSI: (datos: Omit<CompraMSI, 'id'>) => Promise<CompraMSI>
  actualizarMSI: (id: string, cambios: Partial<Omit<CompraMSI, 'id'>>) => Promise<void>
  borrarMSI: (id: string) => Promise<void>
}

export const crearMsiSlice: StateCreator<Tienda, [], [], MsiSlice> = (set, get) => ({
  comprasMSI: [],

  cargarMSI: async () => {
    const comprasMSI = await db.comprasMSI.orderBy('fechaCompra').toArray()
    set({ comprasMSI })
  },

  agregarMSI: async (datos) => {
    const compra: CompraMSI = { ...datos, id: nuevoId() }
    await db.comprasMSI.add(compra)
    set({ comprasMSI: [...get().comprasMSI, compra] })
    return compra
  },

  actualizarMSI: async (id, cambios) => {
    await db.comprasMSI.update(id, cambios)
    set({ comprasMSI: get().comprasMSI.map((c) => (c.id === id ? { ...c, ...cambios } : c)) })
  },

  borrarMSI: async (id) => {
    await db.comprasMSI.delete(id)
    set({ comprasMSI: get().comprasMSI.filter((c) => c.id !== id) })
  },
})
