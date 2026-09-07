import { diaCalendario } from './ciclos'
import type { Ciclo } from './tipos'

/** Texto de fechas en español de México. Sin Intl para que las abreviaturas sean estables. */

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
const DIAS_CORTOS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']

function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

function nombreMes(indice: number): string {
  return MESES[indice] ?? ''
}

/** "Hoy", "Ayer" o "Sáb 5 sep". */
export function etiquetaDia(fecha: number, hoy: number): string {
  const diferencia = diaCalendario(hoy) - diaCalendario(fecha)
  if (diferencia === 0) return 'Hoy'
  if (diferencia === 1) return 'Ayer'
  const d = new Date(fecha)
  return `${capitalizar(DIAS_CORTOS[d.getDay()] ?? '')} ${d.getDate()} ${MESES_CORTOS[d.getMonth()] ?? ''}`
}

/** "1 al 15 de septiembre". */
export function rangoDeCiclo(ciclo: Pick<Ciclo, 'inicio' | 'fin'>): string {
  const inicio = new Date(ciclo.inicio)
  const fin = new Date(ciclo.fin)
  return `${inicio.getDate()} al ${fin.getDate()} de ${nombreMes(inicio.getMonth())}`
}

/** "15 de septiembre". */
export function fechaCorta(fecha: number): string {
  const d = new Date(fecha)
  return `${d.getDate()} de ${nombreMes(d.getMonth())}`
}

/** "15 de septiembre de 2027". */
export function fechaLarga(fecha: number): string {
  return `${fechaCorta(fecha)} de ${new Date(fecha).getFullYear()}`
}

/** "sep 2027", para listas compactas. */
export function mesCorto(fecha: number): string {
  const d = new Date(fecha)
  return `${MESES_CORTOS[d.getMonth()] ?? ''} ${d.getFullYear()}`
}

/** Epoch ms → "AAAA-MM-DD" en hora local, para <input type="date">. */
export function aFechaInput(fecha: number): string {
  const d = new Date(fecha)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** "AAAA-MM-DD" → epoch ms al mediodía local. Null si el texto no es una fecha. */
export function deFechaInput(texto: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(texto)
  if (!m) return null
  const ms = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12).getTime()
  return Number.isNaN(ms) ? null : ms
}
