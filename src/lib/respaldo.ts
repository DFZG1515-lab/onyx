import type { Ajustes, Categoria, Ciclo, CompraMSI, Deuda, Gasto, GastoFijo, Ingreso } from './tipos'

/** Respaldo completo en JSON. Las fotos de tickets no van: son pesadas y viven solo en el dispositivo. */
export type Respaldo = {
  version: 2
  creadoEn: number
  datos: {
    gastos: Gasto[]
    categorias: Categoria[]
    ciclos: Ciclo[]
    gastosFijos: GastoFijo[]
    comprasMSI: CompraMSI[]
    ingresos: Ingreso[]
    deudas: Deuda[]
    ajustes: Ajustes | null
  }
}

export function crearRespaldo(datos: Respaldo['datos'], creadoEn = Date.now()): string {
  const respaldo: Respaldo = { version: 2, creadoEn, datos }
  return JSON.stringify(respaldo, null, 2)
}

const esObjeto = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null
const esTexto = (x: unknown): x is string => typeof x === 'string'
const esEntero = (x: unknown): x is number => typeof x === 'number' && Number.isInteger(x)
const esNumero = (x: unknown): x is number => typeof x === 'number' && Number.isFinite(x)

function esGasto(x: unknown): x is Gasto {
  return esObjeto(x) && esTexto(x.id) && esTexto(x.descripcion) && esEntero(x.monto) && esTexto(x.categoriaId) && esTexto(x.metodo) && esNumero(x.fecha) && esTexto(x.cicloId) && esNumero(x.creadoEn)
}
function esCategoria(x: unknown): x is Categoria {
  return esObjeto(x) && esTexto(x.id) && esTexto(x.nombre) && esEntero(x.tope) && Array.isArray(x.claves) && x.claves.every(esTexto)
}
function esCiclo(x: unknown): x is Ciclo {
  return esObjeto(x) && esTexto(x.id) && esNumero(x.inicio) && esNumero(x.fin) && esEntero(x.ingresoEsperado)
}
function esFijo(x: unknown): x is GastoFijo {
  return esObjeto(x) && esTexto(x.id) && esTexto(x.descripcion) && esEntero(x.monto) && esEntero(x.diaDelMes) && typeof x.activo === 'boolean'
}
function esMSI(x: unknown): x is CompraMSI {
  return esObjeto(x) && esTexto(x.id) && esTexto(x.descripcion) && esEntero(x.montoTotal) && esEntero(x.meses) && esNumero(x.fechaCompra)
}
function esIngreso(x: unknown): x is Ingreso {
  return esObjeto(x) && esTexto(x.id) && esTexto(x.descripcion) && esEntero(x.monto) && esNumero(x.fecha) && esTexto(x.cicloId)
}
function esDeuda(x: unknown): x is Deuda {
  return esObjeto(x) && esTexto(x.id) && esTexto(x.descripcion) && esEntero(x.monto) && esNumero(x.fecha) && esTexto(x.gastoId) && typeof x.cobrada === 'boolean'
}
function esAjustes(x: unknown): x is Ajustes {
  return esObjeto(x) && x.id === 'ajustes' && esEntero(x.ingresoQuincenal)
}

/** Devuelve el respaldo si el texto es válido; null si no lo es. Acepta las versiones 1 y 2. */
export function leerRespaldo(texto: string): Respaldo | null {
  let crudo: unknown
  try {
    crudo = JSON.parse(texto)
  } catch {
    return null
  }
  if (!esObjeto(crudo) || (crudo.version !== 1 && crudo.version !== 2) || !esNumero(crudo.creadoEn) || !esObjeto(crudo.datos)) return null
  // Un respaldo de la versión 1 no traía ingresos ni deudas.
  const d: Record<string, unknown> = { ingresos: [], deudas: [], ...crudo.datos }
  const listas = [
    [d.gastos, esGasto],
    [d.categorias, esCategoria],
    [d.ciclos, esCiclo],
    [d.gastosFijos, esFijo],
    [d.comprasMSI, esMSI],
    [d.ingresos, esIngreso],
    [d.deudas, esDeuda],
  ] as const
  for (const [lista, valida] of listas) {
    if (!Array.isArray(lista) || !lista.every((x) => valida(x))) return null
  }
  if (d.ajustes !== null && !esAjustes(d.ajustes)) return null
  return { version: 2, creadoEn: crudo.creadoEn, datos: d as Respaldo['datos'] }
}
