import { diaCalendario, diasDelCiclo, idAnterior, idsSiguientes } from './ciclos'
import { calendarioDePagos, totalMSIEnCiclo } from './msi'
import { normalizar } from './parser'
import type { Categoria, Ciclo, CompraMSI, Gasto, Ingreso } from './tipos'

/** Análisis derivado de los datos: gráfica diaria, proyección, recurrentes, topes, cierre e historial. */

export function gastoPorDia(gastos: Gasto[], ciclo: Ciclo): number[] {
  const dias = new Array<number>(diasDelCiclo(ciclo)).fill(0)
  const base = diaCalendario(ciclo.inicio)
  for (const g of gastos) {
    if (g.cicloId !== ciclo.id) continue
    const i = diaCalendario(g.fecha) - base
    if (i >= 0 && i < dias.length) dias[i] = (dias[i] ?? 0) + g.monto
  }
  return dias
}

/** Día (1-based) con más gasto, o null si no hubo gasto. */
export function diaMasCaro(porDia: number[]): number | null {
  let mejor = -1
  let maximo = 0
  porDia.forEach((v, i) => {
    if (v > maximo) {
      maximo = v
      mejor = i
    }
  })
  return mejor === -1 ? null : mejor + 1
}

export type QuincenaProyectada = { cicloId: string; monto: number; terminan: string[] }

/** Las próximas n quincenas, empezando por la actual, con lo que sale de MSI en cada una. */
export function proyeccionMSI(compras: CompraMSI[], cicloActualId: string, n: number): QuincenaProyectada[] {
  const ids = [cicloActualId, ...idsSiguientes(cicloActualId, Math.max(0, n - 1))]
  return ids.map((cicloId) => ({
    cicloId,
    monto: totalMSIEnCiclo(compras, cicloId),
    terminan: compras.filter((c) => calendarioDePagos(c).at(-1)?.cicloId === cicloId).map((c) => c.descripcion),
  }))
}

export type Recurrente = { descripcion: string; montoPromedio: number; veces: number; categoriaId: string }

/** Misma descripción en tres quincenas seguidas con montos dentro de un 20 por ciento: candidato a gasto fijo. */
export function detectarRecurrente(gastos: Gasto[], descripcion: string, cicloActualId: string): Recurrente | null {
  const clave = normalizar(descripcion.trim())
  if (!clave) return null
  const ids = [cicloActualId, idAnterior(cicloActualId), idAnterior(idAnterior(cicloActualId))]
  const iguales = gastos.filter((g) => normalizar(g.descripcion.trim()) === clave)
  const sumas = ids.map((id) => iguales.filter((g) => g.cicloId === id).reduce((s, g) => s + g.monto, 0))
  if (sumas.some((s) => s === 0)) return null
  const maximo = Math.max(...sumas)
  const minimo = Math.min(...sumas)
  if (maximo / minimo > 1.2) return null
  const reciente = iguales.filter((g) => g.cicloId === cicloActualId).sort((a, b) => b.fecha - a.fecha)[0]
  if (!reciente) return null
  return {
    descripcion: reciente.descripcion.trim(),
    montoPromedio: Math.round(sumas.reduce((s, v) => s + v, 0) / sumas.length),
    veces: 3,
    categoriaId: reciente.categoriaId,
  }
}

const PASO_TOPE = 5_000 // 50 pesos

/** Promedio del gasto por categoría en los últimos tres ciclos cerrados, redondeado hacia arriba a 50 pesos. */
export function topesSugeridos(gastos: Gasto[], ciclosCerradosIds: string[], categorias: Pick<Categoria, 'id'>[]): Record<string, number> {
  const ids = [...ciclosCerradosIds].sort().slice(-3)
  if (ids.length === 0) return {}
  const sugeridos: Record<string, number> = {}
  for (const c of categorias) {
    const total = gastos.filter((g) => g.categoriaId === c.id && ids.includes(g.cicloId)).reduce((s, g) => s + g.monto, 0)
    if (total === 0) continue
    sugeridos[c.id] = Math.ceil(total / ids.length / PASO_TOPE) * PASO_TOPE
  }
  return sugeridos
}

export function sinAsignar(ingreso: number, categorias: Pick<Categoria, 'tope'>[]): number {
  return ingreso - categorias.reduce((s, c) => s + c.tope, 0)
}

/** Categorías con tope que ya usaron el 80 por ciento o más. */
export function categoriasCercaDelTope(gastosDelCiclo: Gasto[], categorias: Pick<Categoria, 'id' | 'tope'>[]): { categoriaId: string; porcentaje: number }[] {
  return categorias
    .filter((c) => c.tope > 0)
    .map((c) => {
      const gastado = gastosDelCiclo.filter((g) => g.categoriaId === c.id).reduce((s, g) => s + g.monto, 0)
      return { categoriaId: c.id, porcentaje: Math.round((gastado / c.tope) * 100) }
    })
    .filter((x) => x.porcentaje >= 80)
}

export type ResumenCiclo = {
  cicloId: string
  inicio: number
  fin: number
  ingreso: number
  gastado: number
  msi: number
  sobrante: number
  categoriaQueMasCrecio: { categoriaId: string; diferencia: number } | null
}

function totalesPorCategoria(gastos: Gasto[], cicloId: string): Map<string, number> {
  const m = new Map<string, number>()
  for (const g of gastos) if (g.cicloId === cicloId) m.set(g.categoriaId, (m.get(g.categoriaId) ?? 0) + g.monto)
  return m
}

export function resumenDeCiclo(ciclo: Ciclo, gastos: Gasto[], compras: CompraMSI[], anterior?: Ciclo, ingresos: Ingreso[] = []): ResumenCiclo {
  const extras = ingresos.filter((i) => i.cicloId === ciclo.id).reduce((s, i) => s + i.monto, 0)
  const ingreso = ciclo.ingresoEsperado + extras
  const gastado = gastos.filter((g) => g.cicloId === ciclo.id).reduce((s, g) => s + g.monto, 0)
  const msi = totalMSIEnCiclo(compras, ciclo.id)
  let categoriaQueMasCrecio: ResumenCiclo['categoriaQueMasCrecio'] = null
  if (anterior) {
    const ahora = totalesPorCategoria(gastos, ciclo.id)
    const antes = totalesPorCategoria(gastos, anterior.id)
    for (const [categoriaId, total] of ahora) {
      const diferencia = total - (antes.get(categoriaId) ?? 0)
      if (diferencia > 0 && (!categoriaQueMasCrecio || diferencia > categoriaQueMasCrecio.diferencia)) categoriaQueMasCrecio = { categoriaId, diferencia }
    }
  }
  return { cicloId: ciclo.id, inicio: ciclo.inicio, fin: ciclo.fin, ingreso, gastado, msi, sobrante: ingreso - gastado - msi, categoriaQueMasCrecio }
}

export type Historial = { ciclos: (ResumenCiclo & { diferenciaConAnterior: number | null })[]; guardadoAcumulado: number }

/** Ciclos ya cerrados, del más reciente al más viejo, y cuánto sobró en total. */
export function historialDeCiclos(ciclos: Ciclo[], gastos: Gasto[], compras: CompraMSI[], hoy: number, ingresos: Ingreso[] = []): Historial {
  const cerrados = ciclos.filter((c) => c.fin < hoy).sort((a, b) => b.inicio - a.inicio)
  const resumenes = cerrados.map((c, i) => {
    const anterior = cerrados[i + 1]
    const r = resumenDeCiclo(c, gastos, compras, anterior, ingresos)
    const ra = anterior ? resumenDeCiclo(anterior, gastos, compras, undefined, ingresos) : null
    return { ...r, diferenciaConAnterior: ra ? r.sobrante - ra.sobrante : null }
  })
  return { ciclos: resumenes, guardadoAcumulado: resumenes.reduce((s, r) => s + Math.max(0, r.sobrante), 0) }
}
