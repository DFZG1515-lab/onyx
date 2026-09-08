import { useEffect, useState } from 'react'
import { FilaDeslizable } from '../componentes/FilaDeslizable'
import { Monto } from '../componentes/Monto'
import { Vacio } from '../componentes/Vacio'
import { useAhora } from '../hooks/useAhora'
import { diaCalendario } from '../lib/ciclos'
import { etiquetaDia } from '../lib/fechas'
import type { Gasto } from '../lib/tipos'
import { useTienda } from '../store/tienda'
import { HojaGasto } from './HojaGasto'

export function Movimientos() {
  const hoy = useAhora()
  const gastos = useTienda((s) => s.gastos)
  const categorias = useTienda((s) => s.categorias)
  const borrarGasto = useTienda((s) => s.borrarGasto)

  const [filtro, setFiltro] = useState<string | null>(null)
  const [enEdicion, setEnEdicion] = useState<Gasto | null>(null)
  const [confirmandoId, setConfirmandoId] = useState<string | null>(null)

  useEffect(() => {
    if (!confirmandoId) return
    const t = window.setTimeout(() => setConfirmandoId(null), 3_000)
    return () => window.clearTimeout(t)
  }, [confirmandoId])

  const nombreDe = (id: string) => categorias.find((c) => c.id === id)?.nombre ?? id
  const conGasto = categorias.filter((c) => gastos.some((g) => g.categoriaId === c.id))
  const visibles = [...gastos].filter((g) => !filtro || g.categoriaId === filtro).sort((a, b) => b.fecha - a.fecha)

  const porDia = new Map<number, Gasto[]>()
  for (const g of visibles) {
    const dia = diaCalendario(g.fecha)
    porDia.set(dia, [...(porDia.get(dia) ?? []), g])
  }

  const borrar = async (g: Gasto) => {
    if (confirmandoId !== g.id) return setConfirmandoId(g.id)
    setConfirmandoId(null)
    await borrarGasto(g.id)
  }

  return (
    <>
      {conGasto.length > 1 && (
        <div className="filtros" role="group" aria-label="Filtrar por categoría">
          <button type="button" className={filtro === null ? 'filtro filtro--activo' : 'filtro'} onClick={() => setFiltro(null)}>
            Todo
          </button>
          {conGasto.map((c) => (
            <button key={c.id} type="button" className={filtro === c.id ? 'filtro filtro--activo' : 'filtro'} onClick={() => setFiltro(filtro === c.id ? null : c.id)}>
              {c.nombre}
            </button>
          ))}
        </div>
      )}

      {visibles.length === 0 ? (
        <Vacio texto={gastos.length === 0 ? 'Sin movimientos todavía. Tu primer gasto aparece aquí en cuanto lo guardes.' : 'Nada en esta categoría todavía.'} />
      ) : (
        [...porDia.entries()].map(([dia, lista]) => (
          <section key={dia} className="dia">
            <header className="dia__cabecera">
              <span>{etiquetaDia(lista[0]?.fecha ?? hoy, hoy)}</span>
              <Monto centavos={lista.reduce((s, g) => s + g.monto, 0)} />
            </header>
            {lista.map((g) => (
              <FilaDeslizable
                key={g.id}
                onTocar={() => setEnEdicion(g)}
                acciones={
                  <>
                    <button type="button" className="accion" onClick={() => setEnEdicion(g)}>
                      Editar
                    </button>
                    <button type="button" className="accion accion--borrar" onClick={() => void borrar(g)}>
                      {confirmandoId === g.id ? '¿Seguro?' : 'Borrar'}
                    </button>
                  </>
                }
              >
                <div className="fila">
                  <div className="fila__renglon">
                    <div className="fila__texto">
                      <span className="fila__titulo">{g.descripcion}</span>
                      <span className="fila__meta">
                        {nombreDe(g.categoriaId)} · {g.metodo}{g.fotoId ? ' · ticket' : ''}
                      </span>
                    </div>
                    <Monto className="fila__monto" centavos={g.monto} />
                  </div>
                </div>
              </FilaDeslizable>
            ))}
          </section>
        ))
      )}

      <HojaGasto gasto={enEdicion} onCerrar={() => setEnEdicion(null)} />
    </>
  )
}
