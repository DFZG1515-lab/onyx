import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { Monto } from '../../componentes/Monto'
import { idDeCiclo } from '../../lib/ciclos'
import { interpretar } from '../../lib/parser'
import type { GastoFijo } from '../../lib/tipos'
import { RUTAS } from '../../rutas'
import { useTienda } from '../../store/tienda'
import type { Resumen } from './useResumen'

type Props = { r: Resumen; alEditarFijo: (f: GastoFijo | 'nuevo') => void }

export function Comprometido({ r, alEditarFijo }: Props) {
  const agregarGasto = useTienda((s) => s.agregarGasto)
  const actualizarFijo = useTienda((s) => s.actualizarFijo)
  const { ciclo, hoy, p, comprasMSI, gastosFijos, categorias } = r

  const marcarPagado = async (f: GastoFijo) => {
    const categoriaId = interpretar(`${f.descripcion} 1`, categorias)?.categoriaId ?? 'casa'
    await agregarGasto({ descripcion: f.descripcion, monto: f.monto, categoriaId, metodo: 'transferencia', fecha: hoy, cicloId: idDeCiclo(hoy) })
    await actualizarFijo(f.id, { ultimoPago: ciclo.id })
  }

  return (
    <section className="seccion">
      <h2 className="seccion__titulo">Comprometido en esta quincena</h2>
      <Link to={RUTAS.msi} className="fila fila--boton" style={{ '--i': 0 } as CSSProperties}>
        <div className="fila__renglon">
          <div className="fila__texto">
            <span className="fila__titulo">Meses sin intereses</span>
            <span className="fila__meta">{comprasMSI.length === 0 ? 'Sin compras a meses' : comprasMSI.length === 1 ? '1 compra' : `${comprasMSI.length} compras`}</span>
          </div>
          <Monto className="fila__monto" centavos={p.msi} />
        </div>
      </Link>
      {gastosFijos.map((f, i) => {
        const estado = r.estadoDeFijo(f)
        return (
          <div key={f.id} className="fila fila--con-accion" style={{ '--i': i + 1 } as CSSProperties}>
            <button type="button" className="fila__cuerpo" onClick={() => alEditarFijo(f)}>
              <div className="fila__texto">
                <span className="fila__titulo">{f.descripcion}</span>
                <span className="fila__meta">{estado.texto}</span>
              </div>
              <Monto className={`fila__monto${estado.pendiente ? '' : ' tono-muted'}`} centavos={f.monto} />
            </button>
            {estado.pendiente && (
              <button type="button" className="enlace fila__accion" onClick={() => void marcarPagado(f)}>
                Ya lo pagué
              </button>
            )}
          </div>
        )
      })}
      <button type="button" className="enlace agregar" onClick={() => alEditarFijo('nuevo')}>
        Agregar gasto fijo
      </button>
    </section>
  )
}
