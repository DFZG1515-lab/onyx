import { useEffect } from 'react'
import { diasDelCiclo, idDeCiclo } from '../lib/ciclos'
import { calcularPresupuesto, calcularRitmo, type Presupuesto, type Ritmo } from '../lib/presupuesto'
import type { Ciclo } from '../lib/tipos'
import { useTienda } from '../store/tienda'
import { useAhora } from './useAhora'

/** El ciclo de hoy. Lo crea en cuanto hay ajustes y aún no existe. */
export function useCicloActual(): { hoy: number; ciclo: Ciclo | null } {
  const hoy = useAhora()
  const id = idDeCiclo(hoy)
  const ciclo = useTienda((s) => s.ciclos.find((c) => c.id === id)) ?? null
  const hayAjustes = useTienda((s) => s.ajustes !== null)
  const asegurarCiclo = useTienda((s) => s.asegurarCiclo)

  useEffect(() => {
    if (!ciclo && hayAjustes) void asegurarCiclo(id)
  }, [ciclo, hayAjustes, id, asegurarCiclo])

  return { hoy, ciclo }
}

export type DatosResumen = { hoy: number; ciclo: Ciclo; presupuesto: Presupuesto; ritmo: Ritmo; diasTotales: number }

export function usePresupuesto(): DatosResumen | null {
  const { hoy, ciclo } = useCicloActual()
  const gastos = useTienda((s) => s.gastos)
  const comprasMSI = useTienda((s) => s.comprasMSI)
  const gastosFijos = useTienda((s) => s.gastosFijos)
  if (!ciclo) return null
  const presupuesto = calcularPresupuesto({ ciclo, hoy, gastos, comprasMSI, gastosFijos })
  const diasTotales = diasDelCiclo(ciclo)
  // El ritmo compara solo gastos reales: lo comprometido ya está descontado del disponible.
  const ritmo = calcularRitmo({
    ingreso: presupuesto.ingreso,
    gastado: presupuesto.gastado,
    diasTranscurridos: diasTotales - presupuesto.diasRestantes + 1,
    diasTotales,
  })
  return { hoy, ciclo, presupuesto, ritmo, diasTotales }
}
