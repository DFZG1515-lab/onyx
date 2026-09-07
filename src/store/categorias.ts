import type { StateCreator } from 'zustand'
import { db } from '../db/schema'
import type { Categoria } from '../lib/tipos'
import type { Tienda } from './tienda'

export type CategoriasSlice = {
  categorias: Categoria[]
  cargarCategorias: () => Promise<void>
  guardarCategoria: (categoria: Categoria) => Promise<void>
  borrarCategoria: (id: string) => Promise<void>
}

export const crearCategoriasSlice: StateCreator<Tienda, [], [], CategoriasSlice> = (set, get) => ({
  categorias: [],

  cargarCategorias: async () => {
    const categorias = await db.categorias.toArray()
    set({ categorias })
  },

  guardarCategoria: async (categoria) => {
    await db.categorias.put(categoria)
    const existe = get().categorias.some((c) => c.id === categoria.id)
    set({
      categorias: existe
        ? get().categorias.map((c) => (c.id === categoria.id ? categoria : c))
        : [...get().categorias, categoria],
    })
  },

  borrarCategoria: async (id) => {
    await db.categorias.delete(id)
    set({ categorias: get().categorias.filter((c) => c.id !== id) })
  },
})
