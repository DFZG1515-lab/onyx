import { describe, expect, test } from 'vitest'
import { cicloDesdeId } from './ciclos'
import { etiquetaDia, fechaCorta, fechaLarga, rangoDeCiclo } from './fechas'

const fecha = (a: number, m: number, d: number, h = 12) => new Date(a, m - 1, d, h).getTime()
const hoy = fecha(2026, 9, 7)

describe('etiquetaDia', () => {
  test('hoy y ayer tienen nombre propio', () => {
    expect(etiquetaDia(fecha(2026, 9, 7, 8), hoy)).toBe('Hoy')
    expect(etiquetaDia(fecha(2026, 9, 6, 23), hoy)).toBe('Ayer')
  })

  test('el resto lleva día de la semana, número y mes, en formato de oración', () => {
    expect(etiquetaDia(fecha(2026, 9, 5), hoy)).toBe('Sáb 5 sep')
    expect(etiquetaDia(fecha(2026, 8, 31), hoy)).toBe('Lun 31 ago')
  })
})

describe('rangoDeCiclo', () => {
  test('describe la quincena en palabras', () => {
    expect(rangoDeCiclo(cicloDesdeId('2026-09-Q1', 0))).toBe('1 al 15 de septiembre')
    expect(rangoDeCiclo(cicloDesdeId('2026-09-Q2', 0))).toBe('16 al 30 de septiembre')
    expect(rangoDeCiclo(cicloDesdeId('2026-02-Q2', 0))).toBe('16 al 28 de febrero')
  })
})

describe('fechaCorta y fechaLarga', () => {
  test('fecha corta: día y mes', () => {
    expect(fechaCorta(fecha(2026, 9, 15))).toBe('15 de septiembre')
  })

  test('fecha larga: día, mes y año', () => {
    expect(fechaLarga(fecha(2027, 9, 15))).toBe('15 de septiembre de 2027')
  })
})
