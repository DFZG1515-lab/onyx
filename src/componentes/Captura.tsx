import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useAhora } from '../hooks/useAhora'
import { categoriasCercaDelTope } from '../lib/analisis'
import { aprenderClaves } from '../lib/aprendizaje'
import { idDeCiclo } from '../lib/ciclos'
import { camposDesdeDictado } from '../lib/dictado'
import { formatearEntradaMonto, pesos, pesosACentavos } from '../lib/dinero'
import { diaCalendario } from '../lib/ciclos'
import { aFechaInput, deFechaInput, etiquetaDia, mesCorto } from '../lib/fechas'
import { IconoChevron } from './Iconos'
import { frecuentes, type Frecuente } from '../lib/frecuentes'
import { sugerir } from '../lib/sugerencias'
import type { Metodo } from '../lib/tipos'
import { useTienda } from '../store/tienda'

const METODOS: { valor: Metodo; texto: string }[] = [
  { valor: 'efectivo', texto: 'Efectivo' },
  { valor: 'tarjeta', texto: 'Tarjeta' },
  { valor: 'transferencia', texto: 'Transferencia' },
]
const OPCIONES_MESES: (number | null)[] = [null, 3, 6, 12, 18]

type Props = { alGuardar: (mensaje: string) => void }

/** Formulario por campos: cuánto, dónde, categoría, método, meses y fecha. La app sugiere; el usuario corrige. */
export function Captura({ alGuardar }: Props) {
  const hoy = useAhora()
  const categorias = useTienda((s) => s.categorias)
  const gastos = useTienda((s) => s.gastos)
  const agregarGasto = useTienda((s) => s.agregarGasto)
  const agregarMSI = useTienda((s) => s.agregarMSI)
  const guardarCategoria = useTienda((s) => s.guardarCategoria)
  const asegurarCiclo = useTienda((s) => s.asegurarCiclo)
  const avisoTopes = useTienda((s) => s.ajustes?.avisoTopes !== false)

  const [monto, setMonto] = useState('')
  const [donde, setDonde] = useState('')
  const [categoriaElegida, setCategoriaElegida] = useState<string | null>(null)
  const [metodoElegido, setMetodoElegido] = useState<Metodo | null>(null)
  const [meses, setMeses] = useState<number | null>(null)
  const [fecha, setFecha] = useState(hoy)
  const [editandoFecha, setEditandoFecha] = useState(false)
  const [categoriasAbiertas, setCategoriasAbiertas] = useState(false)
  const [masOpciones, setMasOpciones] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [aviso, setAviso] = useState<{ texto: string; tono: 'muted' | 'wine' | 'green' } | null>(null)
  const [foto, setFoto] = useState<File | null>(null)
  const [escuchando, setEscuchando] = useState(false)
  const reconocimiento = useRef<ReconocimientoVoz | null>(null)
  const entradaFoto = useRef<HTMLInputElement>(null)
  const Reconocimiento = typeof window !== 'undefined' ? (window.SpeechRecognition ?? window.webkitSpeechRecognition) : undefined

  useEffect(() => () => reconocimiento.current?.abort(), [])

  const sugerencia = sugerir(donde, categorias, gastos)
  const categoriaId = categoriaElegida ?? sugerencia.categoriaId
  const metodo = metodoElegido ?? sugerencia.metodo
  const centavos = pesosACentavos(monto)
  const nombreDe = (id: string) => categorias.find((c) => c.id === id)?.nombre ?? id
  const chips = frecuentes(gastos, 4)

  const d = new Date(fecha)
  const textoFecha = `${etiquetaDia(fecha, hoy)}${/^(Hoy|Ayer)$/.test(etiquetaDia(fecha, hoy)) ? `, ${d.getDate()} ${mesCorto(fecha).split(' ')[0]}` : ''}`

  const guardar = async (e?: FormEvent) => {
    e?.preventDefault()
    if (!centavos) {
      setError('Escribe cuánto fue. Por ejemplo: 85')
      return
    }
    const descripcion = donde.trim() || nombreDe(categoriaId)
    await asegurarCiclo(idDeCiclo(fecha))
    if (meses) {
      await agregarMSI({ descripcion, montoTotal: centavos, meses, fechaCompra: fecha, pagosHechos: 0 })
    } else {
      await agregarGasto({ descripcion, monto: centavos, categoriaId, metodo, fecha, cicloId: idDeCiclo(fecha) }, foto ?? undefined)
    }
    // Si corrigió la categoría que sugerían las claves, la app aprende la palabra.
    const porClaves = sugerir(donde, categorias, []).categoriaId
    if (categoriaElegida && categoriaElegida !== porClaves && donde.trim()) {
      for (const c of aprenderClaves(categorias, donde, categoriaElegida)) await guardarCategoria(c)
    }
    let mensaje = meses ? `Guardado: ${descripcion} a ${meses} meses` : `Guardado: ${descripcion} ${pesos(centavos)}${foto ? ' con ticket' : ''}`
    if (!meses && avisoTopes) {
      const delCiclo = useTienda.getState().gastos.filter((g) => g.cicloId === idDeCiclo(fecha))
      const cerca = categoriasCercaDelTope(delCiclo, categorias).find((c) => c.categoriaId === categoriaId)
      if (cerca) mensaje += ` · ${nombreDe(categoriaId)} va al ${cerca.porcentaje} % de su tope`
    }
    alGuardar(mensaje)
  }

  const dictar = () => {
    if (!Reconocimiento) return
    if (escuchando) {
      reconocimiento.current?.stop()
      return
    }
    const r = new Reconocimiento()
    r.lang = 'es-MX'
    r.interimResults = false
    r.maxAlternatives = 1
    r.onresult = (e) => {
      const frase = e.results[0]?.[0]?.transcript ?? ''
      const campos = camposDesdeDictado(frase, categorias)
      if (!campos) {
        setAviso({ texto: `Escuché "${frase}" pero no encontré el monto. Di algo como: oxxo ochenta y cinco.`, tono: 'wine' })
        return
      }
      setMonto(campos.monto)
      setDonde(campos.donde)
      setCategoriaElegida(campos.categoriaId)
      setMetodoElegido(campos.metodo)
      setMeses(campos.meses)
      setError(null)
      setAviso({ texto: `Escuché "${frase}". Revisa y guarda.`, tono: 'green' })
    }
    r.onerror = (e) => {
      setAviso({ texto: e.error === 'not-allowed' ? 'Permite el micrófono en el navegador para dictar.' : 'No se escuchó nada. Intenta otra vez.', tono: 'wine' })
    }
    r.onend = () => setEscuchando(false)
    reconocimiento.current = r
    setAviso({ texto: 'Escuchando… di el lugar, el monto y cómo pagaste.', tono: 'muted' })
    setEscuchando(true)
    r.start()
  }

  const guardarChip = async (chip: Frecuente) => {
    await agregarGasto({ descripcion: chip.descripcion, monto: chip.monto, categoriaId: chip.categoriaId, metodo: chip.metodo, fecha: hoy, cicloId: idDeCiclo(hoy) })
    alGuardar(`Guardado: ${chip.descripcion} ${pesos(chip.monto)}`)
  }

  return (
    <form className="captura" onSubmit={guardar}>
      <label className="captura-monto">
        <span className="et">¿Cuánto fue?</span>
        <span className={`captura-monto__linea${error ? ' captura-monto__linea--error' : ''}`}>
          <span className="captura-monto__signo">$</span>
          <input
            className="captura-monto__entrada"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            autoFocus
            placeholder="0"
            aria-label="Cuánto fue, en pesos"
            value={monto}
            onChange={(e) => {
              setMonto(formatearEntradaMonto(e.target.value))
              setError(null)
            }}
          />
        </span>
        {error && <span className="campo__error">{error}</span>}
      </label>

      <label className="captura-donde">
        <span className="et">¿Dónde o en qué?</span>
        <input className="entrada" type="text" autoComplete="off" enterKeyHint="done" placeholder="oxxo, gasolina, tacos…" aria-label="Dónde o en qué" value={donde} onChange={(e) => setDonde(e.target.value)} />
      </label>

      <div>
        <span className="et">
          Categoría{!categoriaElegida && sugerencia.razonCategoria ? <span className="et__razon"> · {sugerencia.razonCategoria}</span> : null}
        </span>
        {categoriasAbiertas ? (
          <div className="chips chips--envolver" role="radiogroup" aria-label="Categoría">
            {categorias.map((c) => (
              <button
                key={c.id}
                type="button"
                role="radio"
                aria-checked={c.id === categoriaId}
                className={`chip${c.id === categoriaId ? ' chip--on' : ''}`}
                onClick={() => {
                  setCategoriaElegida(c.id)
                  setCategoriasAbiertas(false)
                }}
              >
                {c.nombre}
              </button>
            ))}
          </div>
        ) : (
          <button type="button" className="chip chip--on chip--desplegable" aria-expanded="false" onClick={() => setCategoriasAbiertas(true)}>
            {nombreDe(categoriaId)}
            <IconoChevron width={14} height={14} />
          </button>
        )}
      </div>

      <div>
        <span className="et">
          ¿Cómo pagaste?{!metodoElegido && sugerencia.razonMetodo ? <span className="et__razon"> · {sugerencia.razonMetodo}</span> : null}
        </span>
        <div className="segmentos" role="radiogroup" aria-label="Método de pago">
          {METODOS.map((m) => (
            <button key={m.valor} type="button" role="radio" aria-checked={m.valor === metodo} className={`segmento${m.valor === metodo ? ' segmento--on' : ''}`} onClick={() => setMetodoElegido(m.valor)}>
              {m.texto}
            </button>
          ))}
        </div>
      </div>

      {!masOpciones && meses === null && diaCalendario(fecha) === diaCalendario(hoy) ? (
        <button type="button" className="enlace-meta captura-mas" onClick={() => setMasOpciones(true)}>
          Más opciones · hoy, una sola vez
        </button>
      ) : (
        <>
      <div>
        <span className="et">Meses sin intereses</span>
        <div className="segmentos" role="radiogroup" aria-label="Meses sin intereses">
          {OPCIONES_MESES.map((m) => (
            <button key={m ?? 'no'} type="button" role="radio" aria-checked={m === meses} className={`segmento${m === meses ? ' segmento--on' : ''}`} onClick={() => setMeses(m)}>
              {m ?? 'No'}
            </button>
          ))}
        </div>
      </div>

      <div className="captura-fecha">
        <span className="meta">Fecha</span>
        {editandoFecha ? (
          <input
            className="entrada captura-fecha__entrada"
            type="date"
            autoFocus
            value={aFechaInput(fecha)}
            max={aFechaInput(hoy)}
            aria-label="Fecha del gasto"
            onChange={(e) => {
              const ms = deFechaInput(e.target.value)
              if (ms) setFecha(ms)
            }}
            onBlur={() => setEditandoFecha(false)}
          />
        ) : (
          <button type="button" className="enlace-meta captura-fecha__boton" onClick={() => setEditandoFecha(true)}>
            {textoFecha}
          </button>
        )}
      </div>
        </>
      )}

      {chips.length > 0 && (
        <div>
          <span className="et">Repetir uno de siempre</span>
          <div className="chips" aria-label="Gastos frecuentes">
            {chips.map((chip) => (
              <button key={chip.descripcion} type="button" className="chip" onClick={() => void guardarChip(chip)}>
                {chip.descripcion} {pesos(chip.monto, { centavos: chip.monto % 100 !== 0 })}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="acciones">
        <button type="submit" className="primario acciones__principal" disabled={!centavos}>
          Guardar
        </button>
        <input
          ref={entradaFoto}
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          onChange={(e) => {
            const archivo = e.target.files?.[0] ?? null
            setFoto(archivo)
            if (archivo) setAviso({ texto: 'Ticket adjunto. Se guarda junto con el gasto.', tono: 'green' })
          }}
        />
        <button type="button" className={`secundario${foto ? ' secundario--activo' : ''}`} aria-label={foto ? 'Cambiar la foto del ticket' : 'Adjuntar foto del ticket'} onClick={() => entradaFoto.current?.click()}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v12H4z" /><circle cx="12" cy="13" r="3.5" /></svg>
        </button>
        {Reconocimiento && (
          <button type="button" className={`secundario${escuchando ? ' secundario--escuchando' : ''}`} aria-label={escuchando ? 'Dejar de escuchar' : 'Dictar el gasto'} aria-pressed={escuchando} onClick={dictar}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M6 11a6 6 0 0 0 12 0M12 17v4" /></svg>
          </button>
        )}
      </div>
      {(aviso || foto) && (
        <div className="captura-aviso" role="status">
          {aviso && <span className={`tono-${aviso.tono}`}>{aviso.texto}</span>}
          {foto && !aviso && <span className="tono-muted">Ticket adjunto: {foto.name}</span>}
          {foto && (
            <button type="button" className="enlace-meta" onClick={() => { setFoto(null); setAviso(null); if (entradaFoto.current) entradaFoto.current.value = '' }}>
              Quitar foto
            </button>
          )}
        </div>
      )}
    </form>
  )
}
