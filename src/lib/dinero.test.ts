import { describe, expect, test } from 'vitest'
import { pesos, pesosACentavos } from './dinero'

describe('pesos', () => {
  test('formatea centavos como pesos mexicanos', () => {
    expect(pesos(8_500)).toBe('$85.00')
    expect(pesos(125_050)).toBe('$1,250.50')
    expect(pesos(0)).toBe('$0.00')
  })

  test('los negativos llevan el signo antes del símbolo', () => {
    expect(pesos(-10_000)).toBe('-$100.00')
  })

  test('puede omitir centavos', () => {
    expect(pesos(125_050, { centavos: false })).toBe('$1,251')
    expect(pesos(8_500, { centavos: false })).toBe('$85')
  })
})

describe('pesosACentavos', () => {
  test('convierte texto de pesos a centavos enteros', () => {
    expect(pesosACentavos('85')).toBe(8_500)
    expect(pesosACentavos('85.5')).toBe(8_550)
    expect(pesosACentavos('1,250.50')).toBe(125_050)
    expect(pesosACentavos('$85')).toBe(8_500)
    expect(pesosACentavos(' 85 ')).toBe(8_500)
  })

  test('devuelve null si no es un monto', () => {
    expect(pesosACentavos('abc')).toBeNull()
    expect(pesosACentavos('')).toBeNull()
    expect(pesosACentavos('-5')).toBeNull()
    expect(pesosACentavos('0')).toBeNull()
  })
})
