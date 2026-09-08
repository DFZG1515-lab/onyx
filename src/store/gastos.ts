import type { StateCreator } from 'zustand'
import { db } from '../db/schema'
import { nuevoId } from '../lib/id'
import type { Gasto } from '../lib/tipos'
import type { Tienda } from './tienda'

export type GastoNuevo = Omit<Gasto, 'id' | 'creadoEn'>

export type GastosSlice = {
  gastos: Gasto[]
  cargarGastos: () => Promise<void>
  agregarGasto: (datos: GastoNuevo, foto?: Blob) => Promise<Gasto>
  actualizarGasto: (id: string, cambios: Partial<Omit<Gasto, 'id' | 'creadoEn'>>) => Promise<void>
  borrarGasto: (id: string) => Promise<void>
}

export const crearGastosSlice: StateCreator<Tienda, [], [], GastosSlice> = (set, get) => ({
  gastos: [],

  cargarGastos: async () => {
    const gastos = await db.gastos.orderBy('fecha').reverse().toArray()
    set({ gastos })
  },

  agregarGasto: async (datos, foto) => {
    const gasto: Gasto = { ...datos, id: nuevoId(), creadoEn: Date.now() }
    if (foto) {
      const fotoId = nuevoId()
      await db.fotos.add({ id: fotoId, gastoId: gasto.id, blob: foto, creadoEn: gasto.creadoEn })
      gasto.fotoId = fotoId
    }
    await db.gastos.add(gasto)
    set({ gastos: [gasto, ...get().gastos] })
    return gasto
  },

  actualizarGasto: async (id, cambios) => {
    await db.gastos.update(id, cambios)
    set({ gastos: get().gastos.map((g) => (g.id === id ? { ...g, ...cambios } : g)) })
  },

  borrarGasto: async (id) => {
    await db.fotos.where('gastoId').equals(id).delete()
    await db.gastos.delete(id)
    set({ gastos: get().gastos.filter((g) => g.id !== id) })
  },
})
