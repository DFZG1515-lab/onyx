/** Contraste WCAG 2.x y lectura de los tokens de color de tokens.css. Sirve para las pruebas. */

function canal(c: number): number {
  const s = c / 255
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}

function luminancia(hex: string): number {
  let h = hex.replace('#', '')
  if (h.length === 3) h = [...h].map((x) => x + x).join('')
  const [r = 0, g = 0, b = 0] = h.match(/\w\w/g)?.map((x) => parseInt(x, 16)) ?? []
  return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b)
}

export function contraste(a: string, b: string): number {
  const [claro, oscuro] = [luminancia(a), luminancia(b)].sort((x, y) => y - x) as [number, number]
  return (claro + 0.05) / (oscuro + 0.05)
}

export type Tokens = Record<string, string>
export type Modos = { claro: Tokens; oscuro: Tokens }

/** Rangos [inicio, fin) de los bloques @media de modo oscuro. */
function rangosOscuros(css: string): Array<[number, number]> {
  const rangos: Array<[number, number]> = []
  const patron = /@media[^{]*prefers-color-scheme:\s*dark[^{]*\{/g
  let m: RegExpExecArray | null
  while ((m = patron.exec(css))) {
    let nivel = 1
    let i = m.index + m[0].length
    while (i < css.length && nivel > 0) {
      if (css[i] === '{') nivel++
      else if (css[i] === '}') nivel--
      i++
    }
    rangos.push([m.index, i])
  }
  return rangos
}

/** Toma solo los tokens de color (#hex, rgb, rgba) de :root, separados por modo. */
export function leerTokens(css: string): Modos {
  const oscuros = rangosOscuros(css)
  const modos: Modos = { claro: {}, oscuro: {} }
  const bloque = /([^{}]+?)\s*\{([^{}]*)\}/g
  let m: RegExpExecArray | null
  while ((m = bloque.exec(css))) {
    const selector = (m[1] ?? '').trim()
    if (!selector.includes(':root')) continue
    const enMediaOscuro = oscuros.some(([a, b]) => m !== null && m.index >= a && m.index < b)
    const modo = enMediaOscuro || /oscuro/.test(selector) ? 'oscuro' : 'claro'
    for (const decl of (m[2] ?? '').split(';')) {
      const [nombre, valor] = decl.split(':').map((x) => x.trim())
      if (!nombre?.startsWith('--') || !valor) continue
      if (!/^(#|rgba?\()/.test(valor)) continue
      modos[modo][nombre.slice(2)] = valor
    }
  }
  return modos
}
