import { detectarRecurrente, gastoPorDia, historialDeCiclos, type Recurrente } from '../../lib/analisis'
import { diaCalendario } from '../../lib/ciclos'
import { normalizar } from '../../lib/parser'
import { gastoPorCategoria, type EstadoRitmo } from '../../lib/presupuesto'
import type { Gasto, GastoFijo } from '../../lib/tipos'
import { usePresupuesto, type DatosResumen } from '../../hooks/usePresupuesto'
import { useTienda } from '../../store/tienda'
import type { Tono } from '../../componentes/Fila'

export const TONO_RITMO: Record<EstadoRitmo, Tono> = { bien: 'green', justo: 'amber', excedido: 'wine' }

export type EstadoFijo = { texto: string; pendiente: boolean }

/** Todo lo que el Resumen calcula, separado de lo que dibuja. */
export function useResumen() {
  const datos = usePresupuesto()
  const gastos = useTienda((s) => s.gastos)
  const categorias = useTienda((s) => s.categorias)
  const comprasMSI = useTienda((s) => s.comprasMSI)
  const gastosFijos = useTienda((s) => s.gastosFijos)
  const ciclos = useTienda((s) => s.ciclos)
  const ingresos = useTienda((s) => s.ingresos)
  const deudas = useTienda((s) => s.deudas)
  const ajustes = useTienda((s) => s.ajustes)

  const nombreDe = (id: string) => categorias.find((c) => c.id === id)?.nombre ?? id
  const topeDe = (id: string) => categorias.find((c) => c.id === id)?.tope ?? 0

  if (!datos) return null
  const { ciclo, hoy, presupuesto: p, ritmo } = datos as DatosResumen

  const delCiclo = gastos.filter((g) => g.cicloId === ciclo.id)
  const porCategoria = gastoPorCategoria(delCiclo)
  const tonoHeroe: Tono = p.excedido ? 'wine' : TONO_RITMO[ritmo.estado]
  const cifraHeroe = p.excedido ? -p.disponible : p.porDia

  const inicio = new Date(ciclo.inicio)
  const ultimoDia = new Date(inicio.getFullYear(), inicio.getMonth() + 1, 0).getDate()
  const diaDeCobro = (f: GastoFijo) => new Date(inicio.getFullYear(), inicio.getMonth(), Math.min(f.diaDelMes, ultimoDia)).getTime()

  const estadoDeFijo = (f: GastoFijo): EstadoFijo => {
    if (!f.activo) return { texto: 'Pausado', pendiente: false }
    if (f.ultimoPago === ciclo.id) return { texto: 'Pagado esta quincena', pendiente: false }
    const cobro = diaDeCobro(f)
    const dia = new Date(cobro).getDate()
    if (cobro < ciclo.inicio || cobro > ciclo.fin) return { texto: `Se cobra el ${dia}, en la otra quincena`, pendiente: false }
    if (new Date(hoy).getDate() > dia) return { texto: `Se cobró el ${dia}`, pendiente: false }
    return { texto: `Se cobra el ${dia}`, pendiente: true }
  }

  const fijosPendientesN = gastosFijos.filter((f) => estadoDeFijo(f).pendiente).length
  const porDia = gastoPorDia(gastos, ciclo)
  const indiceHoy = hoy > ciclo.fin ? -1 : diaCalendario(hoy) - diaCalendario(ciclo.inicio)
  const diasFijos = new Set(
    gastosFijos
      .filter((f) => f.activo)
      .map(diaDeCobro)
      .filter((ms) => ms >= ciclo.inicio && ms <= ciclo.fin)
      .map((ms) => diaCalendario(ms) - diaCalendario(ciclo.inicio)),
  )
  const historial = historialDeCiclos(ciclos, gastos, comprasMSI, hoy, ingresos)
  const deudasPendientes = deudas.filter((d) => !d.cobrada).sort((a, b) => b.fecha - a.fecha)

  // Recurrente: la primera descripción de esta quincena que se repite tres quincenas seguidas.
  const ignorados = new Set(ajustes?.recurrentesIgnorados ?? [])
  const fijosClaves = new Set(gastosFijos.map((f) => normalizar(f.descripcion.trim())))
  const vistos = new Set<string>()
  let recurrente: Recurrente | null = null
  let gastoRecurrente: Gasto | null = null
  for (const g of [...delCiclo].sort((a, b) => b.fecha - a.fecha)) {
    const clave = normalizar(g.descripcion.trim())
    if (!clave || vistos.has(clave) || ignorados.has(clave) || fijosClaves.has(clave)) continue
    vistos.add(clave)
    const r = detectarRecurrente(gastos, g.descripcion, ciclo.id)
    if (r) {
      recurrente = r
      gastoRecurrente = g
      break
    }
  }

  return {
    ciclo, hoy, p, ritmo, diasTotales: datos.diasTotales,
    delCiclo, porCategoria, tonoHeroe, cifraHeroe,
    estadoDeFijo, fijosPendientesN, porDia, indiceHoy, diasFijos,
    historial, deudasPendientes, recurrente, gastoRecurrente, ignorados,
    categorias, comprasMSI, gastosFijos, nombreDe, topeDe,
  }
}

export type Resumen = NonNullable<ReturnType<typeof useResumen>>
