import { describe, expect, test } from 'vitest'
import { CATEGORIAS_INICIALES } from '../db/semilla'
import { sugerir } from './sugerencias'
import type { Gasto } from './tipos'

const gasto = (descripcion: string, metodo: Gasto['metodo'], categoriaId: string, fecha: number): Gasto => ({
  id: descripcion + fecha, descripcion, monto: 100, categoriaId, metodo, fecha, cicloId: 'x', creadoEn: fecha,
})

describe('sugerir', () => {
  test('la categoría sale de las claves del texto', () => {
    expect(sugerir('oxxo', CATEGORIAS_INICIALES, []).categoriaId).toBe('tienda')
    expect(sugerir('Gasolina', CATEGORIAS_INICIALES, []).categoriaId).toBe('transporte')
  })

  test('sin coincidencia cae en Otros y tarjeta', () => {
    expect(sugerir('regalo', CATEGORIAS_INICIALES, [])).toEqual({ categoriaId: 'otros', metodo: 'tarjeta', razonCategoria: null, razonMetodo: null })
  })

  test('el método viene del último gasto con la misma descripción', () => {
    const gastos = [gasto('oxxo', 'tarjeta', 'tienda', 1), gasto('Oxxo', 'efectivo', 'tienda', 5)]
    const s = sugerir('oxxo', CATEGORIAS_INICIALES, gastos)
    expect(s.metodo).toBe('efectivo')
    expect(s.razonMetodo).toBe('como la última vez')
  })

  test('si el último gasto igual tenía otra categoría, gana esa sobre las claves', () => {
    const gastos = [gasto('oxxo', 'efectivo', 'comida', 5)]
    const s = sugerir('oxxo', CATEGORIAS_INICIALES, gastos)
    expect(s.categoriaId).toBe('comida')
    expect(s.razonCategoria).toBe('como la última vez')
  })

  test('explica la categoría por la palabra que la disparó', () => {
    expect(sugerir('gasolina pemex', CATEGORIAS_INICIALES, []).razonCategoria).toBe('porque dijiste gasolina')
  })

  test('texto vacío devuelve los valores por defecto sin razones', () => {
    expect(sugerir('   ', CATEGORIAS_INICIALES, []).categoriaId).toBe('otros')
    expect(sugerir('', CATEGORIAS_INICIALES, []).razonCategoria).toBeNull()
  })
})
