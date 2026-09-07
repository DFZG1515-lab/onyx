import { useEffect, useState } from 'react'

/** La hora actual, refrescada cada minuto y al volver a la app. */
export function useAhora(): number {
  const [ahora, setAhora] = useState(() => Date.now())
  useEffect(() => {
    const refrescar = () => setAhora(Date.now())
    const intervalo = window.setInterval(refrescar, 60_000)
    document.addEventListener('visibilitychange', refrescar)
    return () => {
      window.clearInterval(intervalo)
      document.removeEventListener('visibilitychange', refrescar)
    }
  }, [])
  return ahora
}
