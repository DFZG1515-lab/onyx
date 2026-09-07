import { useState, type FormEvent } from 'react'
import { aprenderClaves } from '../lib/aprendizaje'
import { idDeCiclo } from '../lib/ciclos'
import { pesos } from '../lib/dinero'
import { frecuentes, type Frecuente } from '../lib/frecuentes'
import { interpretar } from '../lib/parser'
import { useTienda } from '../store/tienda'
import { Monto } from './Monto'

const EJEMPLO = 'Escribe qué compraste y cuánto costó. Por ejemplo: oxxo 85'
const SIN_MONTO = 'Falta el monto. Por ejemplo: oxxo 85'

type Props = { alGuardar: (mensaje: string) => void }

/** Un solo texto libre, interpretación en vivo mientras se escribe, chips de un toque. */
export function Captura({ alGuardar }: Props) {
  const [texto, setTexto] = useState('')
  const [categoriaElegida, setCategoriaElegida] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const categorias = useTienda((s) => s.categorias)
  const gastos = useTienda((s) => s.gastos)
  const agregarGasto = useTienda((s) => s.agregarGasto)
  const agregarMSI = useTienda((s) => s.agregarMSI)
  const guardarCategoria = useTienda((s) => s.guardarCategoria)

  const interpretacion = texto.trim() ? interpretar(texto, categorias) : null
  const categoriaId = categoriaElegida ?? interpretacion?.categoriaId ?? null
  const nombreDe = (id: string) => categorias.find((c) => c.id === id)?.nombre ?? id
  const chips = frecuentes(gastos, 4)

  const guardar = async (e?: FormEvent) => {
    e?.preventDefault()
    if (!interpretacion || !categoriaId) {
      setError(texto.trim() ? SIN_MONTO : EJEMPLO)
      return
    }
    const ahora = Date.now()
    const descripcion = interpretacion.descripcion || nombreDe(categoriaId)

    if (interpretacion.meses) {
      await agregarMSI({ descripcion, montoTotal: interpretacion.monto, meses: interpretacion.meses, fechaCompra: ahora, pagosHechos: 0 })
    } else {
      await agregarGasto({ descripcion, monto: interpretacion.monto, categoriaId, metodo: interpretacion.metodo, fecha: ahora, cicloId: idDeCiclo(ahora) })
    }
    if (categoriaElegida && categoriaElegida !== interpretacion.categoriaId) {
      for (const c of aprenderClaves(categorias, interpretacion.descripcion, categoriaElegida)) await guardarCategoria(c)
    }
    alGuardar(interpretacion.meses ? `Guardado: ${descripcion} a ${interpretacion.meses} meses` : `Guardado: ${descripcion} ${pesos(interpretacion.monto)}`)
  }

  const guardarChip = async (chip: Frecuente) => {
    const ahora = Date.now()
    await agregarGasto({ descripcion: chip.descripcion, monto: chip.monto, categoriaId: chip.categoriaId, metodo: chip.metodo, fecha: ahora, cicloId: idDeCiclo(ahora) })
    alGuardar(`Guardado: ${chip.descripcion} ${pesos(chip.monto)}`)
  }

  return (
    <form className="captura" onSubmit={guardar}>
      <div className="captura__linea">
        <input
          className="captura__entrada"
          type="text"
          inputMode="text"
          autoComplete="off"
          autoFocus
          enterKeyHint="done"
          placeholder="oxxo 85 efectivo"
          aria-label="Nuevo gasto"
          value={texto}
          onChange={(e) => {
            setTexto(e.target.value)
            setCategoriaElegida(null)
            setError(null)
          }}
        />
      </div>

      <div className="captura__vista" aria-live="polite">
        {error ? (
          <span className="tono-wine">{error}</span>
        ) : !texto.trim() ? (
          <span className="tono-muted">{EJEMPLO}</span>
        ) : !interpretacion || !categoriaId ? (
          <span className="tono-muted">{SIN_MONTO}</span>
        ) : (
          <>
            <Monto className="captura__monto" centavos={interpretacion.monto} />
            <span className="captura__sep">·</span>
            <span className="captura__categoria">
              <span aria-hidden="true">{nombreDe(categoriaId)}</span>
              <select aria-label="Categoría" value={categoriaId} onChange={(e) => setCategoriaElegida(e.target.value)}>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </span>
            <span className="captura__sep">·</span>
            <span>{interpretacion.metodo}</span>
            {interpretacion.meses && (
              <>
                <span className="captura__sep">·</span>
                <span className="tono-slate">{interpretacion.meses} meses sin intereses</span>
              </>
            )}
          </>
        )}
      </div>

      {chips.length > 0 && (
        <div className="chips" aria-label="Gastos frecuentes">
          {chips.map((chip) => (
            <button key={chip.descripcion} type="button" className="chip" onClick={() => void guardarChip(chip)}>
              {chip.descripcion} {pesos(chip.monto, { centavos: chip.monto % 100 !== 0 })}
            </button>
          ))}
        </div>
      )}

      <div className="formulario__acciones">
        <button type="submit" className="primario" disabled={!interpretacion}>
          Guardar
        </button>
      </div>
    </form>
  )
}
