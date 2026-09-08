import { useState, type FormEvent } from 'react'
import { Campo } from '../componentes/Campo'
import { Hoja } from '../componentes/Hoja'
import { pesos, pesosACentavos } from '../lib/dinero'
import type { Categoria } from '../lib/tipos'
import { useTienda } from '../store/tienda'

type Props = { categoria: Categoria | null; sugerido: number | null; onCerrar: () => void }

export function HojaTope({ categoria, sugerido, onCerrar }: Props) {
  return (
    <Hoja abierta={categoria !== null} titulo={categoria ? `Tope de ${categoria.nombre}` : 'Tope'} onCerrar={onCerrar}>
      {categoria && <Formulario categoria={categoria} sugerido={sugerido} onCerrar={onCerrar} />}
    </Hoja>
  )
}

function Formulario({ categoria, sugerido, onCerrar }: { categoria: Categoria; sugerido: number | null; onCerrar: () => void }) {
  const guardarCategoria = useTienda((s) => s.guardarCategoria)
  const [monto, setMonto] = useState(categoria.tope > 0 ? String(categoria.tope / 100) : '')
  const [error, setError] = useState<string | null>(null)

  const guardar = async (e: FormEvent) => {
    e.preventDefault()
    const texto = monto.trim()
    const centavos = texto ? pesosACentavos(texto) : 0
    if (centavos === null) return setError('Escribe un monto, o déjalo vacío para quitar el tope.')
    await guardarCategoria({ ...categoria, tope: centavos })
    onCerrar()
  }

  return (
    <form className="formulario" onSubmit={guardar}>
      <Campo etiqueta="Cuánto quieres gastar como máximo por quincena" error={error} ayuda="Vacío quita el tope.">
        <input className="entrada" type="text" inputMode="decimal" autoFocus placeholder="1,500" value={monto} onChange={(e) => setMonto(e.target.value)} />
      </Campo>
      {sugerido !== null && sugerido > 0 && (
        <button type="button" className="enlace" onClick={() => setMonto(String(sugerido / 100))}>
          Usar el sugerido: {pesos(sugerido, { centavos: false })}, tu promedio reciente
        </button>
      )}
      <div className="formulario__acciones">
        <button type="submit" className="primario">
          Guardar
        </button>
      </div>
    </form>
  )
}
