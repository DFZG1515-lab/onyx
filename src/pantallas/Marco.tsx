import { NavLink, Outlet } from 'react-router-dom'
import { Captura } from '../componentes/Captura'
import { useCicloActual } from '../hooks/usePresupuesto'
import { RUTAS } from '../rutas'
import { useTienda } from '../store/tienda'
import { PrimerArranque } from './PrimerArranque'

const clasePestana = ({ isActive }: { isActive: boolean }) => (isActive ? 'pestana pestana--activa' : 'pestana')

/** Layout común: pestañas arriba, pantalla activa en medio, captura fija abajo. */
export function Marco() {
  const listo = useTienda((s) => s.listo)
  const hayAjustes = useTienda((s) => s.ajustes !== null)
  useCicloActual()

  if (!listo) return null
  if (!hayAjustes) return <PrimerArranque />

  return (
    <div className="app">
      <nav className="pestanas" aria-label="Secciones">
        <NavLink to={RUTAS.resumen} end className={clasePestana}>
          Resumen
        </NavLink>
        <NavLink to={RUTAS.movimientos} className={clasePestana}>
          Movimientos
        </NavLink>
        <NavLink to={RUTAS.msi} className={clasePestana}>
          Meses sin intereses
        </NavLink>
      </nav>
      <main className="contenido">
        <Outlet />
      </main>
      <Captura />
    </div>
  )
}
