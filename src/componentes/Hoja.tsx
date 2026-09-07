import { useEffect, useRef, type ReactNode } from 'react'

type Props = { abierta: boolean; titulo: string; onCerrar: () => void; children: ReactNode }

/** Hoja modal que sube desde abajo. Usa <dialog> nativo para el foco y la tecla Escape. */
export function Hoja({ abierta, titulo, onCerrar, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialogo = ref.current
    if (!dialogo) return
    if (abierta && !dialogo.open) dialogo.showModal()
    if (!abierta && dialogo.open) dialogo.close()
  }, [abierta])

  return (
    <dialog
      ref={ref}
      className="hoja"
      onClose={onCerrar}
      onClick={(e) => {
        if (e.target === ref.current) onCerrar()
      }}
    >
      <div className="hoja__panel">
        <header className="hoja__cabecera">
          <h2>{titulo}</h2>
          <button type="button" className="enlace" onClick={onCerrar}>
            Cerrar
          </button>
        </header>
        {abierta && children}
      </div>
    </dialog>
  )
}
