import { useState, type FormEvent } from 'react'
import { Campo } from '../componentes/Campo'
import { pesosACentavos } from '../lib/dinero'
import { useTienda } from '../store/tienda'

export function PrimerArranque() {
  const [texto, setTexto] = useState('')
  const [error, setError] = useState<string | null>(null)
  const guardarIngresoQuincenal = useTienda((s) => s.guardarIngresoQuincenal)

  const empezar = async (e: FormEvent) => {
    e.preventDefault()
    const centavos = pesosACentavos(texto)
    if (!centavos) {
      setError('Escribe un monto. Por ejemplo: 12000')
      return
    }
    await guardarIngresoQuincenal(centavos)
  }

  return (
    <form className="arranque" onSubmit={empezar}>
      <h1 className="arranque__titulo">¿Cuánto cobras por quincena?</h1>
      <p className="tono-muted">Con eso calculamos cuánto te queda por día. Lo puedes cambiar cuando quieras.</p>
      <Campo etiqueta="Ingreso por quincena" error={error}>
        <input className="entrada" type="text" inputMode="decimal" placeholder="12,000" autoFocus value={texto} onChange={(e) => setTexto(e.target.value)} />
      </Campo>
      <button type="submit" className="primario">
        Empezar
      </button>
    </form>
  )
}
