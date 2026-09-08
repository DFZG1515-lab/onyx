import { useNavigate } from 'react-router-dom'
import { Fila } from '../../componentes/Fila'
import { Monto } from '../../componentes/Monto'
import { pesos } from '../../lib/dinero'
import { rangoDeCiclo } from '../../lib/fechas'
import { RUTAS } from '../../rutas'
import { useUI } from '../../store/ui'
import type { Resumen } from './useResumen'

/** Quincenas cerradas. Tocar una abre sus movimientos. */
export function Historial({ r }: { r: Resumen }) {
  const setFiltroCiclo = useUI((s) => s.setFiltroCiclo)
  const navegar = useNavigate()
  if (r.historial.ciclos.length === 0) return null
  return (
    <section className="seccion">
      <h2 className="seccion__titulo">Quincenas anteriores</h2>
      <div className="renglones-meta" style={{ justifyContent: 'space-between', marginTop: 8 }}>
        <span>Guardado en total</span>
        <Monto className="tono-green" centavos={r.historial.guardadoAcumulado} />
      </div>
      {r.historial.ciclos.slice(0, 6).map((c, i) => (
        <Fila
          key={c.cicloId}
          indice={i}
          titulo={rangoDeCiclo(c)}
          meta={`Gastaste ${pesos(c.gastado, { centavos: false })}${c.diferenciaConAnterior === null ? '' : c.diferenciaConAnterior >= 0 ? ` · sobró ${pesos(c.diferenciaConAnterior, { centavos: false })} más que la anterior` : ` · sobró ${pesos(-c.diferenciaConAnterior, { centavos: false })} menos que la anterior`}`}
          monto={<Monto centavos={c.sobrante} />}
          tono={c.sobrante >= 0 ? 'green' : 'wine'}
          onClick={() => {
            setFiltroCiclo(c.cicloId)
            navegar(RUTAS.movimientos)
          }}
        />
      ))}
    </section>
  )
}
