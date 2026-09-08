import { describe, expect, test } from 'vitest'
import { CATEGORIAS_INICIALES } from '../db/semilla'
import { camposDesdeDictado } from './dictado'

describe('camposDesdeDictado', () => {
  test('convierte lo dictado en los campos del formulario', () => {
    expect(camposDesdeDictado('oxxo ochenta y cinco pesos en efectivo', CATEGORIAS_INICIALES)).toEqual({
      monto: '85',
      donde: 'oxxo',
      categoriaId: 'tienda',
      metodo: 'efectivo',
      meses: null,
    })
  })

  test('acepta el monto en dígitos, con centavos y con la palabra pesos', () => {
    expect(camposDesdeDictado('gasolina 800 pesos', CATEGORIAS_INICIALES)?.monto).toBe('800')
    expect(camposDesdeDictado('café 45.50', CATEGORIAS_INICIALES)?.monto).toBe('45.50')
    expect(camposDesdeDictado('uber 120 con tarjeta', CATEGORIAS_INICIALES)?.donde).toBe('uber')
  })

  test('entiende números dichos con palabras hasta miles', () => {
    expect(camposDesdeDictado('soriana mil doscientos cincuenta', CATEGORIAS_INICIALES)?.monto).toBe('1250')
    expect(camposDesdeDictado('tele quince mil a doce meses', CATEGORIAS_INICIALES)).toMatchObject({ monto: '15000', meses: 12, donde: 'tele' })
    expect(camposDesdeDictado('renta seis mil por transferencia', CATEGORIAS_INICIALES)).toMatchObject({ monto: '6000', metodo: 'transferencia' })
  })

  test('quita las palabras de relleno del dónde', () => {
    expect(camposDesdeDictado('gasté 200 pesos en el súper', CATEGORIAS_INICIALES)?.donde).toBe('súper')
  })

  test('sin monto devuelve null', () => {
    expect(camposDesdeDictado('fui al oxxo', CATEGORIAS_INICIALES)).toBeNull()
    expect(camposDesdeDictado('', CATEGORIAS_INICIALES)).toBeNull()
  })
})
