import { pesos, segmentarDigitos } from '../lib/dinero'

type Props = { centavos: number; conCentavos?: boolean; className?: string }

function digitos(texto: string) {
  return segmentarDigitos(texto).map((s, i) =>
    s.digitos ? (
      <span key={i} className="num">
        {s.texto}
      </span>
    ) : (
      s.texto
    ),
  )
}

/**
 * Un monto en pesos con dígitos tabulares, puntuación proporcional y centavos menores,
 * como en un estado de cuenta impreso.
 */
export function Monto({ centavos, conCentavos = true, className }: Props) {
  const texto = pesos(centavos, { centavos: conCentavos })
  const punto = conCentavos ? texto.lastIndexOf('.') : -1
  const entero = punto === -1 ? texto : texto.slice(0, punto)
  const cent = punto === -1 ? '' : texto.slice(punto)
  return (
    <span className={className}>
      {digitos(entero)}
      {cent && <span className="monto__centavos">{digitos(cent)}</span>}
    </span>
  )
}
