import { pesos, segmentarDigitos } from '../lib/dinero'

type Props = { centavos: number; conCentavos?: boolean; className?: string }

/**
 * Un monto en pesos con dígitos tabulares y puntuación proporcional.
 * Así las columnas alinean sin que "$1,333" se vea como "$1 , 333".
 */
export function Monto({ centavos, conCentavos = true, className }: Props) {
  const texto = pesos(centavos, { centavos: conCentavos })
  return (
    <span className={className}>
      {segmentarDigitos(texto).map((s, i) =>
        s.digitos ? (
          <span key={i} className="num">
            {s.texto}
          </span>
        ) : (
          s.texto
        ),
      )}
    </span>
  )
}
