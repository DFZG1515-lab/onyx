import { necesitaInstruccionesIOS } from '../lib/instalacion'
import { estaInstalada, useEstadoPWA } from '../pwa/estado'

/** Una sola invitación a instalar. Se descarta y no vuelve. */
export function AvisoInstalacion() {
  const prompt = useEstadoPWA((s) => s.promptInstalacion)
  const descartado = useEstadoPWA((s) => s.avisoDescartado)
  const instalar = useEstadoPWA((s) => s.instalar)
  const descartar = useEstadoPWA((s) => s.descartarAviso)

  if (descartado || estaInstalada()) return null

  if (prompt) {
    return (
      <aside className="aviso">
        <p>Instálala para abrirla desde tu inicio, sin navegador.</p>
        <div className="aviso__acciones">
          <button type="button" className="enlace" onClick={() => void instalar()}>
            Instalar
          </button>
          <button type="button" className="enlace tono-muted" onClick={descartar}>
            Ahora no
          </button>
        </div>
      </aside>
    )
  }

  if (necesitaInstruccionesIOS(navigator.userAgent, false)) {
    return (
      <aside className="aviso">
        <p>Para tenerla en tu inicio: toca Compartir y luego Agregar a pantalla de inicio.</p>
        <div className="aviso__acciones">
          <button type="button" className="enlace" onClick={descartar}>
            Entendido
          </button>
        </div>
      </aside>
    )
  }

  return null
}
