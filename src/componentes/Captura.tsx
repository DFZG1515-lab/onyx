import { useEffect, useRef, useState, type FormEvent } from 'react'
import { aprenderClaves } from '../lib/aprendizaje'
import { idDeCiclo } from '../lib/ciclos'
import { pesos } from '../lib/dinero'
import { frecuentes, type Frecuente } from '../lib/frecuentes'
import { interpretar } from '../lib/parser'
import { Monto } from './Monto'
import { useTienda } from '../store/tienda'

const EJEMPLO = 'Escribe qué compraste y cuánto costó. Por ejemplo: oxxo 85'
const SIN_MONTO = 'Falta el monto. Por ejemplo: oxxo 85'

/** El campo fijo de abajo. Un solo texto libre, interpretación en vivo, chips de un toque. */
export function Captura() {
  const [texto, setTexto] = useState('')
  const [categoriaElegida, setCategoriaElegida] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const entrada = useRef<HTMLInputElement>(null)

  const categorias = useTienda((s) => s.categorias)
  const gastos = useTienda((s) => s.gastos)
  const agregarGasto = useTienda((s) => s.agregarGasto)
  const agregarMSI = useTienda((s) => s.agregarMSI)
  const guardarCategoria = useTienda((s) => s.guardarCategoria)

  const interpretacion = texto.trim() ? interpretar(texto, categorias) : null
  const categoriaId = categoriaElegida ?? interpretacion?.categoriaId ?? null
  const nombreDe = (id: string) => categorias.find((c) => c.id === id)?.nombre ?? id
  const chips = frecuentes(gastos, 4)

  useEffect(() => {
    if (!aviso) return
    const t = window.setTimeout(() => setAviso(null), 2_500)
    return () => window.clearTimeout(t)
  }, [aviso])

  const limpiar = () => {
    setTexto('')
    setCategoriaElegida(null)
  }

  const guardar = async (e?: FormEvent) => {
    e?.preventDefault()
    if (!interpretacion || !categoriaId) {
      setAviso(texto.trim() ? SIN_MONTO : EJEMPLO)
      return
    }
    const ahora = Date.now()
    const descripcion = interpretacion.descripcion || nombreDe(categoriaId)

    if (interpretacion.meses) {
      await agregarMSI({ descripcion, montoTotal: interpretacion.monto, meses: interpretacion.meses, fechaCompra: ahora, pagosHechos: 0 })
      setAviso(`Guardado: ${descripcion} a ${interpretacion.meses} meses`)
    } else {
      await agregarGasto({ descripcion, monto: interpretacion.monto, categoriaId, metodo: interpretacion.metodo, fecha: ahora, cicloId: idDeCiclo(ahora) })
      setAviso(`Guardado: ${descripcion} ${pesos(interpretacion.monto)}`)
    }

    if (categoriaElegida && categoriaElegida !== interpretacion.categoriaId) {
      for (const c of aprenderClaves(categorias, interpretacion.descripcion, categoriaElegida)) await guardarCategoria(c)
    }
    limpiar()
    entrada.current?.focus()
  }

  const guardarChip = async (chip: Frecuente) => {
    const ahora = Date.now()
    await agregarGasto({ descripcion: chip.descripcion, monto: chip.monto, categoriaId: chip.categoriaId, metodo: chip.metodo, fecha: ahora, cicloId: idDeCiclo(ahora) })
    setAviso(`Guardado: ${chip.descripcion} ${pesos(chip.monto)}`)
  }

  return (
    <form className="captura" onSubmit={guardar}>
      <div className="captura__vista" aria-live="polite">
        {aviso ? (
          <span className="tono-green">{aviso}</span>
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
      <div className="captura__linea">
        <input
          ref={entrada}
          className="captura__entrada"
          type="text"
          inputMode="text"
          autoComplete="off"
          enterKeyHint="done"
          placeholder="oxxo 85 efectivo"
          aria-label="Nuevo gasto"
          value={texto}
          onChange={(e) => {
            setTexto(e.target.value)
            setCategoriaElegida(null)
            setAviso(null)
          }}
        />
        <button type="submit" className="captura__guardar" disabled={!interpretacion}>
          Guardar
        </button>
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
    </form>
  )
}
