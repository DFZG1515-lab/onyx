import { cicloDesdeId, idDeCiclo, idSiguiente, idsSiguientes } from './ciclos'
import type { CompraMSI } from './tipos'

/**
 * Meses sin intereses. Una compra a n meses se reparte en 2n quincenas,
 * empezando en la quincena siguiente a la compra, o en la que el usuario indique como primer cargo. Todo en centavos enteros.
 */

export type PagoMSI = { cicloId: string; monto: number }

type Compra = Pick<CompraMSI, 'montoTotal' | 'meses' | 'fechaCompra' | 'primerPagoCicloId'>

export function calendarioDePagos(compra: Compra): PagoMSI[] {
  const total = compra.meses * 2
  if (total <= 0) return []
  const cuota = Math.floor(compra.montoTotal / total)
  const residuo = compra.montoTotal - cuota * total
  const primero = compra.primerPagoCicloId ?? idSiguiente(idDeCiclo(compra.fechaCompra))
  return [primero, ...idsSiguientes(primero, total - 1)].map((cicloId, i) => ({
    cicloId,
    monto: i === total - 1 ? cuota + residuo : cuota,
  }))
}

export function pagoEnCiclo(compra: Compra, cicloId: string): number {
  return calendarioDePagos(compra).find((p) => p.cicloId === cicloId)?.monto ?? 0
}

export function totalMSIEnCiclo(compras: Compra[], cicloId: string): number {
  return compras.reduce((suma, c) => suma + pagoEnCiclo(c, cicloId), 0)
}

export type Avance = { pagados: number; total: number; pagado: number; pendiente: number }

/** Una quincena cuenta como pagada cuando ya cerró antes de `hoy`. */
export function avanceDeCompra(compra: Compra, hoy: number): Avance {
  const pagos = calendarioDePagos(compra)
  const cerrados = pagos.filter((p) => cicloDesdeId(p.cicloId, 0).fin < hoy)
  const pagado = cerrados.reduce((suma, p) => suma + p.monto, 0)
  return { pagados: cerrados.length, total: pagos.length, pagado, pendiente: compra.montoTotal - pagado }
}

export function totalPendiente(compras: Compra[], hoy: number): number {
  return compras.reduce((suma, c) => suma + avanceDeCompra(c, hoy).pendiente, 0)
}

/** Cierre de la última quincena con pago entre todas las compras. Null si no hay compras. */
export function fechaLiberacion(compras: Compra[]): number | null {
  let maximo: number | null = null
  for (const compra of compras) {
    const ultimo = calendarioDePagos(compra).at(-1)
    if (!ultimo) continue
    const fin = cicloDesdeId(ultimo.cicloId, 0).fin
    if (maximo === null || fin > maximo) maximo = fin
  }
  return maximo
}
