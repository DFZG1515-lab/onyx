import { registerSW } from 'virtual:pwa-register'
import { useEstadoPWA } from './estado'

/** Registra el service worker y conecta los eventos del navegador con el estado de la PWA. */
export function iniciarPWA(): void {
  const actualizar = registerSW({
    immediate: true,
    onNeedRefresh() {
      useEstadoPWA.setState({ hayActualizacion: true, aplicarActualizacion: () => void actualizar(true) })
    },
  })

  window.addEventListener('online', () => useEstadoPWA.setState({ enLinea: true }))
  window.addEventListener('offline', () => useEstadoPWA.setState({ enLinea: false }))

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    useEstadoPWA.setState({ promptInstalacion: e })
  })
  window.addEventListener('appinstalled', () => useEstadoPWA.setState({ promptInstalacion: null }))
}
