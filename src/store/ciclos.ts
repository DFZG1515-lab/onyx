import type { StateCreator } from 'zustand'
import { db } from '../db/schema'
import { cicloDesdeId } from '../lib/ciclos'
import type { Ciclo } from '../lib/tipos'
import type { Tienda } from './tienda'

export type CiclosSlice = {
  ciclos: Ciclo[]
  cargarCiclos: () => Promise<void>
  guardarCiclo: (ciclo: Ciclo) => Promise<void>
  /** Devuelve el ciclo con ese id; si no existe lo crea con el ingreso quincenal de los ajustes. */
  asegurarCiclo: (id: string) => Promise<Ciclo>
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

  asegurarCiclo: async (id) => {
    const existente = get().ciclos.find((c) => c.id === id)
    if (existente) return existente
    const ciclo = cicloDesdeId(id, get().ajustes?.ingresoQuincenal ?? 0)
    await get().guardarCiclo(ciclo)
    return ciclo
  },
})
