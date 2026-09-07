import { normalizar } from './parser'
import type { Categoria, Gasto, Metodo } from './tipos'

/**
 * Con solo el "dónde o en qué", propone categoría y método y explica por qué.
 * Primero manda tu historial (el último gasto igual); si no hay, las claves de las categorías.
 */
export type Sugerencia = {
  categoriaId: string
  metodo: Metodo
  razonCategoria: string | null
  razonMetodo: string | null
}

const POR_DEFECTO: Sugerencia = { categoriaId: 'otros', metodo: 'tarjeta', razonCategoria: null, razonMetodo: null }

function claveQueDispara(texto: string, categorias: Pick<Categoria, 'id' | 'claves'>[]): { id: string; clave: string } | null {
  const acolchado = ` ${texto} `
  const candidatas = categorias
    .flatMap((c) => c.claves.map((clave) => ({ id: c.id, clave: normalizar(clave) })))
    .sort((a, b) => b.clave.length - a.clave.length)
  return candidatas.find(({ clave }) => acolchado.includes(` ${clave} `)) ?? null
}

export function sugerir(descripcion: string, categorias: Pick<Categoria, 'id' | 'claves'>[], gastos: Gasto[]): Sugerencia {
  const texto = normalizar(descripcion.trim()).replace(/\s+/g, ' ')
  if (!texto) return POR_DEFECTO

  const iguales = gastos.filter((g) => normalizar(g.descripcion.trim()).replace(/\s+/g, ' ') === texto)
  const ultimo = iguales.reduce<Gasto | null>((mejor, g) => (mejor === null || g.fecha > mejor.fecha ? g : mejor), null)
  if (ultimo) {
    return { categoriaId: ultimo.categoriaId, metodo: ultimo.metodo, razonCategoria: 'como la última vez', razonMetodo: 'como la última vez' }
  }

  const clave = claveQueDispara(texto, categorias)
  if (!clave) return POR_DEFECTO
  return { ...POR_DEFECTO, categoriaId: clave.id, razonCategoria: `porque dijiste ${clave.clave}` }
}
