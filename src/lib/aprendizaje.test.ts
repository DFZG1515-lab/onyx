import { describe, expect, test } from 'vitest'
import { CATEGORIAS_INICIALES } from '../db/semilla'
import { aprenderClaves } from './aprendizaje'
import { interpretar } from './parser'

describe('aprenderClaves', () => {
  test('mueve las palabras de la descripción a la categoría corregida', () => {
    const cambiadas = aprenderClaves(CATEGORIAS_INICIALES, 'oxxo', 'comida')
    const comida = cambiadas.find((c) => c.id === 'comida')
    const tienda = cambiadas.find((c) => c.id === 'tienda')
    expect(comida?.claves).toContain('oxxo')
    expect(tienda?.claves).not.toContain('oxxo')
  })

  test('la próxima vez el intérprete aplica lo aprendido', () => {
    const cambiadas = aprenderClaves(CATEGORIAS_INICIALES, 'Tacos El Güero', 'entretenimiento')
    const actualizadas = CATEGORIAS_INICIALES.map((c) => cambiadas.find((x) => x.id === c.id) ?? c)
    expect(interpretar('tacos el guero 120', actualizadas)?.categoriaId).toBe('entretenimiento')
  })

  test('ignora palabras cortas, números y artículos', () => {
    const cambiadas = aprenderClaves(CATEGORIAS_INICIALES, 'el 2 de la casa 300', 'salud')
    const salud = cambiadas.find((c) => c.id === 'salud')
    expect(salud?.claves).toContain('casa')
    expect(salud?.claves).not.toContain('el')
    expect(salud?.claves).not.toContain('de')
    expect(salud?.claves).not.toContain('la')
    expect(salud?.claves).not.toContain('2')
    expect(salud?.claves).not.toContain('300')
  })

  test('devuelve solo las categorías que cambiaron', () => {
    const cambiadas = aprenderClaves(CATEGORIAS_INICIALES, 'regalo', 'otros')
    expect(cambiadas.map((c) => c.id)).toEqual(['otros'])
  })

  test('sin palabras útiles no cambia nada', () => {
    expect(aprenderClaves(CATEGORIAS_INICIALES, '85', 'comida')).toEqual([])
  })

  test('no duplica claves que ya tiene la categoría', () => {
    const cambiadas = aprenderClaves(CATEGORIAS_INICIALES, 'oxxo', 'tienda')
    expect(cambiadas).toEqual([])
  })
})
