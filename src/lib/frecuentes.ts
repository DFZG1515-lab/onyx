import { normalizar } from './parser'
import type { Gasto, Metodo } from './tipos'

/** Los gastos que más se repiten, para convertirlos en chips de un toque. */

export type Frecuente = {
  descripcion: string
  monto: number
  categoriaId: string
  metodo: Metodo
  veces: number
}

export function frecuentes(gastos: Gasto[], limite: number): Frecuente[] {
  const grupos = new Map<string, { ultimo: Gasto; veces: number }>()
  for (const g of gastos) {
    const clave = normalizar(g.descripcion.trim())
    if (!clave) continue
    const grupo = grupos.get(clave)
    if (!grupo) grupos.set(clave, { ultimo: g, veces: 1 })
    else {
      grupo.veces++
      if (g.fecha > grupo.ultimo.fecha) grupo.ultimo = g
    }
  }
  return [...grupos.values()]
    .sort((a, b) => b.veces - a.veces || b.ultimo.fecha - a.ultimo.fecha)
    .slice(0, limite)
    .map(({ ultimo, veces }) => ({
      descripcion: ultimo.descripcion.trim(),
      monto: ultimo.monto,
      categoriaId: ultimo.categoriaId,
      metodo: ultimo.metodo,
      veces,
    }))
}
