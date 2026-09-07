import { useEffect } from 'react'
import { idDeCiclo } from '../lib/ciclos'
import { calcularPresupuesto, type Presupuesto } from '../lib/presupuesto'
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

export function usePresupuesto(): { hoy: number; ciclo: Ciclo; presupuesto: Presupuesto } | null {
  const { hoy, ciclo } = useCicloActual()
  const gastos = useTienda((s) => s.gastos)
  const comprasMSI = useTienda((s) => s.comprasMSI)
  const gastosFijos = useTienda((s) => s.gastosFijos)
  if (!ciclo) return null
  return { hoy, ciclo, presupuesto: calcularPresupuesto({ ciclo, hoy, gastos, comprasMSI, gastosFijos }) }
}
