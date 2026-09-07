import { useEstadoPWA } from '../pwa/estado'

/** "Sin conexión" en la cabecera solo cuando aplica, y la fila de actualización cuando hay versión nueva. */
export function IndicadorConexion() {
  const enLinea = useEstadoPWA((s) => s.enLinea)
  if (enLinea) return null
  return (
    <span className="conexion" role="status">
      Sin conexión
    </span>
  )
}

export function AvisoActualizacion() {
  const hay = useEstadoPWA((s) => s.hayActualizacion)
  const aplicar = useEstadoPWA((s) => s.aplicarActualizacion)
  if (!hay) return null
  return (
    <div className="actualizacion" role="status">
      <span>Hay una versión nueva.</span>
      <button type="button" className="enlace" onClick={aplicar}>
        Actualizar
      </button>
    </div>
  )
}
