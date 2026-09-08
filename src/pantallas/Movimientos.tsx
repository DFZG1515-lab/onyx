import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { FilaDeslizable } from '../componentes/FilaDeslizable'
import { IconoBote } from '../componentes/Iconos'
import { Monto } from '../componentes/Monto'
import { Vacio } from '../componentes/Vacio'
import { useAhora } from '../hooks/useAhora'
import { diaCalendario } from '../lib/ciclos'
import { pesos } from '../lib/dinero'
import { diaYMes, etiquetaDia, fechaCorta } from '../lib/fechas'
import { normalizar } from '../lib/parser'
import type { Gasto, Metodo } from '../lib/tipos'
import { useTienda } from '../store/tienda'
import { useUI } from '../store/ui'
import { HojaGasto } from './HojaGasto'

type FiltroMetodo = 'todo' | Metodo
const FILTROS: { valor: FiltroMetodo; texto: string }[] = [
  { valor: 'todo', texto: 'Todo' },
  { valor: 'efectivo', texto: 'Efectivo' },
  { valor: 'tarjeta', texto: 'Tarjeta' },
  { valor: 'transferencia', texto: 'Transferencia' },
]
const ESPERA_BORRADO = 5_000

export function Movimientos() {
  const hoy = useAhora()
  const gastos = useTienda((s) => s.gastos)
  const categorias = useTienda((s) => s.categorias)
  const borrarGasto = useTienda((s) => s.borrarGasto)
  const mostrarAviso = useUI((s) => s.mostrarAviso)
  const filtroDia = useUI((s) => s.filtroDia)
  const setFiltroDia = useUI((s) => s.setFiltroDia)

  const [busqueda, setBusqueda] = useState('')
  const [busquedaLista, setBusquedaLista] = useState('')
  const [metodo, setMetodo] = useState<FiltroMetodo>('todo')
  const [enEdicion, setEnEdicion] = useState<Gasto | null>(null)
  const [ocultos, setOcultos] = useState<Set<string>>(new Set())
  const pendientes = useRef(new Map<string, number>())

  useEffect(() => {
    const t = window.setTimeout(() => setBusquedaLista(busqueda.trim()), 200)
    return () => window.clearTimeout(t)
  }, [busqueda])

  // Si el usuario se va de la pantalla con borrados pendientes, se ejecutan de inmediato.
  useEffect(
    () => () => {
      for (const [id, t] of pendientes.current) {
        window.clearTimeout(t)
        void borrarGasto(id)
      }
      pendientes.current.clear()
    },
    [borrarGasto],
  )

  const nombreDe = (id: string) => categorias.find((c) => c.id === id)?.nombre ?? id
  const hora = (ms: number) => new Date(ms).toTimeString().slice(0, 5)
  const texto = normalizar(busquedaLista)

  const visibles = gastos
    .filter((g) => !ocultos.has(g.id))
    .filter((g) => metodo === 'todo' || g.metodo === metodo)
    .filter((g) => filtroDia === null || diaCalendario(g.fecha) === diaCalendario(filtroDia))
    .filter((g) => !texto || normalizar(g.descripcion).includes(texto) || normalizar(nombreDe(g.categoriaId)).includes(texto))
    .sort((a, b) => b.fecha - a.fecha)

  const porDia = new Map<number, Gasto[]>()
  for (const g of visibles) {
    const dia = diaCalendario(g.fecha)
    porDia.set(dia, [...(porDia.get(dia) ?? []), g])
  }

  const borrarConDeshacer = (g: Gasto) => {
    setOcultos((s) => new Set(s).add(g.id))
    const t = window.setTimeout(() => {
      pendientes.current.delete(g.id)
      void borrarGasto(g.id).then(() => setOcultos((s) => { const n = new Set(s); n.delete(g.id); return n }))
    }, ESPERA_BORRADO)
    pendientes.current.set(g.id, t)
    mostrarAviso(`Borrado: ${g.descripcion} ${pesos(g.monto)}`, {
      texto: 'Deshacer',
      alHacer: () => {
        window.clearTimeout(t)
        pendientes.current.delete(g.id)
        setOcultos((s) => { const n = new Set(s); n.delete(g.id); return n })
      },
    })
  }

  const hayFiltros = texto || metodo !== 'todo' || filtroDia !== null
  const vacio = gastos.length === 0
    ? 'Toca el botón de abajo y registra tu primer gasto. Empieza por cuánto fue y dónde.'
    : texto
      ? `Nada con "${busquedaLista}". Prueba con el nombre del lugar, como oxxo o uber${metodo !== 'todo' ? ', o quita el filtro de método' : ''}.`
      : 'Nada con estos filtros. Prueba con otro método o quita el filtro del día.'

  return (
    <div className="cascada">
      <p className="pregunta meta">¿En qué se fue?</p>
      <div className="buscador">
        <input className="entrada" type="search" inputMode="search" placeholder="Buscar: oxxo, uber, tacos…" aria-label="Buscar movimientos" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
      </div>
      <div className="filtros" role="group" aria-label="Filtrar por método de pago">
        {FILTROS.map((f) => (
          <button key={f.valor} type="button" className={f.valor === metodo ? 'filtro filtro--activo' : 'filtro'} aria-pressed={f.valor === metodo} onClick={() => setMetodo(f.valor)}>
            {f.texto}
          </button>
        ))}
      </div>
      {filtroDia !== null && (
        <div className="filtro-dia">
          <span>Solo el {fechaCorta(filtroDia)}</span>
          <button type="button" className="enlace-meta" onClick={() => setFiltroDia(null)}>
            Quitar filtro
          </button>
        </div>
      )}

      {visibles.length === 0 ? (
        <Vacio texto={hayFiltros || vacio ? vacio : ''} />
      ) : (
        [...porDia.entries()].map(([dia, lista]) => (
          <section key={dia} className="dia dia--columnas">
            <div className="dia__fecha">
              <span className="dia__nombre">{etiquetaDia(lista[0]?.fecha ?? hoy, hoy).split(' ')[0]}</span>
              <span>{diaYMes(lista[0]?.fecha ?? hoy)}</span>
              <Monto className="dia__subtotal" centavos={lista.reduce((s, g) => s + g.monto, 0)} conCentavos={false} />
            </div>
            <div className="dia__filas">
            {lista.map((g, i) => (
              <FilaDeslizable
                key={g.id}
                ancho={80}
                claseAcciones="deslizable__acciones--borrar"
                onTocar={() => setEnEdicion(g)}
                acciones={
                  <button type="button" className="accion-borrar" aria-label={`Borrar ${g.descripcion}`} onClick={() => borrarConDeshacer(g)}>
                    <IconoBote />
                  </button>
                }
              >
                <div className="fila movimiento" style={{ '--i': i } as CSSProperties}>
                  <div className="fila__renglon">
                    <div className="fila__texto">
                      <span className="fila__titulo">{g.descripcion}</span>
                      <span className="fila__meta">
                        {nombreDe(g.categoriaId)} · {g.metodo} · {hora(g.fecha)}{g.fotoId ? ' · ticket' : ''}
                      </span>
                    </div>
                    <Monto className={`fila__monto${g.metodo === 'efectivo' ? '' : ' tono-muted'}`} centavos={g.monto} />
                  </div>
                </div>
              </FilaDeslizable>
            ))}
            </div>
          </section>
        ))
      )}

      <HojaGasto gasto={enEdicion} onCerrar={() => setEnEdicion(null)} />
    </div>
  )
}
