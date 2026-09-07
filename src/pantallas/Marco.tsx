import { Outlet } from 'react-router-dom'

/** Layout común: contenido de la pantalla activa y, en la fase 3, la captura fija abajo. */
export function Marco() {
  return (
    <main>
      <Outlet />
    </main>
  )
}
