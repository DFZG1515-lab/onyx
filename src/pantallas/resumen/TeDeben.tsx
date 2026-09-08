import type { CSSProperties } from 'react'
import { Monto } from '../../componentes/Monto'
import { idDeCiclo } from '../../lib/ciclos'
import { pesos } from '../../lib/dinero'
import { fechaCorta } from '../../lib/fechas'
import { useTienda } from '../../store/tienda'
import { useUI } from '../../store/ui'
import type { Resumen } from './useResumen'

/** Lo que te deben de gastos compartidos. Al cobrarlo, entra como ingreso extra de la quincena. */
export function TeDeben({ r }: { r: Resumen }) {
  const marcarCobrada = useTienda((s) => s.marcarCobrada)
  const agregarIngreso = useTienda((s) => s.agregarIngreso)
  const mostrarAviso = useUI((s) => s.mostrarAviso)
  if (r.deudasPendientes.length === 0) return null
  const total = r.deudasPendientes.reduce((s, d) => s + d.monto, 0)

  const cobrar = async (id: string, descripcion: string, monto: number) => {
    await marcarCobrada(id)
    await agregarIngreso({ descripcion: `Me pagaron: ${descripcion}`, monto, fecha: r.hoy, cicloId: idDeCiclo(r.hoy) })
    mostrarAviso(`${pesos(monto)} entraron como ingreso extra`)
  }

  return (
    <section className="seccion">
      <h2 className="seccion__titulo">Te deben</h2>
      <div className="renglones-meta" style={{ justifyContent: 'space-between', marginTop: 8 }}>
        <span>{r.deudasPendientes.length === 1 ? '1 gasto compartido' : `${r.deudasPendientes.length} gastos compartidos`}</span>
        <Monto centavos={total} />
      </div>
      {r.deudasPendientes.map((d, i) => (
        <div key={d.id} className="fila fila--con-accion" style={{ '--i': i } as CSSProperties}>
          <div className="fila__cuerpo">
            <div className="fila__texto">
              <span className="fila__titulo">{d.descripcion}</span>
              <span className="fila__meta">{fechaCorta(d.fecha)}</span>
            </div>
            <Monto className="fila__monto" centavos={d.monto} />
          </div>
          <button type="button" className="enlace fila__accion" onClick={() => void cobrar(d.id, d.descripcion, d.monto)}>
            Ya me pagaron
          </button>
        </div>
      ))}
    </section>
  )
}
