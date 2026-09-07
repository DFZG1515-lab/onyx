import { describe, expect, test } from 'vitest'
import { cicloDesdeId } from './ciclos'
import { calcularPresupuesto, fijosPendientes, gastoPorCategoria } from './presupuesto'
import type { CompraMSI, Gasto, GastoFijo } from './tipos'

const fecha = (a: number, m: number, d: number, h = 12) => new Date(a, m - 1, d, h).getTime()

const q1 = cicloDesdeId('2026-09-Q1', 1_500_000)
const q2 = cicloDesdeId('2026-09-Q2', 1_500_000)

function gasto(monto: number, extra: Partial<Gasto> = {}): Gasto {
  return {
    id: crypto.randomUUID(),
    descripcion: 'x',
    monto,
    categoriaId: 'otros',
    metodo: 'tarjeta',
    fecha: fecha(2026, 9, 5),
    cicloId: q1.id,
    creadoEn: 0,
    ...extra,
  }
}

const tele: CompraMSI = { id: 't', descripcion: 'Tele', montoTotal: 1_200_000, meses: 12, fechaCompra: fecha(2026, 8, 20), pagosHechos: 0 }

const renta: GastoFijo = { id: 'r', descripcion: 'Renta', monto: 800_000, diaDelMes: 10, activo: true }
const internet: GastoFijo = { id: 'i', descripcion: 'Internet', monto: 50_000, diaDelMes: 20, activo: true }
const gimnasio: GastoFijo = { id: 'g', descripcion: 'Gimnasio', monto: 60_000, diaDelMes: 12, activo: false }
const tarjeta31: GastoFijo = { id: 'c', descripcion: 'Tarjeta', monto: 100_000, diaDelMes: 31, activo: true }

describe('fijosPendientes', () => {
  test('suma los fijos activos del ciclo cuyo día de cobro aún no pasa', () => {
    expect(fijosPendientes([renta, internet, gimnasio], q1, fecha(2026, 9, 5))).toBe(800_000)
  })

  test('el día del cobro todavía cuenta como pendiente', () => {
    expect(fijosPendientes([renta], q1, fecha(2026, 9, 10))).toBe(800_000)
  })

  test('un fijo ya cobrado deja de estar comprometido', () => {
    expect(fijosPendientes([renta], q1, fecha(2026, 9, 11))).toBe(0)
  })

  test('los fijos de la otra quincena no cuentan', () => {
    expect(fijosPendientes([internet], q1, fecha(2026, 9, 5))).toBe(0)
    expect(fijosPendientes([renta], q2, fecha(2026, 9, 18))).toBe(0)
  })

  test('un día 31 se recorre al último día en meses cortos', () => {
    expect(fijosPendientes([tarjeta31], q2, fecha(2026, 9, 29))).toBe(100_000)
    expect(fijosPendientes([tarjeta31], q2, fecha(2026, 9, 30, 23))).toBe(100_000)
    expect(fijosPendientes([tarjeta31], cicloDesdeId('2026-02-Q2', 0), fecha(2026, 2, 27))).toBe(100_000)
  })
})

describe('calcularPresupuesto', () => {
  test('quincena recién empezada, sin gastos, sin MSI, sin fijos', () => {
    const p = calcularPresupuesto({ ciclo: q1, hoy: fecha(2026, 9, 1), gastos: [], comprasMSI: [], gastosFijos: [] })
    expect(p).toEqual({
      ingreso: 1_500_000,
      gastado: 0,
      msi: 0,
      fijosPendientes: 0,
      comprometido: 0,
      disponible: 1_500_000,
      diasRestantes: 15,
      porDia: 100_000,
      excedido: false,
    })
  })

  test('descuenta gastos, MSI y fijos pendientes antes de mostrar el disponible', () => {
    const p = calcularPresupuesto({
      ciclo: q1,
      hoy: fecha(2026, 9, 7),
      gastos: [gasto(8_500), gasto(12_000)],
      comprasMSI: [tele],
      gastosFijos: [renta, internet],
    })
    expect(p.gastado).toBe(20_500)
    expect(p.msi).toBe(50_000)
    expect(p.fijosPendientes).toBe(800_000)
    expect(p.comprometido).toBe(850_000)
    expect(p.disponible).toBe(1_500_000 - 20_500 - 850_000)
    expect(p.diasRestantes).toBe(9)
    expect(p.porDia).toBe(Math.trunc((1_500_000 - 20_500 - 850_000) / 9))
  })

  test('ignora gastos de otros ciclos', () => {
    const p = calcularPresupuesto({
      ciclo: q1,
      hoy: fecha(2026, 9, 7),
      gastos: [gasto(8_500), gasto(99_999, { cicloId: q2.id })],
      comprasMSI: [],
      gastosFijos: [],
    })
    expect(p.gastado).toBe(8_500)
  })

  test('quincena a punto de cerrar: por día es todo lo que queda', () => {
    const p = calcularPresupuesto({ ciclo: q1, hoy: fecha(2026, 9, 15, 22), gastos: [gasto(1_000_000)], comprasMSI: [], gastosFijos: [] })
    expect(p.diasRestantes).toBe(1)
    expect(p.porDia).toBe(500_000)
  })

  test('disponible negativo marca excedido y el por día también es negativo', () => {
    const p = calcularPresupuesto({ ciclo: q1, hoy: fecha(2026, 9, 7), gastos: [gasto(1_600_000)], comprasMSI: [], gastosFijos: [] })
    expect(p.disponible).toBe(-100_000)
    expect(p.excedido).toBe(true)
    expect(p.porDia).toBe(Math.trunc(-100_000 / 9))
  })

  test('con cero días restantes el por día es igual al disponible', () => {
    const p = calcularPresupuesto({ ciclo: q1, hoy: fecha(2026, 9, 20), gastos: [gasto(200_000)], comprasMSI: [], gastosFijos: [] })
    expect(p.diasRestantes).toBe(0)
    expect(p.porDia).toBe(1_300_000)
  })

  test('el por día siempre es un entero en centavos', () => {
    const p = calcularPresupuesto({ ciclo: q1, hoy: fecha(2026, 9, 7), gastos: [gasto(1)], comprasMSI: [], gastosFijos: [] })
    expect(Number.isInteger(p.porDia)).toBe(true)
  })
})

describe('gastoPorCategoria', () => {
  test('agrupa y ordena de mayor a menor', () => {
    const filas = gastoPorCategoria([
      gasto(100, { categoriaId: 'tienda' }),
      gasto(500, { categoriaId: 'super' }),
      gasto(250, { categoriaId: 'tienda' }),
    ])
    expect(filas).toEqual([
      { categoriaId: 'super', total: 500 },
      { categoriaId: 'tienda', total: 350 },
    ])
  })

  test('sin gastos devuelve una lista vacía', () => {
    expect(gastoPorCategoria([])).toEqual([])
  })
})

describe('fijos ya pagados en este ciclo', () => {
  test('un fijo marcado como pagado en el ciclo deja de estar comprometido', () => {
    const rentaPagada: GastoFijo = { ...renta, ultimoPago: q1.id }
    expect(fijosPendientes([rentaPagada], q1, fecha(2026, 9, 5))).toBe(0)
  })

  test('el pago de un ciclo anterior no cuenta para este', () => {
    const rentaPagadaAntes: GastoFijo = { ...renta, ultimoPago: '2026-08-Q1' }
    expect(fijosPendientes([rentaPagadaAntes], q1, fecha(2026, 9, 5))).toBe(800_000)
  })
})
