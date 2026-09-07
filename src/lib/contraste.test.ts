import { describe, expect, test } from 'vitest'
import { contraste, leerTokens } from './contraste'

describe('contraste', () => {
  test('negro sobre blanco da 21 y un color contra sí mismo da 1', () => {
    expect(contraste('#000000', '#FFFFFF')).toBeCloseTo(21, 1)
    expect(contraste('#123456', '#123456')).toBeCloseTo(1, 5)
  })

  test('es simétrico', () => {
    expect(contraste('#0F6E56', '#F1F2F0')).toBeCloseTo(contraste('#F1F2F0', '#0F6E56'), 5)
  })

  test('acepta minúsculas y formato corto', () => {
    expect(contraste('#fff', '#000')).toBeCloseTo(21, 1)
  })
})

describe('leerTokens', () => {
  test('separa los tokens de color del bloque claro y del oscuro', () => {
    const css = `
      :root { --paper: #F1F2F0; --ink: #171A1F; --espacio-1: 4px; --rule: rgba(23,26,31,0.10); }
      @media (prefers-color-scheme: dark) { :root:not([data-tema='claro']) { --paper: #16181B; --ink: #EDEEEA; --rule: rgba(237,238,234,0.12); } }
    `
    const modos = leerTokens(css)
    expect(modos.claro).toEqual({ paper: '#F1F2F0', ink: '#171A1F', rule: 'rgba(23,26,31,0.10)' })
    expect(modos.oscuro).toEqual({ paper: '#16181B', ink: '#EDEEEA', rule: 'rgba(237,238,234,0.12)' })
  })
})
