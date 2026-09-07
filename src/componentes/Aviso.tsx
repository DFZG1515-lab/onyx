import { useEffect } from 'react'
import { useUI } from '../store/ui'

/** Confirmación breve sobre la barra de navegación. Desaparece sola. */
export function Aviso() {
  const aviso = useUI((s) => s.aviso)
  const ocultar = useUI((s) => s.ocultarAviso)

  useEffect(() => {
    if (!aviso) return
    const t = window.setTimeout(ocultar, 2_500)
    return () => window.clearTimeout(t)
  }, [aviso, ocultar])

  if (!aviso) return null
  return (
    <div className="aviso-breve" role="status">
      {aviso}
    </div>
  )
}
