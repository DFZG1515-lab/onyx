import type { ReactNode } from 'react'

type Props = { etiqueta: string; children: ReactNode; ayuda?: string; error?: string | null }

/** Etiqueta arriba, control abajo, mensaje de ayuda o error al final. */
export function Campo({ etiqueta, children, ayuda, error }: Props) {
  return (
    <label className="campo">
      <span className="campo__etiqueta">{etiqueta}</span>
      {children}
      {error ? <span className="campo__error">{error}</span> : ayuda ? <span className="campo__ayuda">{ayuda}</span> : null}
    </label>
  )
}
