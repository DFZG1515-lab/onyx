import { useState } from 'react'
import { Barra } from '../componentes/Barra'
import { Fila } from '../componentes/Fila'
import { Monto } from '../componentes/Monto'
import { Vacio } from '../componentes/Vacio'
import { useCicloActual } from '../hooks/usePresupuesto'
import { cicloDesdeId, idSiguiente } from '../lib/ciclos'
import { pesos } from '../lib/dinero'
import { fechaLarga, mesCorto } from '../lib/fechas'
import { avanceDeCompra, calendarioDePagos, fechaLiberacion, totalMSIEnCiclo, totalPendiente } from '../lib/msi'
import type { CompraMSI } from '../lib/tipos'
import { useTienda } from '../store/tienda'
import { HojaMSI } from './HojaMSI'

export function MesesSinIntereses() {
  const { hoy, ciclo } = useCicloActual()
  const compras = useTienda((s) => s.comprasMSI)
  const [enEdicion, setEnEdicion] = useState<CompraMSI | 'nueva' | null>(null)

  const pendiente = totalPendiente(compras, hoy)
  const estaQuincena = ciclo ? totalMSIEnCiclo(compras, ciclo.id) : 0
  const siguienteQuincena = ciclo ? totalMSIEnCiclo(compras, idSiguiente(ciclo.id)) : 0
  const libre = fechaLiberacion(compras)
  const activas = compras.filter((c) => avanceDeCompra(c, hoy).pendiente > 0)
  const terminadas = compras.filter((c) => avanceDeCompra(c, hoy).pendiente === 0)

  return (
    <>
      <section className="heroe-bloque">
        <p className="meta">Te falta pagar a meses</p>
        <Monto className="heroe tono-slate" centavos={pendiente} conCentavos={false} />
        <p className="meta">
          {compras.length === 0
            ? 'Sin compras a meses sin intereses.'
            : libre && pendiente > 0
              ? `${estaQuincena > 0 ? `${pesos(estaQuincena)} salen de esta quincena` : `${pesos(siguienteQuincena)} salen a partir de la quincena que viene`} · libre el ${fechaLarga(libre)}`
              : 'Todo pagado.'}
        </p>
      </section>

      <section className="seccion">
        <h2 className="seccion__titulo">Compras</h2>
        {activas.length === 0 ? (
          <Vacio texto="Escribe una compra abajo con sus meses. Por ejemplo: tele 15000 a 12 meses" />
        ) : (
          activas.map((c) => {
            const avance = avanceDeCompra(c, hoy)
            const ultimo = calendarioDePagos(c).at(-1)
            const termina = ultimo ? mesCorto(cicloDesdeId(ultimo.cicloId, 0).fin) : ''
            return (
              <Fila
                key={c.id}
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
          {terminadas.map((c) => (
            <Fila key={c.id} titulo={c.descripcion} meta={`${c.meses} meses`} monto={<Monto centavos={c.montoTotal} />} tono="muted" onClick={() => setEnEdicion(c)} />
          ))}
        </section>
      )}

      <HojaMSI compra={enEdicion} onCerrar={() => setEnEdicion(null)} />
    </>
  )
}
