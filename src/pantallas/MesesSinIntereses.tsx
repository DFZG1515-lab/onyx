import { useState, type CSSProperties } from 'react'
import { Barra } from '../componentes/Barra'
import { Fila } from '../componentes/Fila'
import { Heroe } from '../componentes/Heroe'
import { Monto } from '../componentes/Monto'
import { Vacio } from '../componentes/Vacio'
import { useCicloActual } from '../hooks/usePresupuesto'
import { proyeccionMSI } from '../lib/analisis'
import { cicloDesdeId } from '../lib/ciclos'
import { pesos } from '../lib/dinero'
import { etiquetaQuincena, mesCorto } from '../lib/fechas'
import { avanceDeCompra, calendarioDePagos, fechaLiberacion, totalPendiente } from '../lib/msi'
import type { CompraMSI } from '../lib/tipos'
import { useTienda } from '../store/tienda'
import { HojaMSI } from './HojaMSI'

export function MesesSinIntereses() {
  const { hoy, ciclo } = useCicloActual()
  const compras = useTienda((s) => s.comprasMSI)
  const [enEdicion, setEnEdicion] = useState<CompraMSI | 'nueva' | null>(null)

  const pendiente = totalPendiente(compras, hoy)
  const libre = fechaLiberacion(compras)
  const activas = compras.filter((c) => avanceDeCompra(c, hoy).pendiente > 0)
  const terminadas = compras.filter((c) => avanceDeCompra(c, hoy).pendiente === 0)
  const proyeccion = ciclo ? proyeccionMSI(activas, ciclo.id, 7) : []
  const maximo = Math.max(...proyeccion.map((p) => p.monto), 1)
  const primeraBaja = proyeccion.find((p) => p.terminan.length > 0)

  return (
    <div className="cascada">
      <section className="heroe-bloque">
        <p className="meta">¿Cuándo me libero? · te falta pagar</p>
        <Heroe centavos={pendiente} tono="slate" />
        {compras.length === 0 ? (
          <p className="meta" style={{ marginTop: 10 }}>Sin compras a meses sin intereses.</p>
        ) : libre && pendiente > 0 ? (
          <p className="libre">
            Libre en <b>{mesCorto(libre)}</b>
            {proyeccion[0] && proyeccion[0].monto > 0 ? <> · {pesos(proyeccion[0].monto)} salen de esta quincena</> : proyeccion[1] && proyeccion[1].monto > 0 ? <> · {pesos(proyeccion[1].monto)} salen a partir de la que viene</> : null}
          </p>
        ) : (
          <p className="meta" style={{ marginTop: 10 }}>Todo pagado.</p>
        )}

        {activas.length > 0 && (
          <>
            <div className="proyeccion" aria-label="Lo que sale de cada una de las próximas siete quincenas">
              {proyeccion.map((p, i) => (
                <div
                  key={p.cicloId}
                  className={`proyeccion__barra${p.monto === 0 ? ' proyeccion__barra--vacia' : ''}`}
                  style={{ height: `${Math.max(4, (p.monto / maximo) * 100)}%`, '--i': i } as CSSProperties}
                  title={`${etiquetaQuincena(p.cicloId)} · ${pesos(p.monto)}`}
                  role="img"
                  aria-label={`${etiquetaQuincena(p.cicloId)}: ${pesos(p.monto)}`}
                />
              ))}
            </div>
            <div className="proyeccion__etiquetas">
              {proyeccion.map((p) => (
                <span key={p.cicloId}>{etiquetaQuincena(p.cicloId)}</span>
              ))}
            </div>
            <p className="grafica__pie" style={{ marginTop: 8 }}>
              <span>Próximas siete quincenas</span>
              <span>{primeraBaja ? `baja cuando liquides ${primeraBaja.terminan[0]?.toLowerCase()} en ${etiquetaQuincena(primeraBaja.cicloId)}` : 'igual en todas'}</span>
            </p>
          </>
        )}
      </section>

      <section className="seccion">
        <h2 className="seccion__titulo">Compras</h2>
        {activas.length === 0 ? (
          <Vacio texto="Toca el botón de abajo, escribe el monto total y elige los meses. El primer pago cae en la quincena que viene." />
        ) : (
          activas.map((c, i) => {
            const avance = avanceDeCompra(c, hoy)
            const ultimo = calendarioDePagos(c).at(-1)
            const termina = ultimo ? mesCorto(cicloDesdeId(ultimo.cicloId, 0).fin) : ''
            return (
              <Fila
                key={c.id}
                indice={i}
                titulo={c.descripcion}
                meta={`${avance.pagados} de ${avance.total} quincenas · termina ${termina}`}
                monto={<Monto centavos={avance.pendiente} />}
                tono="slate"
                onClick={() => setEnEdicion(c)}
                pie={<Barra fraccion={avance.total > 0 ? avance.pagados / avance.total : 0} tono="slate" etiqueta={`Avance de ${c.descripcion}`} />}
              />
            )
          })
        )}
        <button type="button" className="enlace agregar" onClick={() => setEnEdicion('nueva')}>
          Agregar compra a meses
        </button>
      </section>

      {terminadas.length > 0 && (
        <section className="seccion">
          <h2 className="seccion__titulo">Pagadas</h2>
          {terminadas.map((c, i) => (
            <Fila key={c.id} indice={i} titulo={c.descripcion} meta={`${c.meses} meses`} monto={<Monto centavos={c.montoTotal} />} tono="muted" onClick={() => setEnEdicion(c)} />
          ))}
        </section>
      )}

      <HojaMSI compra={enEdicion} onCerrar={() => setEnEdicion(null)} />
    </div>
  )
}
