import { describe, expect, test } from 'vitest'
import { frecuentes } from './frecuentes'
import type { Gasto } from './tipos'

let n = 0
function gasto(descripcion: string, monto: number, fecha: number, extra: Partial<Gasto> = {}): Gasto {
  return { id: String(n++), descripcion, monto, categoriaId: 'tienda', metodo: 'tarjeta', fecha, cicloId: 'x', creadoEn: fecha, ...extra }
}

describe('frecuentes', () => {
  test('agrupa por descripción sin distinguir mayúsculas ni acentos y ordena por repeticiones', () => {
    const lista = frecuentes(
      [gasto('Oxxo', 8_500, 1), gasto('uber', 12_000, 2), gasto('oxxo', 6_000, 3), gasto('café', 4_500, 4), gasto('cafe', 4_000, 5)],
      4,
    )
    expect(lista.map((f) => f.descripcion)).toEqual(['cafe', 'oxxo', 'uber'])
  })

  test('cada chip trae el monto, categoría y método del gasto más reciente del grupo', () => {
    const [oxxo] = frecuentes([gasto('oxxo', 8_500, 1, { metodo: 'efectivo' }), gasto('oxxo', 6_000, 3, { metodo: 'tarjeta' })], 4)
    expect(oxxo).toEqual({ descripcion: 'oxxo', monto: 6_000, categoriaId: 'tienda', metodo: 'tarjeta', veces: 2 })
  })

  test('respeta el límite y omite descripciones vacías', () => {
    const lista = frecuentes([gasto('', 100, 1), gasto('a', 100, 2), gasto('b', 100, 3), gasto('c', 100, 4)], 2)
    expect(lista).toHaveLength(2)
    expect(lista.every((f) => f.descripcion !== '')).toBe(true)
  })

  test('a repeticiones iguales gana el más reciente', () => {
    const lista = frecuentes([gasto('viejo', 100, 1), gasto('nuevo', 100, 9)], 2)
    expect(lista[0]?.descripcion).toBe('nuevo')
  })
})
