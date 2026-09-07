import { describe, expect, test } from 'vitest'
import { cicloDeFecha, cicloDesdeId, diasDelCiclo, diasRestantes, idDeCiclo, idSiguiente, idsSiguientes } from './ciclos'

const fecha = (a: number, m: number, d: number, h = 0, min = 0) => new Date(a, m - 1, d, h, min).getTime()

describe('idDeCiclo', () => {
  test('del 1 al 15 es Q1', () => {
    expect(idDeCiclo(fecha(2026, 9, 1))).toBe('2026-09-Q1')
    expect(idDeCiclo(fecha(2026, 9, 7))).toBe('2026-09-Q1')
    expect(idDeCiclo(fecha(2026, 9, 15, 23, 59))).toBe('2026-09-Q1')
  })

  test('del 16 al fin de mes es Q2', () => {
    expect(idDeCiclo(fecha(2026, 9, 16))).toBe('2026-09-Q2')
    expect(idDeCiclo(fecha(2026, 9, 30, 23, 59))).toBe('2026-09-Q2')
  })

  test('el mes va con dos dígitos', () => {
    expect(idDeCiclo(fecha(2026, 1, 3))).toBe('2026-01-Q1')
  })
})

describe('cicloDeFecha', () => {
  test('Q1 va del primer instante del día 1 al último instante del día 15', () => {
    const c = cicloDeFecha(fecha(2026, 9, 7), 1_500_000)
    expect(c.id).toBe('2026-09-Q1')
    expect(c.inicio).toBe(fecha(2026, 9, 1))
    expect(c.fin).toBe(fecha(2026, 9, 16) - 1)
    expect(c.ingresoEsperado).toBe(1_500_000)
  })

  test('Q2 termina en el último instante del mes', () => {
    const c = cicloDeFecha(fecha(2026, 9, 20), 0)
    expect(c.inicio).toBe(fecha(2026, 9, 16))
    expect(c.fin).toBe(fecha(2026, 10, 1) - 1)
  })

  test('Q2 de febrero bisiesto termina el 29', () => {
    const c = cicloDeFecha(fecha(2028, 2, 20), 0)
    expect(c.fin).toBe(fecha(2028, 3, 1) - 1)
    expect(diasDelCiclo(c)).toBe(14)
  })
})

describe('cicloDesdeId', () => {
  test('reconstruye los límites a partir del id', () => {
    const c = cicloDesdeId('2026-12-Q2', 0)
    expect(c.inicio).toBe(fecha(2026, 12, 16))
    expect(c.fin).toBe(fecha(2027, 1, 1) - 1)
  })

  test('rechaza ids mal formados', () => {
    expect(() => cicloDesdeId('2026-13-Q1', 0)).toThrow()
    expect(() => cicloDesdeId('2026-09-Q3', 0)).toThrow()
    expect(() => cicloDesdeId('hola', 0)).toThrow()
  })
})

describe('idSiguiente e idsSiguientes', () => {
  test('Q1 pasa a Q2 del mismo mes', () => {
    expect(idSiguiente('2026-09-Q1')).toBe('2026-09-Q2')
  })

  test('Q2 de diciembre pasa a Q1 del año siguiente', () => {
    expect(idSiguiente('2026-12-Q2')).toBe('2027-01-Q1')
  })

  test('idsSiguientes devuelve n ciclos posteriores, sin incluir el actual', () => {
    expect(idsSiguientes('2026-09-Q1', 3)).toEqual(['2026-09-Q2', '2026-10-Q1', '2026-10-Q2'])
    expect(idsSiguientes('2026-09-Q1', 0)).toEqual([])
  })
})

describe('diasRestantes', () => {
  const q1 = cicloDeFecha(fecha(2026, 9, 1), 0)

  test('cuenta el día de hoy y el último día del ciclo', () => {
    expect(diasRestantes(q1, fecha(2026, 9, 7, 14, 30))).toBe(9)
  })

  test('recién empezado el ciclo quedan todos los días', () => {
    expect(diasRestantes(q1, fecha(2026, 9, 1, 0, 5))).toBe(15)
  })

  test('el último día queda un día', () => {
    expect(diasRestantes(q1, fecha(2026, 9, 15, 23, 59))).toBe(1)
  })

  test('después del cierre quedan cero', () => {
    expect(diasRestantes(q1, fecha(2026, 9, 16))).toBe(0)
  })

  test('antes del inicio quedan todos los días', () => {
    expect(diasRestantes(q1, fecha(2026, 8, 30))).toBe(15)
  })

  test('Q2 tiene tantos días como le queden al mes', () => {
    expect(diasDelCiclo(cicloDesdeId('2026-09-Q2', 0))).toBe(15)
    expect(diasDelCiclo(cicloDesdeId('2026-10-Q2', 0))).toBe(16)
    expect(diasDelCiclo(cicloDesdeId('2026-02-Q2', 0))).toBe(13)
  })
})
