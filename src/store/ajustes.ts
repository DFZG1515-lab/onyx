import type { StateCreator } from 'zustand'
import { db } from '../db/schema'
import type { Ajustes } from '../lib/tipos'
import type { Tienda } from './tienda'

export type AjustesSlice = {
  /** Null hasta que el usuario dice cuánto cobra por quincena. */
  ajustes: Ajustes | null
  cargarAjustes: () => Promise<void>
  guardarIngresoQuincenal: (ingresoQuincenal: number) => Promise<void>
}

export const crearAjustesSlice: StateCreator<Tienda, [], [], AjustesSlice> = (set) => ({
  ajustes: null,

  cargarAjustes: async () => {
    const ajustes = (await db.ajustes.get('ajustes')) ?? null
    set({ ajustes })
  },

  guardarIngresoQuincenal: async (ingresoQuincenal) => {
    const ajustes: Ajustes = { id: 'ajustes', ingresoQuincenal }
    await db.ajustes.put(ajustes)
    set({ ajustes })
  },
})
