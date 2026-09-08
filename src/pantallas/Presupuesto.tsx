import { useEffect, useRef, useState } from 'react'
import { Barra } from '../componentes/Barra'
import { Fila } from '../componentes/Fila'
import { Heroe } from '../componentes/Heroe'
import { Monto } from '../componentes/Monto'
import { useAhora } from '../hooks/useAhora'
import { useContador } from '../hooks/useContador'
import { useCicloActual } from '../hooks/usePresupuesto'
import { sinAsignar, topesSugeridos } from '../lib/analisis'
import { aFechaInput } from '../lib/fechas'
import { crearRespaldo, leerRespaldo } from '../lib/respaldo'
import type { Categoria, Ciclo, Tema } from '../lib/tipos'
import { useTienda } from '../store/tienda'
import { useUI } from '../store/ui'
import { HojaIngreso } from './HojaIngreso'
import { HojaTope } from './HojaTope'

const TEMAS: { valor: Tema; texto: string }[] = [
  { valor: 'sistema', texto: 'Sistema' },
  { valor: 'claro', texto: 'Claro' },
  { valor: 'oscuro', texto: 'Oscuro' },
]

export function Presupuesto() {
  const hoy = useAhora()
  const { ciclo } = useCicloActual()
  const t = useTienda()
  const mostrarAviso = useUI((s) => s.mostrarAviso)
  const heroeAnterior = useUI((s) => s.heroeAnterior)
  const setHeroeAnterior = useUI((s) => s.setHeroeAnterior)
  const [editandoIngreso, setEditandoIngreso] = useState<Ciclo | null>(null)
  const [topeEnEdicion, setTopeEnEdicion] = useState<Categoria | null>(null)
  const [confirmarBorrado, setConfirmarBorrado] = useState(false)
  const [respaldoPendiente, setRespaldoPendiente] = useState<ReturnType<typeof leerRespaldo>>(null)
  const entradaArchivo = useRef<HTMLInputElement>(null)

  const ingreso = ciclo?.ingresoEsperado ?? t.ajustes?.ingresoQuincenal ?? 0
  const heroe = useContador(ingreso, heroeAnterior)
  useEffect(() => setHeroeAnterior(ingreso), [ingreso, setHeroeAnterior])
  const gastosDelCiclo = ciclo ? t.gastos.filter((g) => g.cicloId === ciclo.id) : []
  const cerrados = t.ciclos.filter((c) => c.fin < hoy).map((c) => c.id)
  const sugeridos = topesSugeridos(t.gastos, cerrados, t.categorias)
  const libre = sinAsignar(ingreso, t.categorias)
  const avisoTopes = t.ajustes?.avisoTopes !== false
  const tema: Tema = t.ajustes?.tema ?? 'sistema'

  const aplicarSugeridos = async () => {
    for (const c of t.categorias) {
      const s = sugeridos[c.id]
      if (s) await t.guardarCategoria({ ...c, tope: s })
    }
    mostrarAviso('Topes actualizados con tu promedio de las últimas quincenas')
  }

  const cambiarTema = async (nuevo: Tema) => {
    await t.guardarAjustes({ tema: nuevo })
    if (nuevo === 'sistema') delete document.documentElement.dataset.tema
    else document.documentElement.dataset.tema = nuevo
  }

  const exportar = () => {
    const texto = crearRespaldo({ gastos: t.gastos, categorias: t.categorias, ciclos: t.ciclos, gastosFijos: t.gastosFijos, comprasMSI: t.comprasMSI, ajustes: t.ajustes }, hoy)
    const url = URL.createObjectURL(new Blob([texto], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `onyx-respaldo-${aFechaInput(hoy)}.json`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1_000)
    mostrarAviso('Respaldo descargado. Guárdalo donde no se pierda.')
  }

  const leerArchivo = async (archivo: File) => {
    const respaldo = leerRespaldo(await archivo.text())
    if (!respaldo) {
      mostrarAviso('Ese archivo no es un respaldo de Onyx.')
      return
    }
    setRespaldoPendiente(respaldo)
  }

  const restaurar = async () => {
    if (!respaldoPendiente) return
    await t.restaurarRespaldo(respaldoPendiente.datos)
    setRespaldoPendiente(null)
    mostrarAviso(`Restaurado: ${respaldoPendiente.datos.gastos.length} gastos`)
  }

  const borrarTodo = async () => {
    if (!confirmarBorrado) return setConfirmarBorrado(true)
    await t.borrarTodo()
    setConfirmarBorrado(false)
  }

  return (
    <div className="cascada">
      <section className="heroe-bloque">
        <p className="meta">¿Cómo lo reparto? · ingreso por quincena</p>
        <Heroe centavos={heroe} tono="ink" />
        <div className="renglones-meta" style={{ justifyContent: 'space-between' }}>
          <span>{libre >= 0 ? 'Sin asignar' : 'Asignaste de más'}: <Monto centavos={libre} /></span>
          <button type="button" className="enlace-meta" onClick={() => ciclo && setEditandoIngreso(ciclo)}>
            Editar ingreso
          </button>
        </div>
      </section>

      <section className="seccion">
        <h2 className="seccion__titulo">Topes por categoría</h2>
        {t.categorias.map((c, i) => {
          const gastado = gastosDelCiclo.filter((g) => g.categoriaId === c.id).reduce((s, g) => s + g.monto, 0)
          const parte = ingreso > 0 ? c.tope / ingreso : 0
          const excede = c.tope > 0 && gastado > c.tope
          return (
            <Fila
              key={c.id}
              indice={i}
              titulo={c.nombre}
              meta={c.tope > 0 ? `${Math.round(parte * 100)} % del ingreso · gastado ${Math.round((gastado / c.tope) * 100)} %` : gastado > 0 ? `sin tope · gastado ${Math.round(gastado / 100).toLocaleString('es-MX')} pesos` : 'sin tope'}
              monto={c.tope > 0 ? <Monto centavos={c.tope} conCentavos={false} /> : <span className="tono-muted">Poner tope</span>}
              tono={excede ? 'wine' : 'ink'}
              onClick={() => setTopeEnEdicion(c)}
              pie={c.tope > 0 ? <Barra fraccion={parte} tono={excede ? 'wine' : 'ink'} etiqueta={`Parte del ingreso para ${c.nombre}`} /> : undefined}
            />
          )
        })}
        <Fila titulo="Sin asignar" meta="Lo que sobra después de los topes" monto={<Monto centavos={libre} />} tono={libre < 0 ? 'wine' : 'green'} />
        {Object.keys(sugeridos).length > 0 && (
          <button type="button" className="enlace agregar" onClick={() => void aplicarSugeridos()}>
            Sugerir topes con tu historial
          </button>
        )}
      </section>

      <section className="seccion">
        <h2 className="seccion__titulo">Avisos</h2>
        <div className="interruptor">
          <div className="fila__texto">
            <span>Avisarme al 80 % de una categoría</span>
            <span className="fila__meta">Al guardar un gasto que la acerque a su tope</span>
          </div>
          <button type="button" role="switch" aria-checked={avisoTopes} aria-label="Avisar al 80 por ciento de una categoría" className={`palanca${avisoTopes ? ' palanca--on' : ''}`} onClick={() => void t.guardarAjustes({ avisoTopes: !avisoTopes })} />
        </div>
      </section>

      <section className="seccion">
        <h2 className="seccion__titulo">Apariencia</h2>
        <div className="segmentos" role="radiogroup" aria-label="Tema" style={{ marginTop: 12 }}>
          {TEMAS.map((o) => (
            <button key={o.valor} type="button" role="radio" aria-checked={o.valor === tema} className={`segmento${o.valor === tema ? ' segmento--on' : ''}`} onClick={() => void cambiarTema(o.valor)}>
              {o.texto}
            </button>
          ))}
        </div>
      </section>

      <section className="seccion">
        <h2 className="seccion__titulo">Tus datos</h2>
        <p className="meta" style={{ padding: '12px 0 4px' }}>Todo vive en este teléfono. Un respaldo es la única forma de pasarlo a otro.</p>
        <button type="button" className="enlace agregar" style={{ color: 'var(--ink)' }} onClick={exportar}>
          Descargar respaldo
        </button>
        <input ref={entradaArchivo} type="file" accept="application/json,.json" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) void leerArchivo(f); e.target.value = '' }} />
        <button type="button" className="enlace agregar" style={{ color: 'var(--ink)' }} onClick={() => entradaArchivo.current?.click()}>
          Restaurar desde un respaldo
        </button>
        {respaldoPendiente && (
          <div className="recurrente" role="alert">
            <p>El respaldo trae {respaldoPendiente.datos.gastos.length} gastos y {respaldoPendiente.datos.ciclos.length} quincenas. Reemplaza todo lo que hay en este teléfono, salvo las fotos.</p>
            <div className="recurrente__acciones">
              <button type="button" className="enlace" onClick={() => void restaurar()}>Reemplazar mis datos</button>
              <button type="button" className="enlace" onClick={() => setRespaldoPendiente(null)}>Cancelar</button>
            </div>
          </div>
        )}
        <button type="button" className="enlace agregar peligro" onClick={() => void borrarTodo()}>
          {confirmarBorrado ? 'Confirmar: borrar todo y empezar de cero' : 'Borrar todo'}
        </button>
      </section>

      <HojaIngreso ciclo={editandoIngreso} onCerrar={() => setEditandoIngreso(null)} />
      <HojaTope categoria={topeEnEdicion} sugerido={topeEnEdicion ? (sugeridos[topeEnEdicion.id] ?? null) : null} onCerrar={() => setTopeEnEdicion(null)} />
    </div>
  )
}
