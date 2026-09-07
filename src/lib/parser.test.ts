import { describe, expect, test } from 'vitest'
import { CATEGORIAS_INICIALES } from '../db/semilla'
import { interpretar } from './parser'

const leer = (texto: string) => interpretar(texto, CATEGORIAS_INICIALES)

describe('monto', () => {
  test('el caso básico: comercio, monto y método', () => {
    expect(leer('oxxo 85 efectivo')).toEqual({
      monto: 8_500,
      categoriaId: 'tienda',
      metodo: 'efectivo',
      meses: null,
      descripcion: 'oxxo',
    })
  })

  test('acepta decimales y separadores de miles', () => {
    expect(leer('soriana 1,250.50')?.monto).toBe(125_050)
    expect(leer('oxxo 85.5')?.monto).toBe(8_550)
    expect(leer('$85 oxxo')?.monto).toBe(8_500)
  })

  test('toma el número más grande como monto', () => {
    expect(leer('2 cafes 60')?.monto).toBe(6_000)
    expect(leer('cafe 45 y pan 30')?.monto).toBe(4_500)
  })

  test('devuelve null cuando no hay monto', () => {
    expect(leer('oxxo')).toBeNull()
    expect(leer('')).toBeNull()
    expect(leer('   ')).toBeNull()
    expect(leer('gasté mucho hoy')).toBeNull()
  })

  test('el número de meses no cuenta como monto', () => {
    expect(leer('tele 12 msi')).toBeNull()
    expect(leer('a 6 meses 3000 lentes')?.monto).toBe(300_000)
  })
})

describe('meses sin intereses', () => {
  test('"a 12 meses" marca la compra a meses', () => {
    const r = leer('tele 15000 a 12 meses')
    expect(r?.meses).toBe(12)
    expect(r?.monto).toBe(1_500_000)
    expect(r?.descripcion).toBe('tele')
  })

  test('"12 msi" y "12msi" también', () => {
    expect(leer('lavadora 9000 12 msi')?.meses).toBe(12)
    expect(leer('12msi liverpool 6000')?.meses).toBe(12)
  })

  test('sin indicación de meses, meses es null', () => {
    expect(leer('uber 120')?.meses).toBeNull()
  })
})

describe('método de pago', () => {
  test('tarjeta es el default', () => {
    expect(leer('uber 120')?.metodo).toBe('tarjeta')
  })

  test('efectivo y cash fijan efectivo', () => {
    expect(leer('tacos 90 efectivo')?.metodo).toBe('efectivo')
    expect(leer('cash 200')?.metodo).toBe('efectivo')
  })

  test('transferencia se reconoce', () => {
    expect(leer('transferencia renta 8000')?.metodo).toBe('transferencia')
    expect(leer('renta 8000 transfer')?.metodo).toBe('transferencia')
  })
})

describe('categoría', () => {
  test('sale de las claves de las categorías', () => {
    expect(leer('uber 120')?.categoriaId).toBe('transporte')
    expect(leer('walmart 640')?.categoriaId).toBe('super')
    expect(leer('renta 8000')?.categoriaId).toBe('casa')
  })

  test('ignora mayúsculas y acentos', () => {
    expect(leer('GASOLINA 800')?.categoriaId).toBe('transporte')
    expect(leer('Súper 300')?.categoriaId).toBe('super')
  })

  test('las claves de varias palabras funcionan', () => {
    expect(leer('circle k 40')?.categoriaId).toBe('tienda')
  })

  test('las claves coinciden por palabra completa', () => {
    expect(leer('gas 300')?.categoriaId).toBe('transporte')
    expect(leer('gasto raro 300')?.categoriaId).toBe('otros')
  })

  test('sin coincidencia cae en Otros', () => {
    expect(leer('regalo 500')?.categoriaId).toBe('otros')
  })
})

describe('descripción', () => {
  test('quita monto, método, meses y signo de pesos', () => {
    expect(leer('$85 oxxo efectivo')?.descripcion).toBe('oxxo')
    expect(leer('lavadora 9000 12 msi tarjeta')?.descripcion).toBe('lavadora')
  })

  test('conserva las palabras restantes en su orden y con su forma original', () => {
    expect(leer('Tacos El Güero 120')?.descripcion).toBe('Tacos El Güero')
  })

  test('queda vacía si solo había un monto', () => {
    expect(leer('200')?.descripcion).toBe('')
  })
})
