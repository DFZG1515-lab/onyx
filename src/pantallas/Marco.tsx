import { Outlet } from 'react-router-dom'
import { Aviso } from '../componentes/Aviso'
import { BarraNavegacion } from '../componentes/BarraNavegacion'
import { AvisoActualizacion, IndicadorConexion } from '../componentes/EstadoConexion'
import { HojaCaptura } from '../componentes/HojaCaptura'
import { useCicloActual } from '../hooks/usePresupuesto'
import { rangoDeCiclo } from '../lib/fechas'
import { useTienda } from '../store/tienda'
import { PrimerArranque } from './PrimerArranque'

/** Layout común: cabecera discreta, pantalla activa, barra inferior y hoja de captura. */
export function Marco() {
  const listo = useTienda((s) => s.listo)
  const hayAjustes = useTienda((s) => s.ajustes !== null)
  const { ciclo } = useCicloActual()

  if (!listo) return null
  if (!hayAjustes) return <PrimerArranque />

  return (
    <div className="app">
      <header className="cabecera">
        <span className="cabecera__quincena">{ciclo ? `Quincena del ${rangoDeCiclo(ciclo)}` : ''}</span>
        <IndicadorConexion />
      </header>
      <AvisoActualizacion />
      <main className="contenido">
        <Outlet />
      </main>
      <Aviso />
      <BarraNavegacion />
      <HojaCaptura />
    </div>
  )
}
