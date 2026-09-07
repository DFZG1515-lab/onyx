import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Barra } from '../componentes/Barra'
import { Fila } from '../componentes/Fila'
import { Monto } from '../componentes/Monto'
import { Vacio } from '../componentes/Vacio'
import { usePresupuesto } from '../hooks/usePresupuesto'
import { idDeCiclo } from '../lib/ciclos'
import { pesos } from '../lib/dinero'
import { fechaCorta, rangoDeCiclo } from '../lib/fechas'
import { interpretar } from '../lib/parser'
import { gastoPorCategoria } from '../lib/presupuesto'
import type { Ciclo, GastoFijo } from '../lib/tipos'
import { RUTAS } from '../rutas'
import { useTienda } from '../store/tienda'
import { HojaFijo } from './HojaFijo'
import { HojaIngreso } from './HojaIngreso'

export function Resumen() {
  const datos = usePresupuesto()
  const gastos = useTienda((s) => s.gastos)
  const categorias = useTienda((s) => s.categorias)
  const comprasMSI = useTienda((s) => s.comprasMSI)
  const gastosFijos = useTienda((s) => s.gastosFijos)
  const agregarGasto = useTienda((s) => s.agregarGasto)
  const actualizarFijo = useTienda((s) => s.actualizarFijo)

  const [fijoEnEdicion, setFijoEnEdicion] = useState<GastoFijo | 'nuevo' | null>(null)
  const [editandoIngreso, setEditandoIngreso] = useState<Ciclo | null>(null)

  if (!datos) return null
  const { ciclo, hoy, presupuesto: p } = datos

  const delCiclo = gastos.filter((g) => g.cicloId === ciclo.id)
  const porCategoria = gastoPorCategoria(delCiclo)
  const nombreDe = (id: string) => categorias.find((c) => c.id === id)?.nombre ?? id
  const topeDe = (id: string) => categorias.find((c) => c.id === id)?.tope ?? 0
  const dias = p.diasRestantes === 1 ? '1 día' : `${p.diasRestantes} días`

  const estadoDeFijo = (f: GastoFijo): { texto: string; pendiente: boolean } => {
    if (!f.activo) return { texto: 'Pausado', pendiente: false }
    if (f.ultimoPago === ciclo.id) return { texto: 'Pagado esta quincena', pendiente: false }
    const inicio = new Date(ciclo.inicio)
    const ultimoDia = new Date(inicio.getFullYear(), inicio.getMonth() + 1, 0).getDate()
    const dia = Math.min(f.diaDelMes, ultimoDia)
    const cobro = new Date(inicio.getFullYear(), inicio.getMonth(), dia).getTime()
    if (cobro < ciclo.inicio || cobro > ciclo.fin) return { texto: `Se cobra el ${dia}, en la otra quincena`, pendiente: false }
    if (new Date(hoy).getDate() > dia) return { texto: `Se cobró el ${dia}`, pendiente: false }
    return { texto: `Se cobra el ${dia}`, pendiente: true }
  }

  const marcarPagado = async (f: GastoFijo) => {
    const categoriaId = interpretar(`${f.descripcion} 1`, categorias)?.categoriaId ?? 'casa'
    await agregarGasto({ descripcion: f.descripcion, monto: f.monto, categoriaId, metodo: 'transferencia', fecha: hoy, cicloId: idDeCiclo(hoy) })
    await actualizarFijo(f.id, { ultimoPago: ciclo.id })
  }

  return (
    <>
      <section className="heroe-bloque">
        <p className="meta">{p.excedido ? 'Te pasaste' : 'Te quedan por día'}</p>
        <Monto className={`heroe ${p.excedido ? 'tono-wine' : 'tono-green'}`} centavos={p.excedido ? -p.disponible : p.porDia} conCentavos={false} />
        <p className="meta">
          {p.excedido
            ? `Quincena del ${rangoDeCiclo(ciclo)}. Lo comprometido ya está descontado.`
            : `${pesos(p.disponible)} libres hasta el ${fechaCorta(ciclo.fin)} · ${dias}`}
        </p>
        <Barra fraccion={p.ingreso > 0 ? (p.gastado + p.comprometido) / p.ingreso : 1} tono={p.excedido ? 'wine' : 'ink'} etiqueta="Parte del ingreso ya usada o comprometida" />
        <div className="renglones-meta">
          <span>Gastado {pesos(p.gastado)}</span>
          <span>Comprometido {pesos(p.comprometido)}</span>
          <button type="button" className="enlace-meta" onClick={() => setEditandoIngreso(ciclo)}>
            Ingreso {pesos(p.ingreso)}
          </button>
        </div>
      </section>

      <section className="seccion">
        <h2 className="seccion__titulo">Gastado por categoría</h2>
        {porCategoria.length === 0 ? (
          <Vacio texto="Todavía no hay gastos en esta quincena. Escribe el primero abajo." />
        ) : (
          porCategoria.map((fila) => {
            const tope = topeDe(fila.categoriaId)
            const excedeTope = tope > 0 && fila.total > tope
            return (
              <Fila
                key={fila.categoriaId}
                titulo={nombreDe(fila.categoriaId)}
                meta={tope > 0 ? `Tope ${pesos(tope, { centavos: false })}` : undefined}
                monto={<Monto centavos={fila.total} />}
                tono={excedeTope ? 'wine' : 'ink'}
              />
            )
          })
        )}
      </section>

      <section className="seccion">
        <h2 className="seccion__titulo">Comprometido en esta quincena</h2>
        <Link to={RUTAS.msi} className="fila fila--boton">
          <div className="fila__renglon">
            <div className="fila__texto">
              <span className="fila__titulo">Meses sin intereses</span>
              <span className="fila__meta">{comprasMSI.length === 0 ? 'Sin compras a meses' : comprasMSI.length === 1 ? '1 compra' : `${comprasMSI.length} compras`}</span>
            </div>
            <Monto className="fila__monto tono-slate" centavos={p.msi} />
          </div>
        </Link>
        {gastosFijos.map((f) => {
          const estado = estadoDeFijo(f)
          return (
            <div key={f.id} className="fila fila--con-accion">
              <button type="button" className="fila__cuerpo" onClick={() => setFijoEnEdicion(f)}>
                <div className="fila__texto">
                  <span className="fila__titulo">{f.descripcion}</span>
                  <span className="fila__meta">{estado.texto}</span>
                </div>
                <Monto className={`fila__monto ${estado.pendiente ? 'tono-slate' : 'tono-muted'}`} centavos={f.monto} />
              </button>
              {estado.pendiente && (
                <button type="button" className="enlace fila__accion" onClick={() => void marcarPagado(f)}>
                  Ya lo pagué
                </button>
              )}
            </div>
          )
        })}
        <button type="button" className="enlace agregar" onClick={() => setFijoEnEdicion('nuevo')}>
          Agregar gasto fijo
        </button>
      </section>

      <HojaFijo fijo={fijoEnEdicion} onCerrar={() => setFijoEnEdicion(null)} />
      <HojaIngreso ciclo={editandoIngreso} onCerrar={() => setEditandoIngreso(null)} />
    </>
  )
}
