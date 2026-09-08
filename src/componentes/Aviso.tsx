import { useEffect } from 'react'
import { useUI } from '../store/ui'

/** Confirmación breve sobre la barra. Con acción, dura 5 segundos y muestra el cronómetro. */
export function Aviso() {
  const aviso = useUI((s) => s.aviso)
  const ocultar = useUI((s) => s.ocultarAviso)

  useEffect(() => {
    if (!aviso) return
    const t = window.setTimeout(ocultar, aviso.duracion)
    return () => window.clearTimeout(t)
  }, [aviso, ocultar])

  if (!aviso) return null
  return (
    <div className="aviso-breve" role="status">
      <span>{aviso.texto}</span>
      {aviso.accion && (
        <>
          <button
            type="button"
            className="aviso-breve__accion"
            onClick={() => {
              aviso.accion?.alHacer()
              ocultar()
            }}
          >
            {aviso.accion.texto}
          </button>
          <i className="aviso-breve__cronometro" aria-hidden="true" />
        </>
      )}
    </div>
  )
}
