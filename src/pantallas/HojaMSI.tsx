import { useState, type FormEvent } from 'react'
import { Campo } from '../componentes/Campo'
import { Hoja } from '../componentes/Hoja'
import { pesosACentavos } from '../lib/dinero'
import { idDeCiclo, idSiguiente } from '../lib/ciclos'
import { aFechaInput, deFechaInput, etiquetaQuincena } from '../lib/fechas'
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
  const [primerCargo, setPrimerCargo] = useState<'siguiente' | 'misma' | 'otra'>(compra?.primerPagoCicloId ? (compra.primerPagoCicloId === idDeCiclo(compra.fechaCompra) ? 'misma' : 'otra') : 'siguiente')
  const [fechaCargo, setFechaCargo] = useState(aFechaInput(compra?.fechaCompra ?? Date.now()))
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

    const fechaCargoMs = deFechaInput(fechaCargo)
    if (primerCargo === 'otra' && !fechaCargoMs) return setError('Elige la fecha del primer cargo')
    const base = { descripcion: descripcion.trim(), montoTotal: centavos, meses: numeroMeses, fechaCompra: fechaMs }
    const datos = primerCargo === 'siguiente' ? base : { ...base, primerPagoCicloId: primerCargo === 'misma' ? idDeCiclo(fechaMs) : idDeCiclo(fechaCargoMs ?? fechaMs) }
    if (compra) await actualizarMSI(compra.id, primerCargo === 'siguiente' ? { ...datos, primerPagoCicloId: undefined as unknown as string } : datos)
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
      <Campo etiqueta="Fecha de compra" error={error}>
        <input className="entrada" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
      </Campo>
      <div>
        <span className="et">Primer cargo en la tarjeta</span>
        <div className="segmentos" role="radiogroup" aria-label="Primer cargo">
          {([['siguiente', `Quincena siguiente${deFechaInput(fecha) ? ` · ${etiquetaQuincena(idSiguiente(idDeCiclo(deFechaInput(fecha) ?? Date.now())))}` : ''}`], ['misma', 'Esta misma'], ['otra', 'Otra fecha']] as const).map(([valor, texto]) => (
            <button key={valor} type="button" role="radio" aria-checked={primerCargo === valor} className={`segmento${primerCargo === valor ? ' segmento--on' : ''}`} onClick={() => setPrimerCargo(valor)}>
              {texto}
            </button>
          ))}
        </div>
        {primerCargo === 'otra' && (
          <input className="entrada" type="date" style={{ marginTop: 8 }} aria-label="Fecha del primer cargo" value={fechaCargo} onChange={(e) => setFechaCargo(e.target.value)} />
        )}
        <span className="et" style={{ marginTop: 6 }}>Si tu tarjeta corta después de la compra, el primer pago puede caer una quincena más tarde.</span>
      </div>
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
