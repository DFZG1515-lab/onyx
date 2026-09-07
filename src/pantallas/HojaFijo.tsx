import { useState, type FormEvent } from 'react'
import { Campo } from '../componentes/Campo'
import { Hoja } from '../componentes/Hoja'
import { pesosACentavos } from '../lib/dinero'
import type { GastoFijo } from '../lib/tipos'
import { useTienda } from '../store/tienda'

/** `fijo` null: cerrada. 'nuevo': alta. Un GastoFijo: edición. */
type Props = { fijo: GastoFijo | 'nuevo' | null; onCerrar: () => void }

export function HojaFijo({ fijo, onCerrar }: Props) {
  return (
    <Hoja abierta={fijo !== null} titulo={fijo === 'nuevo' ? 'Nuevo gasto fijo' : 'Editar gasto fijo'} onCerrar={onCerrar}>
      {fijo && <Formulario fijo={fijo === 'nuevo' ? null : fijo} onCerrar={onCerrar} />}
    </Hoja>
  )
}

function Formulario({ fijo, onCerrar }: { fijo: GastoFijo | null; onCerrar: () => void }) {
  const agregarFijo = useTienda((s) => s.agregarFijo)
  const actualizarFijo = useTienda((s) => s.actualizarFijo)
  const borrarFijo = useTienda((s) => s.borrarFijo)

  const [descripcion, setDescripcion] = useState(fijo?.descripcion ?? '')
  const [monto, setMonto] = useState(fijo ? String(fijo.monto / 100) : '')
  const [dia, setDia] = useState(fijo ? String(fijo.diaDelMes) : '')
  const [activo, setActivo] = useState(fijo?.activo ?? true)
  const [error, setError] = useState<string | null>(null)
  const [confirmarBorrado, setConfirmarBorrado] = useState(false)

  const guardar = async (e: FormEvent) => {
    e.preventDefault()
    const centavos = pesosACentavos(monto)
    const diaDelMes = Number(dia)
    if (!descripcion.trim()) return setError('Escribe qué es. Por ejemplo: renta')
    if (!centavos) return setError('Escribe un monto mayor a cero. Por ejemplo: 8000')
    if (!Number.isInteger(diaDelMes) || diaDelMes < 1 || diaDelMes > 31) return setError('El día va del 1 al 31')

    const datos = { descripcion: descripcion.trim(), monto: centavos, diaDelMes, activo }
    if (fijo) await actualizarFijo(fijo.id, datos)
    else await agregarFijo(datos)
    onCerrar()
  }

  const borrar = async () => {
    if (!fijo) return
    if (!confirmarBorrado) return setConfirmarBorrado(true)
    await borrarFijo(fijo.id)
    onCerrar()
  }

  return (
    <form className="formulario" onSubmit={guardar}>
      <Campo etiqueta="Descripción">
        <input className="entrada" type="text" placeholder="renta" autoFocus={!fijo} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
      </Campo>
      <Campo etiqueta="Monto">
        <input className="entrada" type="text" inputMode="decimal" placeholder="8,000" value={monto} onChange={(e) => setMonto(e.target.value)} />
      </Campo>
      <Campo etiqueta="Día del mes en que se cobra" error={error} ayuda="Si el mes es más corto, se recorre al último día.">
        <input className="entrada" type="number" inputMode="numeric" min={1} max={31} placeholder="10" value={dia} onChange={(e) => setDia(e.target.value)} />
      </Campo>
      <label className="casilla">
        <input type="checkbox" checked={activo} onChange={(e) => setActivo(e.target.checked)} />
        <span>Activo</span>
      </label>
      <div className="formulario__acciones">
        <button type="submit" className="primario">
          Guardar
        </button>
        {fijo && (
          <button type="button" className="enlace tono-wine" onClick={() => void borrar()}>
            {confirmarBorrado ? 'Confirmar que se borra' : 'Borrar'}
          </button>
        )}
      </div>
    </form>
  )
}
