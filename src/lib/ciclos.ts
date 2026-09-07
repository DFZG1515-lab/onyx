import type { Ciclo } from './tipos'

/**
 * Quincenas. Q1 va del día 1 al 15; Q2 del 16 al fin de mes.
 * Todo se calcula en hora local del dispositivo, que es donde vive el usuario.
 */

const PATRON_ID = /^(\d{4})-(\d{2})-Q([12])$/

type Partes = { anio: number; mes: number; quincena: 1 | 2 }

function partesDeId(id: string): Partes {
  const m = PATRON_ID.exec(id)
  if (!m) throw new Error(`Id de ciclo inválido: ${id}`)
  const anio = Number(m[1])
  const mes = Number(m[2])
  const quincena = Number(m[3]) as 1 | 2
  if (mes < 1 || mes > 12) throw new Error(`Id de ciclo inválido: ${id}`)
  return { anio, mes, quincena }
}

function idDePartes({ anio, mes, quincena }: Partes): string {
  return `${anio}-${String(mes).padStart(2, '0')}-Q${quincena}`
}

function limites({ anio, mes, quincena }: Partes): { inicio: number; fin: number } {
  // Los meses de Date van de 0 a 11; el día 0 del mes siguiente es el último de este.
  const inicio = new Date(anio, mes - 1, quincena === 1 ? 1 : 16).getTime()
  const fin = quincena === 1 ? new Date(anio, mes - 1, 16).getTime() - 1 : new Date(anio, mes, 1).getTime() - 1
  return { inicio, fin }
}

export function idDeCiclo(fecha: number): string {
  const d = new Date(fecha)
  return idDePartes({ anio: d.getFullYear(), mes: d.getMonth() + 1, quincena: d.getDate() <= 15 ? 1 : 2 })
}

export function cicloDesdeId(id: string, ingresoEsperado: number): Ciclo {
  const partes = partesDeId(id)
  return { id: idDePartes(partes), ...limites(partes), ingresoEsperado }
}

export function cicloDeFecha(fecha: number, ingresoEsperado: number): Ciclo {
  return cicloDesdeId(idDeCiclo(fecha), ingresoEsperado)
}

export function idSiguiente(id: string): string {
  const { anio, mes, quincena } = partesDeId(id)
  if (quincena === 1) return idDePartes({ anio, mes, quincena: 2 })
  return mes === 12 ? idDePartes({ anio: anio + 1, mes: 1, quincena: 1 }) : idDePartes({ anio, mes: mes + 1, quincena: 1 })
}

/** Los n ciclos posteriores a `id`, en orden, sin incluirlo. */
export function idsSiguientes(id: string, n: number): string[] {
  const ids: string[] = []
  let actual = id
  for (let i = 0; i < n; i++) {
    actual = idSiguiente(actual)
    ids.push(actual)
  }
  return ids
}

/** Día calendario como entero, inmune al horario de verano. */
function diaCalendario(fecha: number): number {
  const d = new Date(fecha)
  return Math.round(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86_400_000)
}

export function diasDelCiclo(ciclo: Pick<Ciclo, 'inicio' | 'fin'>): number {
  return diaCalendario(ciclo.fin) - diaCalendario(ciclo.inicio) + 1
}

/** Días que quedan en el ciclo contando el de hoy. Cero si el ciclo ya cerró. */
export function diasRestantes(ciclo: Pick<Ciclo, 'inicio' | 'fin'>, hoy: number): number {
  if (hoy > ciclo.fin) return 0
  if (hoy < ciclo.inicio) return diasDelCiclo(ciclo)
  return diaCalendario(ciclo.fin) - diaCalendario(hoy) + 1
}
