/**
 * Modelo de datos. Todo el dinero va en centavos, como enteros.
 * Las fechas van en epoch ms.
 */

export type Metodo = 'efectivo' | 'tarjeta' | 'transferencia'

export type Gasto = {
  id: string
  descripcion: string
  monto: number
  categoriaId: string
  metodo: Metodo
  fecha: number
  cicloId: string
  creadoEn: number
}

export type Categoria = {
  id: string
  nombre: string
  /** Tope quincenal en centavos. 0 significa sin tope. */
  tope: number
  claves: string[]
}

export type Ciclo = {
  /** Formato 'AAAA-MM-Q1' (días 1 al 15) o 'AAAA-MM-Q2' (día 16 al fin de mes). */
  id: string
  inicio: number
  fin: number
  ingresoEsperado: number
}

export type GastoFijo = {
  id: string
  descripcion: string
  monto: number
  diaDelMes: number
  activo: boolean
}

export type CompraMSI = {
  id: string
  descripcion: string
  montoTotal: number
  meses: number
  fechaCompra: number
  pagosHechos: number
}
