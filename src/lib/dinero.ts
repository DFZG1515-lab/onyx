/** Formato y lectura de dinero. Internamente todo son centavos enteros. */

const conCentavos = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2, maximumFractionDigits: 2 })
const sinCentavos = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0, maximumFractionDigits: 0 })

export function pesos(centavos: number, opciones: { centavos?: boolean } = {}): string {
  const formato = opciones.centavos === false ? sinCentavos : conCentavos
  return formato.format(centavos / 100)
}

const PATRON_MONTO = /^\$?(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d{1,2}))?$/

/** "1,250.50" → 125050. Null si el texto no es un monto positivo. */
export function pesosACentavos(texto: string): number | null {
  const m = PATRON_MONTO.exec(texto.trim())
  if (!m) return null
  const enteros = Number(m[1]?.replace(/,/g, '') ?? '0')
  const centavos = Number((m[2] ?? '').padEnd(2, '0'))
  const total = enteros * 100 + centavos
  return total > 0 ? total : null
}

export type Segmento = { digitos: boolean; texto: string }

/** Separa corridas de dígitos del resto, para aplicar dígitos tabulares solo a los números. */
export function segmentarDigitos(texto: string): Segmento[] {
  const segmentos: Segmento[] = []
  for (const parte of texto.match(/\d+|\D+/g) ?? []) {
    segmentos.push({ digitos: /^\d/.test(parte), texto: parte })
  }
  return segmentos
}

/** "15000" → "15,000" mientras se escribe. Un solo punto, hasta dos decimales, nada más que dígitos. */
export function formatearEntradaMonto(texto: string): string {
  const limpio = texto.replace(/[^\d.]/g, '')
  const punto = limpio.indexOf('.')
  const enteros = (punto === -1 ? limpio : limpio.slice(0, punto)).replace(/^0+(?=\d)/, '')
  const decimales = punto === -1 ? null : limpio.slice(punto + 1).replace(/\./g, '').slice(0, 2)
  const conComas = enteros.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return decimales === null ? conComas : `${conComas}.${decimales}`
}
