import { useState, type FormEvent } from 'react'
import { Campo } from '../componentes/Campo'
import { Hoja } from '../componentes/Hoja'
import { IconoChevron, IconoPalomita } from '../componentes/Iconos'
import { Marca } from '../componentes/Marca'
import { pesos, pesosACentavos } from '../lib/dinero'
import { useTienda } from '../store/tienda'
import { useUI } from '../store/ui'
import { HojaFijo } from './HojaFijo'
import { HojaMSI } from './HojaMSI'

/** Lista de configuración de primer uso: ingreso, fijos y compras a meses. */
export function PrimerUso() {
  const ajustes = useTienda((s) => s.ajustes)
  const fijos = useTienda((s) => s.gastosFijos)
  const compras = useTienda((s) => s.comprasMSI)
  const guardarAjustes = useTienda((s) => s.guardarAjustes)
  const abrirCaptura = useUI((s) => s.abrirCaptura)
  const [hoja, setHoja] = useState<'ingreso' | 'fijo' | 'msi' | null>(null)

  const terminar = async (yCapturar: boolean) => {
    await guardarAjustes({ primerUsoCompleto: true })
    if (yCapturar) abrirCaptura()
  }

  const pasos = [
    { id: 'ingreso' as const, titulo: 'Cuánto te depositan', hecho: !!ajustes, valor: ajustes ? `${pesos(ajustes.ingresoQuincenal, { centavos: false })} por quincena` : 'Con esto calculamos cuánto te queda por día' },
    { id: 'fijo' as const, titulo: 'Tus gastos fijos', hecho: fijos.length > 0, valor: fijos.length > 0 ? `${fijos.length === 1 ? '1 gasto fijo' : `${fijos.length} gastos fijos`} · agregar otro` : 'Renta, luz, internet: lo que se cobra cada mes' },
    { id: 'msi' as const, titulo: 'Compras a meses', hecho: compras.length > 0, valor: compras.length > 0 ? `${compras.length === 1 ? '1 compra' : `${compras.length} compras`} · agregar otra` : 'Opcional. Lo que ya estás pagando a meses sin intereses' },
  ]

  return (
    <div className="arranque">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Marca tamano={22} />
        <span style={{ fontWeight: 600 }}>Onyx</span>
      </div>
      <h1 className="arranque__titulo">¿Me alcanza?</h1>
      <p className="tono-muted">Tres datos y la app responde esa pregunta cada día de la quincena.</p>

      <div className="lista-inicio">
        {pasos.map((p) => (
          <button key={p.id} type="button" className="paso-inicio" onClick={() => setHoja(p.id)}>
            <span className={`paso-inicio__marca${p.hecho ? ' paso-inicio__marca--hecho' : ''}`}>{p.hecho ? <IconoPalomita /> : <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="12" cy="12" r="7" /></svg>}</span>
            <span className="paso-inicio__texto">
              <span>{p.titulo}</span>
              <span className="paso-inicio__valor">{p.valor}</span>
            </span>
            <span className="paso-inicio__chevron"><IconoChevron /></span>
          </button>
        ))}
      </div>

      <button type="button" className="primario" disabled={!ajustes} onClick={() => void terminar(false)}>
        Continuar
      </button>
      <button type="button" className="enlace" style={{ textAlign: 'center' }} disabled={!ajustes} onClick={() => void terminar(true)}>
        Registrar mi primer gasto
      </button>
      {!ajustes && <p className="meta" style={{ textAlign: 'center' }}>Empieza por cuánto te depositan.</p>}

      <HojaIngresoInicial abierta={hoja === 'ingreso'} onCerrar={() => setHoja(null)} />
      <HojaFijo fijo={hoja === 'fijo' ? 'nuevo' : null} onCerrar={() => setHoja(null)} />
      <HojaMSI compra={hoja === 'msi' ? 'nueva' : null} onCerrar={() => setHoja(null)} />
    </div>
  )
}

function HojaIngresoInicial({ abierta, onCerrar }: { abierta: boolean; onCerrar: () => void }) {
  const ajustes = useTienda((s) => s.ajustes)
  const guardarIngresoQuincenal = useTienda((s) => s.guardarIngresoQuincenal)
  const [texto, setTexto] = useState(ajustes ? String(ajustes.ingresoQuincenal / 100) : '')
  const [error, setError] = useState<string | null>(null)

  const guardar = async (e: FormEvent) => {
    e.preventDefault()
    const centavos = pesosACentavos(texto)
    if (!centavos) return setError('Escribe un monto. Por ejemplo: 12000')
    await guardarIngresoQuincenal(centavos)
    onCerrar()
  }

  return (
    <Hoja abierta={abierta} titulo="Cuánto te depositan" onCerrar={onCerrar}>
      <form className="formulario" onSubmit={guardar}>
        <Campo etiqueta="Ingreso por quincena" error={error} ayuda="Lo puedes cambiar cuando quieras.">
          <input className="entrada" type="text" inputMode="decimal" placeholder="12,000" autoFocus value={texto} onChange={(e) => setTexto(e.target.value)} />
        </Campo>
        <div className="formulario__acciones">
          <button type="submit" className="primario">Guardar</button>
        </div>
      </form>
    </Hoja>
  )
}
