import { useState, type FormEvent } from 'react'
import { Campo } from '../componentes/Campo'
import { Hoja } from '../componentes/Hoja'
import { pesosACentavos } from '../lib/dinero'
import { aFechaInput, deFechaInput } from '../lib/fechas'
import type { CompraMSI } from '../lib/tipos'
import { useTienda } from '../store/tienda'

type Props = { compra: CompraMSI | 'nueva' | null; onCerrar: () => void }

export function HojaMSI({ compra, onCerrar }: Props) {
  return (
    <Hoja abierta={compra !== null} titulo={compra === 'nueva' ? 'Nueva compra a meses' : 'Editar compra a meses'} onCerrar={onCerrar}>
      {compra && <Formulario compra={compra === 'nueva' ? null : compra} onCerrar={onCerrar} />}
    </Hoja>
  )
}

function Formulario({ compra, onCerrar }: { compra: CompraMSI | null; onCerrar: () => void }) {
  const agregarMSI = useTienda((s) => s.agregarMSI)
  const actualizarMSI = useTienda((s) => s.actualizarMSI)
  const borrarMSI = useTienda((s) => s.borrarMSI)

  const [descripcion, setDescripcion] = useState(compra?.descripcion ?? '')
  const [monto, setMonto] = useState(compra ? String(compra.montoTotal / 100) : '')
  const [meses, setMeses] = useState(compra ? String(compra.meses) : '12')
  const [fecha, setFecha] = useState(aFechaInput(compra?.fechaCompra ?? Date.now()))
  const [error, setError] = useState<string | null>(null)
  const [confirmarBorrado, setConfirmarBorrado] = useState(false)

  const guardar = async (e: FormEvent) => {
    e.preventDefault()
    const centavos = pesosACentavos(monto)
    const numeroMeses = Number(meses)
    const fechaMs = deFechaInput(fecha)
    if (!descripcion.trim()) return setError('Escribe qué compraste. Por ejemplo: tele')
    if (!centavos) return setError('Escribe el monto total. Por ejemplo: 15000')
    if (!Number.isInteger(numeroMeses) || numeroMeses < 1 || numeroMeses > 48) return setError('Los meses van de 1 a 48')
    if (!fechaMs) return setError('Elige la fecha de compra')

    const datos = { descripcion: descripcion.trim(), montoTotal: centavos, meses: numeroMeses, fechaCompra: fechaMs, pagosHechos: 0 }
    if (compra) await actualizarMSI(compra.id, datos)
    else await agregarMSI(datos)
    onCerrar()
  }

  const borrar = async () => {
    if (!compra) return
    if (!confirmarBorrado) return setConfirmarBorrado(true)
    await borrarMSI(compra.id)
    onCerrar()
  }

  return (
    <form className="formulario" onSubmit={guardar}>
      <Campo etiqueta="Qué compraste">
        <input className="entrada" type="text" placeholder="tele" autoFocus={!compra} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
      </Campo>
      <Campo etiqueta="Monto total">
        <input className="entrada" type="text" inputMode="decimal" placeholder="15,000" value={monto} onChange={(e) => setMonto(e.target.value)} />
      </Campo>
      <Campo etiqueta="Meses">
        <input className="entrada" type="number" inputMode="numeric" min={1} max={48} value={meses} onChange={(e) => setMeses(e.target.value)} />
      </Campo>
      <Campo etiqueta="Fecha de compra" error={error} ayuda="El primer pago cae en la quincena siguiente a la compra.">
        <input className="entrada" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
      </Campo>
      <div className="formulario__acciones">
        <button type="submit" className="primario">
          Guardar
        </button>
        {compra && (
          <button type="button" className="enlace tono-wine" onClick={() => void borrar()}>
            {confirmarBorrado ? 'Confirmar que se borra' : 'Borrar'}
          </button>
        )}
      </div>
    </form>
  )
}
