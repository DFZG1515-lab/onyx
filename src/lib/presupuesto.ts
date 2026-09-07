import { diaCalendario, diasRestantes } from './ciclos'
import { totalMSIEnCiclo } from './msi'
import type { Ciclo, CompraMSI, Gasto, GastoFijo } from './tipos'

/**
 * El cálculo central: "¿me alcanza?".
 *
 *   comprometido = MSI de esta quincena + fijos cuyo día de cobro aún no pasa
 *   disponible   = ingresoEsperado - gastado - comprometido
 *   porDia       = disponible / díasRestantes
 *
 * Funciones puras. Reciben `hoy` por parámetro para poder probarse.
 */

export type EntradaPresupuesto = {
  ciclo: Ciclo
  hoy: number
  gastos: Gasto[]
  comprasMSI: CompraMSI[]
  gastosFijos: GastoFijo[]
}

export type Presupuesto = {
  ingreso: number
  gastado: number
  msi: number
  fijosPendientes: number
  comprometido: number
  disponible: number
  diasRestantes: number
  porDia: number
  excedido: boolean
}

/** Fecha real de cobro de un fijo dentro del mes del ciclo. Un día 31 se recorre al último día del mes. */
function fechaDeCobro(fijo: GastoFijo, ciclo: Ciclo): number {
  const inicio = new Date(ciclo.inicio)
  const ultimoDia = new Date(inicio.getFullYear(), inicio.getMonth() + 1, 0).getDate()
  return new Date(inicio.getFullYear(), inicio.getMonth(), Math.min(fijo.diaDelMes, ultimoDia)).getTime()
}

/** Suma de fijos activos que caen en este ciclo, aún no marcados como pagados, y cuyo día de cobro es hoy o después. */
export function fijosPendientes(fijos: GastoFijo[], ciclo: Ciclo, hoy: number): number {
  return fijos
    .filter((f) => f.activo && f.ultimoPago !== ciclo.id)
    .filter((f) => {
      const cobro = fechaDeCobro(f, ciclo)
      return cobro >= ciclo.inicio && cobro <= ciclo.fin && diaCalendario(cobro) >= diaCalendario(hoy)
    })
    .reduce((suma, f) => suma + f.monto, 0)
}

export function calcularPresupuesto({ ciclo, hoy, gastos, comprasMSI, gastosFijos }: EntradaPresupuesto): Presupuesto {
  const gastado = gastos.filter((g) => g.cicloId === ciclo.id).reduce((suma, g) => suma + g.monto, 0)
  const msi = totalMSIEnCiclo(comprasMSI, ciclo.id)
  const fijos = fijosPendientes(gastosFijos, ciclo, hoy)
  const comprometido = msi + fijos
  const disponible = ciclo.ingresoEsperado - gastado - comprometido
  const dias = diasRestantes(ciclo, hoy)
  return {
    ingreso: ciclo.ingresoEsperado,
    gastado,
    msi,
    fijosPendientes: fijos,
    comprometido,
    disponible,
    diasRestantes: dias,
    porDia: dias === 0 ? disponible : Math.trunc(disponible / dias),
    excedido: disponible < 0,
  }
}

export type FilaCategoria = { categoriaId: string; total: number }

/** Total gastado por categoría, de mayor a menor. */
export function gastoPorCategoria(gastos: Gasto[]): FilaCategoria[] {
  const totales = new Map<string, number>()
  for (const g of gastos) totales.set(g.categoriaId, (totales.get(g.categoriaId) ?? 0) + g.monto)
  return [...totales]
    .map(([categoriaId, total]) => ({ categoriaId, total }))
    .sort((a, b) => b.total - a.total)
}
