import type { StateCreator } from 'zustand'
import { db } from '../db/schema'
import type { Ajustes } from '../lib/tipos'
import type { Tienda } from './tienda'

export type AjustesSlice = {
  /** Null hasta que el usuario dice cuánto cobra por quincena. */
  ajustes: Ajustes | null
  cargarAjustes: () => Promise<void>
  guardarIngresoQuincenal: (ingresoQuincenal: number) => Promise<void>
  /** Cambia solo los campos indicados. Requiere que ya exista el ingreso. */
  guardarAjustes: (cambios: Partial<Omit<Ajustes, 'id'>>) => Promise<void>
}

export const crearAjustesSlice: StateCreator<Tienda, [], [], AjustesSlice> = (set, get) => ({
  ajustes: null,

  cargarAjustes: async () => {
    const ajustes = (await db.ajustes.get('ajustes')) ?? null
    set({ ajustes })
  },

  guardarIngresoQuincenal: async (ingresoQuincenal) => {
    const ajustes: Ajustes = { ...(get().ajustes ?? { id: 'ajustes', ingresoQuincenal }), ingresoQuincenal }
    await db.ajustes.put(ajustes)
    set({ ajustes })
  },

  guardarAjustes: async (cambios) => {
    const actuales = get().ajustes
    if (!actuales) return
    const ajustes: Ajustes = { ...actuales, ...cambios }
    await db.ajustes.put(ajustes)
    set({ ajustes })
  },
})
