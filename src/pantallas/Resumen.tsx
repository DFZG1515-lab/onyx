import { useEffect, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { Anillo } from '../componentes/Anillo'
import { AvisoInstalacion } from '../componentes/AvisoInstalacion'
import { Barra } from '../componentes/Barra'
import { ChipRitmo } from '../componentes/ChipRitmo'
import { Fila, type Tono } from '../componentes/Fila'
import { Heroe } from '../componentes/Heroe'
import { Monto } from '../componentes/Monto'
import { Vacio } from '../componentes/Vacio'
import { useContador } from '../hooks/useContador'
import { usePresupuesto } from '../hooks/usePresupuesto'
import { idDeCiclo } from '../lib/ciclos'
import { pesos } from '../lib/dinero'
import { fechaCorta } from '../lib/fechas'
import { interpretar } from '../lib/parser'
import { gastoPorCategoria, type EstadoRitmo } from '../lib/presupuesto'
import type { Ciclo, GastoFijo } from '../lib/tipos'
import { RUTAS } from '../rutas'
import { useTienda } from '../store/tienda'
import { useUI } from '../store/ui'
import { HojaFijo } from './HojaFijo'
import { HojaIngreso } from './HojaIngreso'

const TONO_RITMO: Record<EstadoRitmo, Tono> = { bien: 'green', justo: 'amber', excedido: 'wine' }

export function Resumen() {
  const datos = usePresupuesto()
  const gastos = useTienda((s) => s.gastos)
  const categorias = useTienda((s) => s.categorias)
  const comprasMSI = useTienda((s) => s.comprasMSI)
  const gastosFijos = useTienda((s) => s.gastosFijos)
  const agregarGasto = useTienda((s) => s.agregarGasto)
  const actualizarFijo = useTienda((s) => s.actualizarFijo)
  const entradaHecha = useUI((s) => s.entradaHecha)
  const marcarEntrada = useUI((s) => s.marcarEntrada)

  // La entrada se anima una sola vez por sesión; después todo responde solo a acciones.
  const [animarEntrada] = useState(() => !entradaHecha)
  useEffect(() => {
    if (!entradaHecha) marcarEntrada()
  }, [entradaHecha, marcarEntrada])

  const [fijoEnEdicion, setFijoEnEdicion] = useState<GastoFijo | 'nuevo' | null>(null)
  const [editandoIngreso, setEditandoIngreso] = useState<Ciclo | null>(null)

  const cifraHeroe = datos ? (datos.presupuesto.excedido ? -datos.presupuesto.disponible : datos.presupuesto.porDia) : 0
  const heroeAnimado = useContador(cifraHeroe, animarEntrada)

  if (!datos) return null
  const { ciclo, hoy, presupuesto: p, ritmo } = datos

  const delCiclo = gastos.filter((g) => g.cicloId === ciclo.id)
  const porCategoria = gastoPorCategoria(delCiclo)
  const nombreDe = (id: string) => categorias.find((c) => c.id === id)?.nombre ?? id
  const topeDe = (id: string) => categorias.find((c) => c.id === id)?.tope ?? 0
  const dias = p.diasRestantes === 1 ? '1 día' : `${p.diasRestantes} días`
  const tonoHeroe: Tono = p.excedido ? 'wine' : TONO_RITMO[ritmo.estado]
  const porcentaje = (parte: number) => (p.ingreso > 0 ? Math.round((parte / p.ingreso) * 100) : 0)
  const fijosPendientesN = gastosFijos.filter((f) => estadoDeFijo(f).pendiente).length

  function estadoDeFijo(f: GastoFijo): { texto: string; pendiente: boolean } {
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

  const queComprometido = [fijosPendientesN > 0 ? (fijosPendientesN === 1 ? '1 fijo pendiente' : `${fijosPendientesN} fijos pendientes`) : null, p.msi > 0 ? 'meses sin intereses' : null]
    .filter(Boolean)
    .join(' y ')

  return (
    <div className={animarEntrada ? 'cascada' : undefined}>
      <section className="heroe-bloque">
        <p className="meta">{p.excedido ? '¿Me alcanza? · te pasaste por' : '¿Me alcanza? · te quedan por día'}</p>
        <div className="heroe-fila">
          <div>
            <Heroe centavos={heroeAnimado} tono={tonoHeroe} />
            <div className="ritmo">
              <ChipRitmo estado={p.excedido ? 'excedido' : ritmo.estado} />
              <span className="meta">
                <Monto centavos={Math.abs(ritmo.diferencia)} conCentavos={false} /> {ritmo.diferencia >= 0 ? 'abajo del ritmo' : 'arriba del ritmo'}
              </span>
            </div>
          </div>
          <Anillo comprometido={p.ingreso > 0 ? p.comprometido / p.ingreso : 0} gastado={p.ingreso > 0 ? p.gastado / p.ingreso : 1} etiqueta="Ingreso usado o comprometido" animar={animarEntrada} />
        </div>

        <div className="cifras">
          <div className="cifra">
            <span className="cifra__etiqueta">Libres</span>
            <Monto className={`cifra__valor ${p.excedido ? 'tono-wine' : 'tono-green'}`} centavos={p.disponible} />
            <span className="cifra__sub">hasta el {fechaCorta(ciclo.fin)} · {dias}</span>
          </div>
          <div className="cifra">
            <span className="cifra__etiqueta">Gastado</span>
            <Monto className="cifra__valor" centavos={p.gastado} />
            <span className="cifra__sub">{porcentaje(p.gastado)} % del ingreso</span>
          </div>
          <div className="cifra">
            <span className="cifra__etiqueta">Comprometido</span>
            <Monto className="cifra__valor tono-slate" centavos={p.comprometido} />
            <span className="cifra__sub">{queComprometido || 'nada pendiente'}</span>
          </div>
          <div className="cifra">
            <span className="cifra__etiqueta">Ritmo</span>
            <span className={`cifra__valor tono-${TONO_RITMO[ritmo.estado]}`}>
              {ritmo.diferencia < 0 ? '+' : '−'}
              <Monto centavos={Math.abs(ritmo.diferencia)} conCentavos={false} />
            </span>
            <span className="cifra__sub">{ritmo.diferencia >= 0 ? 'abajo de lo esperado' : 'arriba de lo esperado'}</span>
          </div>
        </div>
        <div className="renglones-meta">
          <span>Día {datos.diasTotales - p.diasRestantes + 1} de {datos.diasTotales}</span>
          <button type="button" className="enlace-meta" onClick={() => setEditandoIngreso(ciclo)}>
            Ingreso {pesos(p.ingreso, { centavos: false })}
          </button>
        </div>
      </section>

      <AvisoInstalacion />

      <section className="seccion">
        <h2 className="seccion__titulo">Gastado por categoría</h2>
        {porCategoria.length === 0 ? (
          <Vacio texto="Todavía no hay gastos en esta quincena. Toca el botón de abajo para escribir el primero." />
        ) : (
          porCategoria.map((fila, i) => {
            const tope = topeDe(fila.categoriaId)
            const excedeTope = tope > 0 && fila.total > tope
            const parte = p.gastado > 0 ? fila.total / p.gastado : 0
            return (
              <Fila
                key={fila.categoriaId}
                indice={i}
                titulo={nombreDe(fila.categoriaId)}
                meta={`${Math.round(parte * 100)} % del gasto${tope > 0 ? ` · tope ${pesos(tope, { centavos: false })}` : ''}`}
                monto={<Monto centavos={fila.total} />}
                tono={excedeTope ? 'wine' : 'ink'}
                pie={<Barra fraccion={parte} tono={excedeTope ? 'wine' : 'ink'} etiqueta={`Parte de ${nombreDe(fila.categoriaId)} en el gasto`} />}
              />
            )
          })
        )}
      </section>

      <section className="seccion">
        <h2 className="seccion__titulo">Comprometido en esta quincena</h2>
        <Link to={RUTAS.msi} className="fila fila--boton" style={{ '--i': 0 } as CSSProperties}>
          <div className="fila__renglon">
            <div className="fila__texto">
              <span className="fila__titulo">Meses sin intereses</span>
              <span className="fila__meta">{comprasMSI.length === 0 ? 'Sin compras a meses' : comprasMSI.length === 1 ? '1 compra' : `${comprasMSI.length} compras`}</span>
            </div>
            <Monto className="fila__monto tono-slate" centavos={p.msi} />
          </div>
        </Link>
        {gastosFijos.map((f, i) => {
          const estado = estadoDeFijo(f)
          return (
            <div key={f.id} className="fila fila--con-accion" style={{ '--i': i + 1 } as CSSProperties}>
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
    </div>
  )
}
