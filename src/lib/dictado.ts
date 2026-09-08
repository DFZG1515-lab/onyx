import { interpretar, normalizar } from './parser'
import type { Categoria, Metodo } from './tipos'

/**
 * De una frase dictada ("oxxo ochenta y cinco pesos en efectivo") a los campos del formulario.
 * Convierte números dichos con palabras, quita el relleno y deja el resto al intérprete de texto.
 */
export type CamposDictados = { monto: string; donde: string; categoriaId: string; metodo: Metodo; meses: number | null }

const UNIDADES: Record<string, number> = {
  cero: 0, un: 1, uno: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10,
  once: 11, doce: 12, trece: 13, catorce: 14, quince: 15, dieciseis: 16, diecisiete: 17, dieciocho: 18, diecinueve: 19,
  veinte: 20, veintiuno: 21, veintiun: 21, veintidos: 22, veintitres: 23, veinticuatro: 24, veinticinco: 25, veintiseis: 26, veintisiete: 27, veintiocho: 28, veintinueve: 29,
  treinta: 30, cuarenta: 40, cincuenta: 50, sesenta: 60, setenta: 70, ochenta: 80, noventa: 90,
}
const CENTENAS: Record<string, number> = {
  cien: 100, ciento: 100, doscientos: 200, trescientos: 300, cuatrocientos: 400, quinientos: 500, seiscientos: 600, setecientos: 700, ochocientos: 800, novecientos: 900,
}
const RELLENO = new Set(['gaste', 'gasté', 'pague', 'pagué', 'compre', 'compré', 'fui', 'pesos', 'peso', 'en', 'el', 'la', 'los', 'las', 'con', 'por', 'de', 'del', 'al', 'un', 'una', 'y'])

function esNumerica(t: string): boolean {
  return t in UNIDADES || t in CENTENAS || t === 'mil' || t === 'y'
}

/** Convierte una corrida de palabras numéricas en un entero. */
function valorDe(palabras: string[]): number {
  let total = 0
  let actual = 0
  for (const p of palabras) {
    if (p === 'y') continue
    if (p === 'mil') {
      total += (actual || 1) * 1000
      actual = 0
    } else if (p in CENTENAS) {
      actual += CENTENAS[p] ?? 0
    } else {
      actual += UNIDADES[p] ?? 0
    }
  }
  return total + actual
}

/** Reemplaza las palabras numéricas por dígitos, respetando el resto de las palabras originales. */
export function palabrasADigitos(texto: string): string {
  const originales = texto.trim().split(/\s+/).filter(Boolean)
  const salida: string[] = []
  let corrida: string[] = []
  const cerrar = () => {
    // Una "y" suelta al final de la corrida no es parte del número.
    while (corrida.at(-1) === 'y') {
      corrida.pop()
      salida.push('y')
    }
    if (corrida.length) salida.push(String(valorDe(corrida)))
    corrida = []
  }
  for (const original of originales) {
    const n = normalizar(original)
    if (esNumerica(n) && !(n === 'y' && corrida.length === 0)) corrida.push(n)
    else {
      cerrar()
      salida.push(original)
    }
  }
  cerrar()
  return salida.join(' ')
}

export function camposDesdeDictado(texto: string, categorias: Pick<Categoria, 'id' | 'claves'>[]): CamposDictados | null {
  const conDigitos = palabrasADigitos(texto)
  const limpio = conDigitos
    .split(/\s+/)
    .filter((t) => t && !RELLENO.has(normalizar(t)))
    .join(' ')
  const i = interpretar(limpio, categorias)
  if (!i) return null
  const monto = i.monto % 100 === 0 ? String(i.monto / 100) : (i.monto / 100).toFixed(2)
  return { monto, donde: i.descripcion, categoriaId: i.categoriaId, metodo: i.metodo, meses: i.meses }
}
