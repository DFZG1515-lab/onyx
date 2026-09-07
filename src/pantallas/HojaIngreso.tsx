import { useState, type FormEvent } from 'react'
import { Campo } from '../componentes/Campo'
import { Hoja } from '../componentes/Hoja'
import { pesosACentavos } from '../lib/dinero'
import type { Ciclo } from '../lib/tipos'
import { useTienda } from '../store/tienda'

type Props = { ciclo: Ciclo | null; onCerrar: () => void }

export function HojaIngreso({ ciclo, onCerrar }: Props) {
  return (
    <Hoja abierta={ciclo !== null} titulo="Ingreso de la quincena" onCerrar={onCerrar}>
      {ciclo && <Formulario ciclo={ciclo} onCerrar={onCerrar} />}
    </Hoja>
  )
}

function Formulario({ ciclo, onCerrar }: { ciclo: Ciclo; onCerrar: () => void }) {
  const guardarCiclo = useTienda((s) => s.guardarCiclo)
  const guardarIngresoQuincenal = useTienda((s) => s.guardarIngresoQuincenal)
  const [monto, setMonto] = useState(String(ciclo.ingresoEsperado / 100))
  const [tambienSiguientes, setTambienSiguientes] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const guardar = async (e: FormEvent) => {
    e.preventDefault()
    const centavos = pesosACentavos(monto)
    if (!centavos) return setError('Escribe un monto mayor a cero. Por ejemplo: 12000')
    await guardarCiclo({ ...ciclo, ingresoEsperado: centavos })
    if (tambienSiguientes) await guardarIngresoQuincenal(centavos)
    onCerrar()
  }

  return (
    <form className="formulario" onSubmit={guardar}>
      <Campo etiqueta="Cuánto entra esta quincena" error={error}>
        <input className="entrada" type="text" inputMode="decimal" autoFocus value={monto} onChange={(e) => setMonto(e.target.value)} />
      </Campo>
      <label className="casilla">
        <input type="checkbox" checked={tambienSiguientes} onChange={(e) => setTambienSiguientes(e.target.checked)} />
        <span>Usar también en las quincenas que siguen</span>
      </label>
      <div className="formulario__acciones">
        <button type="submit" className="primario">
          Guardar
        </button>
      </div>
    </form>
  )
}
