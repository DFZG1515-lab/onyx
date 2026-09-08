import { useState, type FormEvent } from 'react'
import { Campo } from '../componentes/Campo'
import { Hoja } from '../componentes/Hoja'
import { idDeCiclo } from '../lib/ciclos'
import { pesosACentavos } from '../lib/dinero'
import { aFechaInput, deFechaInput } from '../lib/fechas'
import { useTienda } from '../store/tienda'

type Props = { abierta: boolean; hoy: number; onCerrar: () => void }

/** Un bono, aguinaldo o dinero que te devuelven. Suma al disponible de su quincena sin mover el ritmo. */
export function HojaIngresoExtra({ abierta, hoy, onCerrar }: Props) {
  return (
    <Hoja abierta={abierta} titulo="Ingreso extra" onCerrar={onCerrar}>
      <Formulario hoy={hoy} onCerrar={onCerrar} />
    </Hoja>
  )
}

function Formulario({ hoy, onCerrar }: { hoy: number; onCerrar: () => void }) {
  const agregarIngreso = useTienda((s) => s.agregarIngreso)
  const asegurarCiclo = useTienda((s) => s.asegurarCiclo)
  const [descripcion, setDescripcion] = useState('')
  const [monto, setMonto] = useState('')
  const [fecha, setFecha] = useState(aFechaInput(hoy))
  const [error, setError] = useState<string | null>(null)

  const guardar = async (e: FormEvent) => {
    e.preventDefault()
    const centavos = pesosACentavos(monto)
    const fechaMs = deFechaInput(fecha)
    if (!descripcion.trim()) return setError('Escribe de qué es. Por ejemplo: aguinaldo')
    if (!centavos) return setError('Escribe el monto. Por ejemplo: 5000')
    if (!fechaMs) return setError('Elige la fecha')
    const cicloId = idDeCiclo(fechaMs)
    await asegurarCiclo(cicloId)
    await agregarIngreso({ descripcion: descripcion.trim(), monto: centavos, fecha: fechaMs, cicloId })
    onCerrar()
  }

  return (
    <form className="formulario" onSubmit={guardar}>
      <Campo etiqueta="De qué es" error={error}>
        <input className="entrada" type="text" autoFocus placeholder="aguinaldo, bono, me devolvieron" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
      </Campo>
      <Campo etiqueta="Monto">
        <input className="entrada" type="text" inputMode="decimal" placeholder="5,000" value={monto} onChange={(e) => setMonto(e.target.value)} />
      </Campo>
      <Campo etiqueta="Fecha" ayuda="Suma al disponible de esa quincena. No cambia el ritmo esperado.">
        <input className="entrada" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
      </Campo>
      <div className="formulario__acciones">
        <button type="submit" className="primario">Guardar</button>
      </div>
    </form>
  )
}
