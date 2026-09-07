import type { StateCreator } from 'zustand'
import { db } from '../db/schema'
import type { Ciclo } from '../lib/tipos'
import type { Tienda } from './tienda'

export type CiclosSlice = {
  ciclos: Ciclo[]
  cargarCiclos: () => Promise<void>
  guardarCiclo: (ciclo: Ciclo) => Promise<void>
}

export const crearCiclosSlice: StateCreator<Tienda, [], [], CiclosSlice> = (set, get) => ({
  ciclos: [],

  cargarCiclos: async () => {
    const ciclos = await db.ciclos.orderBy('inicio').toArray()
    set({ ciclos })
  },

  guardarCiclo: async (ciclo) => {
    await db.ciclos.put(ciclo)
    const restantes = get().ciclos.filter((c) => c.id !== ciclo.id)
    set({ ciclos: [...restantes, ciclo].sort((a, b) => a.inicio - b.inicio) })
  },
})
