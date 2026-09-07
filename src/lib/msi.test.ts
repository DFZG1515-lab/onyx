import { describe, expect, test } from 'vitest'
import { cicloDesdeId } from './ciclos'
import { avanceDeCompra, calendarioDePagos, fechaLiberacion, pagoEnCiclo, totalMSIEnCiclo, totalPendiente } from './msi'
import type { CompraMSI } from './tipos'

const fecha = (a: number, m: number, d: number) => new Date(a, m - 1, d, 12).getTime()

const tele: CompraMSI = {
  id: 'tele',
  descripcion: 'Tele',
  montoTotal: 1_200_000,
  meses: 12,
  fechaCompra: fecha(2026, 9, 7),
  pagosHechos: 0,
}

const celular: CompraMSI = {
  id: 'cel',
  descripcion: 'Celular',
  montoTotal: 10_000,
  meses: 3,
  fechaCompra: fecha(2026, 9, 20),
  pagosHechos: 0,
}

describe('calendarioDePagos', () => {
  test('una compra a 12 meses se reparte en 24 quincenas', () => {
    expect(calendarioDePagos(tele)).toHaveLength(24)
  })

  test('el primer pago cae en la quincena siguiente a la compra', () => {
    expect(calendarioDePagos(tele)[0]?.cicloId).toBe('2026-09-Q2')
    expect(calendarioDePagos(celular)[0]?.cicloId).toBe('2026-10-Q1')
  })

  test('el último pago cae 24 quincenas después', () => {
    expect(calendarioDePagos(tele).at(-1)?.cicloId).toBe('2027-09-Q1')
  })

  test('los pagos son iguales cuando el total divide exacto', () => {
    const pagos = calendarioDePagos(tele)
    expect(pagos.every((p) => p.monto === 50_000)).toBe(true)
  })

  test('el residuo del redondeo cae en el último pago y la suma cuadra al centavo', () => {
    const pagos = calendarioDePagos(celular)
    expect(pagos.map((p) => p.monto)).toEqual([1666, 1666, 1666, 1666, 1666, 1670])
    expect(pagos.reduce((s, p) => s + p.monto, 0)).toBe(10_000)
  })
})

describe('pagoEnCiclo y totalMSIEnCiclo', () => {
  test('devuelve el pago de una compra en una quincena dada', () => {
    expect(pagoEnCiclo(tele, '2026-10-Q1')).toBe(50_000)
  })

  test('devuelve cero fuera del calendario de la compra', () => {
    expect(pagoEnCiclo(tele, '2026-09-Q1')).toBe(0)
    expect(pagoEnCiclo(tele, '2027-09-Q2')).toBe(0)
  })

  test('suma los pagos de todas las compras en la quincena', () => {
    expect(totalMSIEnCiclo([tele, celular], '2026-10-Q1')).toBe(51_666)
    expect(totalMSIEnCiclo([tele, celular], '2026-09-Q2')).toBe(50_000)
    expect(totalMSIEnCiclo([], '2026-09-Q2')).toBe(0)
  })
})

describe('avanceDeCompra', () => {
  test('cuenta como pagadas las quincenas ya cerradas', () => {
    const avance = avanceDeCompra(tele, fecha(2026, 10, 20))
    expect(avance).toEqual({ pagados: 2, total: 24, pagado: 100_000, pendiente: 1_100_000 })
  })

  test('antes del primer pago no hay nada pagado', () => {
    expect(avanceDeCompra(tele, fecha(2026, 9, 10)).pagados).toBe(0)
  })

  test('después del último pago todo está pagado', () => {
    const avance = avanceDeCompra(tele, fecha(2027, 12, 1))
    expect(avance.pagados).toBe(24)
    expect(avance.pendiente).toBe(0)
  })
})

describe('totalPendiente y fechaLiberacion', () => {
  test('suma lo que falta por pagar de todas las compras', () => {
    expect(totalPendiente([tele, celular], fecha(2026, 10, 20))).toBe(1_100_000 + 10_000 - 1666)
  })

  test('la fecha de liberación es el cierre de la última quincena con pago', () => {
    expect(fechaLiberacion([tele, celular])).toBe(cicloDesdeId('2027-09-Q1', 0).fin)
  })

  test('sin compras no hay fecha de liberación', () => {
    expect(fechaLiberacion([])).toBeNull()
  })
})
