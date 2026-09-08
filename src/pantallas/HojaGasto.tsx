import { useState, type FormEvent } from 'react'
import { Campo } from '../componentes/Campo'
import { FotoTicket } from '../componentes/FotoTicket'
import { Hoja } from '../componentes/Hoja'
import { aprenderClaves } from '../lib/aprendizaje'
import { idDeCiclo } from '../lib/ciclos'
import { pesosACentavos } from '../lib/dinero'
import { aFechaInput, deFechaInput } from '../lib/fechas'
import type { Gasto, Metodo } from '../lib/tipos'
import { useTienda } from '../store/tienda'

type Props = { gasto: Gasto | null; onCerrar: () => void }

const METODOS: Metodo[] = ['tarjeta', 'efectivo', 'transferencia']

export function HojaGasto({ gasto, onCerrar }: Props) {
  return (
    <Hoja abierta={gasto !== null} titulo="Editar gasto" onCerrar={onCerrar}>
      {gasto && <Formulario gasto={gasto} onCerrar={onCerrar} />}
    </Hoja>
  )
}

function Formulario({ gasto, onCerrar }: { gasto: Gasto; onCerrar: () => void }) {
  const categorias = useTienda((s) => s.categorias)
  const actualizarGasto = useTienda((s) => s.actualizarGasto)
  const borrarGasto = useTienda((s) => s.borrarGasto)
  const guardarCategoria = useTienda((s) => s.guardarCategoria)

  const [descripcion, setDescripcion] = useState(gasto.descripcion)
  const [monto, setMonto] = useState(String(gasto.monto / 100))
  const [categoriaId, setCategoriaId] = useState(gasto.categoriaId)
  const [metodo, setMetodo] = useState<Metodo>(gasto.metodo)
  const [fecha, setFecha] = useState(aFechaInput(gasto.fecha))
  const [error, setError] = useState<string | null>(null)
  const [confirmarBorrado, setConfirmarBorrado] = useState(false)

  const guardar = async (e: FormEvent) => {
    e.preventDefault()
    const centavos = pesosACentavos(monto)
    const fechaMs = deFechaInput(fecha)
    if (!centavos) return setError('Escribe un monto mayor a cero. Por ejemplo: 85')
    if (!fechaMs) return setError('Elige una fecha')

    await actualizarGasto(gasto.id, { descripcion: descripcion.trim(), monto: centavos, categoriaId, metodo, fecha: fechaMs, cicloId: idDeCiclo(fechaMs) })
    if (categoriaId !== gasto.categoriaId) {
      for (const c of aprenderClaves(categorias, descripcion, categoriaId)) await guardarCategoria(c)
    }
    onCerrar()
  }

  const borrar = async () => {
    if (!confirmarBorrado) return setConfirmarBorrado(true)
    await borrarGasto(gasto.id)
    onCerrar()
  }

  return (
    <form className="formulario" onSubmit={guardar}>
      <Campo etiqueta="Descripción">
        <input className="entrada" type="text" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
      </Campo>
      <Campo etiqueta="Monto" error={error}>
        <input className="entrada" type="text" inputMode="decimal" value={monto} onChange={(e) => setMonto(e.target.value)} />
      </Campo>
      <Campo etiqueta="Categoría" ayuda="Si la cambias, la próxima vez la sugerimos así.">
        <select className="entrada" value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </Campo>
      <Campo etiqueta="Método">
        <select className="entrada" value={metodo} onChange={(e) => setMetodo(e.target.value as Metodo)}>
          {METODOS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </Campo>
      <Campo etiqueta="Fecha">
        <input className="entrada" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
      </Campo>
      {gasto.fotoId && <FotoTicket fotoId={gasto.fotoId} />}
      <div className="formulario__acciones">
        <button type="submit" className="primario">
          Guardar
        </button>
        <button type="button" className="enlace tono-wine" onClick={() => void borrar()}>
          {confirmarBorrado ? 'Confirmar que se borra' : 'Borrar'}
        </button>
      </div>
    </form>
  )
}
