import { describe, expect, test } from 'vitest'
import { cicloDesdeId } from './ciclos'
import {
  categoriasCercaDelTope,
  detectarRecurrente,
  diaMasCaro,
  gastoPorDia,
  historialDeCiclos,
  proyeccionMSI,
  resumenDeCiclo,
  sinAsignar,
  topesSugeridos,
} from './analisis'
import type { Categoria, CompraMSI, Gasto } from './tipos'

const fecha = (a: number, m: number, d: number, h = 12) => new Date(a, m - 1, d, h).getTime()
const q1 = cicloDesdeId('2026-09-Q1', 1_200_000)
let n = 0
const gasto = (monto: number, f: number, extra: Partial<Gasto> = {}): Gasto => ({
  id: String(n++), descripcion: 'x', monto, categoriaId: 'otros', metodo: 'tarjeta', fecha: f, cicloId: '2026-09-Q1', creadoEn: f, ...extra,
})

describe('gastoPorDia y diaMasCaro', () => {
  test('devuelve un monto por cada día del ciclo, en orden', () => {
    const gastos = [gasto(8_500, fecha(2026, 9, 3)), gasto(4_500, fecha(2026, 9, 7)), gasto(21_900, fecha(2026, 9, 7))]
    const porDia = gastoPorDia(gastos, q1)
    expect(porDia).toHaveLength(15)
    expect(porDia[2]).toBe(8_500)
    expect(porDia[6]).toBe(26_400)
    expect(porDia[0]).toBe(0)
  })

  test('ignora gastos de otros ciclos', () => {
    expect(gastoPorDia([gasto(999, fecha(2026, 8, 30), { cicloId: '2026-08-Q2' })], q1).every((v) => v === 0)).toBe(true)
  })

  test('el día más caro es 1-based y null si no hay gasto', () => {
    expect(diaMasCaro([0, 0, 8_500, 0, 0, 0, 26_400])).toBe(7)
    expect(diaMasCaro([0, 0, 0])).toBeNull()
  })
})

describe('proyeccionMSI', () => {
  const tele: CompraMSI = { id: 't', descripcion: 'Tele', montoTotal: 1_200_000, meses: 3, fechaCompra: fecha(2026, 9, 7), pagosHechos: 0 }

  test('da las próximas n quincenas desde la actual con lo que sale en cada una', () => {
    const p = proyeccionMSI([tele], '2026-09-Q1', 7)
    expect(p.map((x) => x.cicloId)).toEqual(['2026-09-Q1', '2026-09-Q2', '2026-10-Q1', '2026-10-Q2', '2026-11-Q1', '2026-11-Q2', '2026-12-Q1'])
    expect(p.map((x) => x.monto)).toEqual([0, 200_000, 200_000, 200_000, 200_000, 200_000, 200_000])
  })

  test('marca en qué quincena termina cada compra', () => {
    const p = proyeccionMSI([tele], '2026-09-Q1', 8)
    expect(p[6]).toEqual({ cicloId: '2026-12-Q1', monto: 200_000, terminan: ['Tele'] })
    expect(p[7]).toEqual({ cicloId: '2026-12-Q2', monto: 0, terminan: [] })
  })
})

describe('detectarRecurrente', () => {
  const soriana = (cicloId: string, monto: number, f: number) => gasto(monto, f, { descripcion: 'Soriana', cicloId, categoriaId: 'super' })

  test('tres quincenas seguidas con montos parecidos: candidato a fijo', () => {
    const gastos = [soriana('2026-08-Q1', 120_000, fecha(2026, 8, 5)), soriana('2026-08-Q2', 130_000, fecha(2026, 8, 20)), soriana('2026-09-Q1', 125_050, fecha(2026, 9, 4))]
    expect(detectarRecurrente(gastos, 'soriana', '2026-09-Q1')).toEqual({ descripcion: 'Soriana', montoPromedio: 125_017, veces: 3, categoriaId: 'super' })
  })

  test('si falta una quincena en medio no es recurrente', () => {
    const gastos = [soriana('2026-07-Q2', 120_000, fecha(2026, 7, 20)), soriana('2026-08-Q2', 130_000, fecha(2026, 8, 20)), soriana('2026-09-Q1', 125_050, fecha(2026, 9, 4))]
    expect(detectarRecurrente(gastos, 'soriana', '2026-09-Q1')).toBeNull()
  })

  test('montos que difieren más del 20 por ciento no cuentan', () => {
    const gastos = [soriana('2026-08-Q1', 50_000, fecha(2026, 8, 5)), soriana('2026-08-Q2', 130_000, fecha(2026, 8, 20)), soriana('2026-09-Q1', 125_050, fecha(2026, 9, 4))]
    expect(detectarRecurrente(gastos, 'soriana', '2026-09-Q1')).toBeNull()
  })

  test('varios gastos en la misma quincena se suman antes de comparar', () => {
    const gastos = [soriana('2026-08-Q1', 120_000, fecha(2026, 8, 5)), soriana('2026-08-Q2', 60_000, fecha(2026, 8, 18)), soriana('2026-08-Q2', 65_000, fecha(2026, 8, 25)), soriana('2026-09-Q1', 125_050, fecha(2026, 9, 4))]
    expect(detectarRecurrente(gastos, 'soriana', '2026-09-Q1')?.veces).toBe(3)
  })
})

describe('topesSugeridos y sinAsignar', () => {
  const categorias: Categoria[] = [
    { id: 'super', nombre: 'Súper', tope: 0, claves: [] },
    { id: 'comida', nombre: 'Comida', tope: 0, claves: [] },
  ]

  test('promedia el gasto por categoría de los ciclos cerrados y redondea hacia arriba a 50 pesos', () => {
    const gastos = [
      gasto(120_000, fecha(2026, 8, 5), { cicloId: '2026-08-Q1', categoriaId: 'super' }),
      gasto(130_000, fecha(2026, 8, 20), { cicloId: '2026-08-Q2', categoriaId: 'super' }),
      gasto(9_000, fecha(2026, 8, 20), { cicloId: '2026-08-Q2', categoriaId: 'comida' }),
    ]
    expect(topesSugeridos(gastos, ['2026-08-Q1', '2026-08-Q2'], categorias)).toEqual({ super: 125_000, comida: 5_000 })
  })

  test('usa como mucho los últimos tres ciclos cerrados', () => {
    const gastos = ['2026-06-Q1', '2026-06-Q2', '2026-07-Q1', '2026-07-Q2'].map((c, i) => gasto((i + 1) * 10_000, fecha(2026, 7, 1), { cicloId: c, categoriaId: 'super' }))
    // promedio de 20,000, 30,000 y 40,000 = 30,000
    expect(topesSugeridos(gastos, ['2026-06-Q1', '2026-06-Q2', '2026-07-Q1', '2026-07-Q2'], categorias).super).toBe(30_000)
  })

  test('sin ciclos cerrados no sugiere nada', () => {
    expect(topesSugeridos([], [], categorias)).toEqual({})
  })

  test('sinAsignar es el ingreso menos la suma de topes y puede ser negativo', () => {
    expect(sinAsignar(1_200_000, [{ ...categorias[0]!, tope: 300_000 }, { ...categorias[1]!, tope: 1_000_000 }])).toBe(-100_000)
  })
})

describe('categoriasCercaDelTope', () => {
  test('lista las categorías con tope que ya pasaron del 80 por ciento', () => {
    const categorias: Categoria[] = [
      { id: 'super', nombre: 'Súper', tope: 100_000, claves: [] },
      { id: 'comida', nombre: 'Comida', tope: 100_000, claves: [] },
      { id: 'otros', nombre: 'Otros', tope: 0, claves: [] },
    ]
    const gastos = [gasto(82_000, fecha(2026, 9, 3), { categoriaId: 'super' }), gasto(50_000, fecha(2026, 9, 3), { categoriaId: 'comida' }), gasto(999_999, fecha(2026, 9, 3), { categoriaId: 'otros' })]
    expect(categoriasCercaDelTope(gastos, categorias)).toEqual([{ categoriaId: 'super', porcentaje: 82 }])
  })
})

describe('resumenDeCiclo e historialDeCiclos', () => {
  const ago2 = cicloDesdeId('2026-08-Q2', 1_200_000)
  const gastos = [
    gasto(300_000, fecha(2026, 8, 20), { cicloId: '2026-08-Q2', categoriaId: 'super' }),
    gasto(100_000, fecha(2026, 8, 22), { cicloId: '2026-08-Q2', categoriaId: 'comida' }),
    gasto(150_000, fecha(2026, 9, 4), { cicloId: '2026-09-Q1', categoriaId: 'super' }),
    gasto(300_000, fecha(2026, 9, 5), { cicloId: '2026-09-Q1', categoriaId: 'comida' }),
  ]

  test('el resumen de un ciclo trae ingreso, gastado, msi y sobrante', () => {
    const r = resumenDeCiclo(q1, gastos, [])
    expect(r).toMatchObject({ cicloId: '2026-09-Q1', ingreso: 1_200_000, gastado: 450_000, msi: 0, sobrante: 750_000 })
  })

  test('detecta la categoría que más creció contra el ciclo anterior', () => {
    const r = resumenDeCiclo(q1, gastos, [], ago2)
    expect(r.categoriaQueMasCrecio).toEqual({ categoriaId: 'comida', diferencia: 200_000 })
  })

  test('el historial solo incluye ciclos cerrados, del más reciente al más viejo, con guardado acumulado', () => {
    const ciclos = [cicloDesdeId('2026-08-Q1', 1_200_000), ago2, q1]
    const h = historialDeCiclos(ciclos, gastos, [], fecha(2026, 9, 7))
    expect(h.ciclos.map((c) => c.cicloId)).toEqual(['2026-08-Q2', '2026-08-Q1'])
    expect(h.ciclos[0]?.sobrante).toBe(800_000)
    expect(h.guardadoAcumulado).toBe(2_000_000)
  })

  test('un ciclo cerrado sin gastos ni ingreso no infla el guardado', () => {
    const vacio = cicloDesdeId('2026-07-Q2', 0)
    expect(historialDeCiclos([vacio], [], [], fecha(2026, 9, 7)).guardadoAcumulado).toBe(0)
  })
})
