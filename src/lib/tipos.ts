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
  /** Id de la foto del ticket en la tabla `fotos`, si el usuario adjuntó una. */
  fotoId?: string
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
  /** Id del último ciclo en el que el usuario marcó este fijo como pagado. */
  ultimoPago?: string
}

export type CompraMSI = {
  id: string
  descripcion: string
  montoTotal: number
  meses: number
  fechaCompra: number
  /** Quincena del primer cargo, si el corte de la tarjeta no coincide con la quincena siguiente a la compra. */
  primerPagoCicloId?: string
}

/** Dinero que entra además del ingreso esperado: bono, aguinaldo, un préstamo que te devuelven. */
export type Ingreso = {
  id: string
  descripcion: string
  monto: number
  fecha: number
  cicloId: string
}

/** Lo que te deben de un gasto compartido. */
export type Deuda = {
  id: string
  descripcion: string
  monto: number
  fecha: number
  gastoId: string
  cobrada: boolean
}

export type Foto = {
  id: string
  gastoId: string
  blob: Blob
  creadoEn: number
}

export type Tema = 'sistema' | 'claro' | 'oscuro'

export type Ajustes = {
  id: 'ajustes'
  /** Ingreso por quincena que se usa al abrir cada ciclo nuevo. */
  ingresoQuincenal: number
  /** Avisar cuando una categoría pasa del 80 por ciento de su tope. Por defecto sí. */
  avisoTopes?: boolean
  /** Id del último ciclo cuyo cierre ya se mostró. */
  ultimoCierreVisto?: string
  /** Descripciones (normalizadas) de recurrentes que el usuario pidió no volver a sugerir. */
  recurrentesIgnorados?: string[]
  /** true cuando terminó la lista de primer uso. */
  primerUsoCompleto?: boolean
  tema?: Tema
}
