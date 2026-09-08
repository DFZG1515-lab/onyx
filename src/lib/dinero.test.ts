import { describe, expect, test } from 'vitest'
import { formatearEntradaMonto, pesos, pesosACentavos, segmentarDigitos } from './dinero'

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

describe('segmentarDigitos', () => {
  test('separa corridas de dígitos del resto del texto', () => {
    expect(segmentarDigitos('$1,250.50')).toEqual([
      { digitos: false, texto: '$' },
      { digitos: true, texto: '1' },
      { digitos: false, texto: ',' },
      { digitos: true, texto: '250' },
      { digitos: false, texto: '.' },
      { digitos: true, texto: '50' },
    ])
  })

  test('un texto sin dígitos queda en un solo segmento', () => {
    expect(segmentarDigitos('$')).toEqual([{ digitos: false, texto: '$' }])
    expect(segmentarDigitos('')).toEqual([])
  })
})

describe('formatearEntradaMonto', () => {
  test('pone separadores de miles mientras se escribe', () => {
    expect(formatearEntradaMonto('15000')).toBe('15,000')
    expect(formatearEntradaMonto('1250.5')).toBe('1,250.5')
    expect(formatearEntradaMonto('85')).toBe('85')
  })

  test('acepta lo que ya trae comas y lo reacomoda', () => {
    expect(formatearEntradaMonto('1,5000')).toBe('15,000')
  })

  test('permite un solo punto y hasta dos decimales', () => {
    expect(formatearEntradaMonto('85.')).toBe('85.')
    expect(formatearEntradaMonto('85.505')).toBe('85.50')
    expect(formatearEntradaMonto('8.5.5')).toBe('8.55')
  })

  test('quita todo lo que no sea número o punto', () => {
    expect(formatearEntradaMonto('$1a2b3')).toBe('123')
    expect(formatearEntradaMonto('')).toBe('')
  })
})
