import { pesosACentavos } from './dinero'
import type { Categoria, Metodo } from './tipos'

/**
 * Intérprete de texto libre: "oxxo 85 efectivo" → monto, categoría, método.
 * Función pura. Devuelve null si no encuentra un monto.
 */

export type Interpretacion = {
  monto: number
  categoriaId: string
  metodo: Metodo
  meses: number | null
  descripcion: string
}

type CategoriaMinima = Pick<Categoria, 'id' | 'claves'>

export const CATEGORIA_POR_DEFECTO = 'otros'

const METODOS: Record<string, Metodo> = {
  efectivo: 'efectivo',
  cash: 'efectivo',
  transferencia: 'transferencia',
  transfer: 'transferencia',
  spei: 'transferencia',
  tarjeta: 'tarjeta',
  tdc: 'tarjeta',
  credito: 'tarjeta',
  debito: 'tarjeta',
}

const PATRON_MSI_PEGADO = /^(\d{1,2})msi$/
const PATRON_MESES = /^\d{1,2}$/
const PALABRAS_MESES = new Set(['msi', 'meses'])

export function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function extraerMeses(tokens: string[], usados: boolean[]): number | null {
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i] ?? ''
    const pegado = PATRON_MSI_PEGADO.exec(token)
    if (pegado) {
      usados[i] = true
      return Number(pegado[1])
    }
    const siguiente = tokens[i + 1]
    if (PATRON_MESES.test(token) && siguiente !== undefined && PALABRAS_MESES.has(siguiente)) {
      usados[i] = true
      usados[i + 1] = true
      if (tokens[i - 1] === 'a') usados[i - 1] = true
      return Number(token)
    }
  }
  return null
}

function extraerMetodo(tokens: string[], usados: boolean[]): Metodo {
  let metodo: Metodo = 'tarjeta'
  tokens.forEach((token, i) => {
    const encontrado = METODOS[token]
    if (encontrado) {
      metodo = encontrado
      usados[i] = true
    }
  })
  return metodo
}

function extraerMonto(tokens: string[], usados: boolean[]): number | null {
  let mayor: number | null = null
  tokens.forEach((token, i) => {
    if (usados[i]) return
    const monto = pesosACentavos(token)
    if (monto === null) return
    usados[i] = true
    if (mayor === null || monto > mayor) mayor = monto
  })
  return mayor
}

function buscarCategoria(texto: string, categorias: CategoriaMinima[]): string {
  const candidatas = categorias
    .flatMap((c) => c.claves.map((clave) => ({ id: c.id, clave: normalizar(clave) })))
    .sort((a, b) => b.clave.length - a.clave.length)
  const acolchado = ` ${texto} `
  return candidatas.find(({ clave }) => acolchado.includes(` ${clave} `))?.id ?? CATEGORIA_POR_DEFECTO
}

export function interpretar(texto: string, categorias: CategoriaMinima[]): Interpretacion | null {
  const originales = texto.trim().split(/\s+/).filter(Boolean)
  if (originales.length === 0) return null

  const tokens = originales.map(normalizar)
  const usados: boolean[] = tokens.map(() => false)

  const meses = extraerMeses(tokens, usados)
  const metodo = extraerMetodo(tokens, usados)
  const monto = extraerMonto(tokens, usados)
  if (monto === null) return null

  const restantes = originales.filter((_, i) => !usados[i])
  const categoriaId = buscarCategoria(restantes.map(normalizar).join(' '), categorias)

  return { monto, categoriaId, metodo, meses, descripcion: restantes.join(' ') }
}
