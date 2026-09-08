import { useNavigate } from 'react-router-dom'
import { Anillo } from '../../componentes/Anillo'
import { ChipRitmo } from '../../componentes/ChipRitmo'
import { GraficaDiaria } from '../../componentes/GraficaDiaria'
import { Heroe } from '../../componentes/Heroe'
import { Monto } from '../../componentes/Monto'
import { pesos } from '../../lib/dinero'
import { diaYMes, fechaCorta } from '../../lib/fechas'
import { RUTAS } from '../../rutas'
import { useUI } from '../../store/ui'
import { TONO_RITMO, type Resumen } from './useResumen'

type Props = { r: Resumen; heroeAnimado: number; animarEntrada: boolean; alEditarIngreso: () => void }

export function BloqueHeroe({ r, heroeAnimado, animarEntrada, alEditarIngreso }: Props) {
  const { ciclo, p, ritmo } = r
  const setFiltroDia = useUI((s) => s.setFiltroDia)
  const navegar = useNavigate()
  const dias = p.diasRestantes === 1 ? '1 día' : `${p.diasRestantes} días`
  const porcentaje = (parte: number) => (p.ingreso > 0 ? Math.round((parte / p.ingreso) * 100) : 0)
  const queComprometido = [r.fijosPendientesN > 0 ? (r.fijosPendientesN === 1 ? '1 fijo pendiente' : `${r.fijosPendientesN} fijos pendientes`) : null, p.msi > 0 ? 'meses sin intereses' : null]
    .filter(Boolean)
    .join(' y ')

  return (
    <section className="heroe-bloque">
      <p className="meta">{p.excedido ? '¿Me alcanza? · te pasaste por' : '¿Me alcanza? · te quedan por día'}</p>
      <div className="heroe-fila">
        <div>
          <Heroe centavos={heroeAnimado} tono={r.tonoHeroe} />
          <div className="ritmo">
            <ChipRitmo estado={p.excedido ? 'excedido' : ritmo.estado} />
            <span className="meta">
              <Monto centavos={Math.abs(ritmo.diferencia)} conCentavos={false} /> {ritmo.diferencia >= 0 ? 'abajo del ritmo' : 'arriba del ritmo'}
            </span>
          </div>
        </div>
        <Anillo comprometido={p.ingreso > 0 ? p.comprometido / p.ingreso : 0} gastado={p.ingreso > 0 ? p.gastado / p.ingreso : 1} etiqueta="Ingreso usado o comprometido" animar={animarEntrada} tono={r.tonoHeroe} />
      </div>

      <div className="cifras">
        <div className="cifra">
          <span className="cifra__etiqueta">Libres</span>
          <Monto className={`cifra__valor ${p.excedido ? 'tono-wine' : 'tono-green'}`} centavos={p.disponible} />
          <span className="cifra__sub">
            hasta el {fechaCorta(ciclo.fin)} · {dias}
            {p.extras > 0 ? ` · incluye ${pesos(p.extras, { centavos: false })} extra` : ''}
          </span>
        </div>
        <div className="cifra">
          <span className="cifra__etiqueta">Gastado</span>
          <Monto className="cifra__valor" centavos={p.gastado} />
          <span className="cifra__sub">{porcentaje(p.gastado)} % del ingreso</span>
        </div>
        <div className="cifra">
          <span className="cifra__etiqueta">Comprometido</span>
          <Monto className="cifra__valor" centavos={p.comprometido} />
          <span className="cifra__sub">{queComprometido || 'nada pendiente'}</span>
        </div>
        <div className="cifra">
          <span className="cifra__etiqueta">Ritmo</span>
          <span className={`cifra__valor tono-${TONO_RITMO[ritmo.estado]}`}>
            {ritmo.diferencia < 0 ? '+' : '−'}
            <Monto centavos={Math.abs(ritmo.diferencia)} conCentavos={false} />
          </span>
          <span className="cifra__sub">{ritmo.diferencia >= 0 ? 'abajo de lo esperado' : 'arriba de lo esperado'}</span>
        </div>
      </div>

      <GraficaDiaria
        porDia={r.porDia}
        indiceHoy={r.indiceHoy}
        diasFijos={r.diasFijos}
        inicio={ciclo.inicio}
        etiquetaInicio={diaYMes(ciclo.inicio)}
        etiquetaFin={diaYMes(ciclo.fin)}
        esperadoPorDia={Math.round(p.ingresoEsperado / r.diasTotales)}
        alTocar={(i) => {
          setFiltroDia(ciclo.inicio + i * 86_400_000 + 12 * 3_600_000)
          navegar(RUTAS.movimientos)
        }}
      />
      <div className="renglones-meta">
        <span>Día {Math.min(r.diasTotales, r.diasTotales - p.diasRestantes + 1)} de {r.diasTotales}</span>
        <button type="button" className="enlace-meta" onClick={alEditarIngreso}>
          Ingreso {pesos(p.ingresoEsperado, { centavos: false })}
        </button>
      </div>
    </section>
  )
}
