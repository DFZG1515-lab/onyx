import { segmentarDigitos } from '../lib/dinero'
import type { Tono } from './Fila'

type Props = { centavos: number; tono: Tono }

const enteros = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 0 })

/** El monto grande: signo de pesos pequeño y arriba, como en un estado de cuenta. */
export function Heroe({ centavos, tono }: Props) {
  const negativo = centavos < 0
  const texto = enteros.format(Math.floor(Math.abs(centavos) / 100))
  return (
    <div className={`heroe-monto tono-${tono}`} aria-label={`${negativo ? 'menos ' : ''}${texto} pesos`}>
      <span className="heroe-monto__signo">{negativo ? '−$' : '$'}</span>
      <span className="heroe-monto__entero">
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
    </div>
  )
}
