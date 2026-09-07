import { describe, expect, test } from 'vitest'
import { contraste, leerTokens } from '../lib/contraste'
import css from './tokens.css?raw'

const modos = leerTokens(css)

describe('tokens.css', () => {
  test('define los dos modos con los mismos tokens de color', () => {
    expect(Object.keys(modos.claro).sort()).toEqual(Object.keys(modos.oscuro).sort())
    expect(Object.keys(modos.claro)).toEqual(expect.arrayContaining(['paper', 'surface', 'ink', 'muted', 'rule', 'green', 'wine', 'slate', 'amber']))
  })

  test.each(['claro', 'oscuro'] as const)('en modo %s los colores semánticos cumplen AA (4.5) sobre paper', (modo) => {
    const t = modos[modo]
    for (const nombre of ['green', 'wine', 'slate', 'amber'] as const) {
      expect(contraste(t[nombre] ?? '', t.paper ?? ''), `${nombre} en ${modo}`).toBeGreaterThanOrEqual(4.5)
    }
  })

  test.each(['claro', 'oscuro'] as const)('en modo %s la tinta cumple AAA (7) sobre paper y sobre surface', (modo) => {
    const t = modos[modo]
    expect(contraste(t.ink ?? '', t.paper ?? '')).toBeGreaterThanOrEqual(7)
    expect(contraste(t.ink ?? '', t.surface ?? '')).toBeGreaterThanOrEqual(7)
  })

  test.each(['claro', 'oscuro'] as const)('en modo %s el texto secundario cumple al menos AA para texto grande (3)', (modo) => {
    const t = modos[modo]
    expect(contraste(t.muted ?? '', t.paper ?? '')).toBeGreaterThanOrEqual(3)
  })
})
