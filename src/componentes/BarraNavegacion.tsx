import { NavLink } from 'react-router-dom'
import { RUTAS } from '../rutas'
import { useUI } from '../store/ui'
import { IconoAjustes, IconoCalendarioRepetir, IconoGraficaCircular, IconoLista, IconoMas } from './Iconos'

const clase = ({ isActive }: { isActive: boolean }) => (isActive ? 'nav__destino nav__destino--activo' : 'nav__destino')

/** Barra fija abajo, al alcance del pulgar. Solo íconos; el centro abre la captura. */
export function BarraNavegacion({ oculta = false }: { oculta?: boolean }) {
  const abrirCaptura = useUI((s) => s.abrirCaptura)
  return (
    <nav className={`nav${oculta ? ' nav--oculta' : ''}`} aria-label="Secciones">
      <NavLink to={RUTAS.resumen} end className={clase} aria-label="Resumen">
        <IconoGraficaCircular />
      </NavLink>
      <NavLink to={RUTAS.movimientos} className={clase} aria-label="Movimientos">
        <IconoLista />
      </NavLink>
      <button type="button" className="nav__centro" aria-label="Nuevo gasto" onClick={abrirCaptura}>
        <IconoMas />
      </button>
      <NavLink to={RUTAS.msi} className={clase} aria-label="Meses sin intereses">
        <IconoCalendarioRepetir />
      </NavLink>
      <NavLink to={RUTAS.presupuesto} className={clase} aria-label="Presupuesto">
        <IconoAjustes />
      </NavLink>
    </nav>
  )
}
