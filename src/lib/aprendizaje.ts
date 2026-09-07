import { normalizar } from './parser'
import type { Categoria } from './tipos'

/**
 * Aprendizaje local: cuando el usuario corrige la categoría de un gasto,
 * las palabras de su descripción pasan a ser claves de esa categoría.
 */

const IGNORADAS = new Set([
  'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'de', 'del', 'al', 'con', 'sin', 'por', 'para', 'en', 'y', 'o', 'que', 'mi', 'mis', 'su', 'sus', 'hoy', 'ayer',
])

function palabrasUtiles(descripcion: string): string[] {
  return [...new Set(normalizar(descripcion).split(/\s+/))].filter(
    (p) => p.length >= 3 && !IGNORADAS.has(p) && !/^\$?[\d.,]+$/.test(p),
  )
}

/** Devuelve solo las categorías que cambiaron, ya actualizadas. */
export function aprenderClaves(categorias: Categoria[], descripcion: string, categoriaId: string): Categoria[] {
  const palabras = palabrasUtiles(descripcion)
  if (palabras.length === 0) return []

  const cambiadas: Categoria[] = []
  for (const categoria of categorias) {
    const claves = categoria.claves
    const nuevas =
      categoria.id === categoriaId
        ? [...claves, ...palabras.filter((p) => !claves.includes(p))]
        : claves.filter((c) => !palabras.includes(c))
    if (nuevas.length !== claves.length) cambiadas.push({ ...categoria, claves: nuevas })
  }
  return cambiadas
}
