import { describe, expect, test } from 'vitest'
import { CATEGORIAS_INICIALES } from '../db/semilla'
import { crearRespaldo, leerRespaldo, type Respaldo } from './respaldo'

const datos: Respaldo['datos'] = {
  gastos: [{ id: '1', descripcion: 'oxxo', monto: 8500, categoriaId: 'tienda', metodo: 'efectivo', fecha: 1, cicloId: '2026-09-Q1', creadoEn: 1 }],
  categorias: CATEGORIAS_INICIALES,
  ciclos: [{ id: '2026-09-Q1', inicio: 0, fin: 1, ingresoEsperado: 1_200_000 }],
  gastosFijos: [],
  comprasMSI: [],
  ajustes: { id: 'ajustes', ingresoQuincenal: 1_200_000 },
}

describe('respaldo', () => {
  test('crea un texto JSON con versión y fecha que se puede volver a leer', () => {
    const texto = crearRespaldo(datos, 1_700_000_000_000)
    const leido = leerRespaldo(texto)
    expect(leido?.version).toBe(1)
    expect(leido?.creadoEn).toBe(1_700_000_000_000)
    expect(leido?.datos).toEqual(datos)
  })

  test('rechaza texto que no es un respaldo', () => {
    expect(leerRespaldo('hola')).toBeNull()
    expect(leerRespaldo('{"version":1}')).toBeNull()
    expect(leerRespaldo(JSON.stringify({ version: 99, creadoEn: 1, datos }))).toBeNull()
  })

  test('rechaza gastos con montos que no son enteros', () => {
    const roto = { ...datos, gastos: [{ ...datos.gastos[0]!, monto: 85.5 }] }
    expect(leerRespaldo(JSON.stringify({ version: 1, creadoEn: 1, datos: roto }))).toBeNull()
  })
})
