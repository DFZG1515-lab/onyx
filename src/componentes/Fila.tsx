import type { ReactNode } from 'react'

export type Tono = 'ink' | 'muted' | 'green' | 'wine' | 'slate'

type Props = {
  titulo: ReactNode
  meta?: ReactNode
  monto: ReactNode
  tono?: Tono
  onClick?: () => void
  /** Contenido extra debajo del renglón, por ejemplo una barra de avance. */
  pie?: ReactNode
}

/** Un renglón de libro contable: texto a la izquierda, monto alineado a la derecha, línea de 1px abajo. */
export function Fila({ titulo, meta, monto, tono = 'ink', onClick, pie }: Props) {
  const cuerpo = (
    <>
      <div className="fila__renglon">
        <div className="fila__texto">
          <span className="fila__titulo">{titulo}</span>
          {meta !== undefined && <span className="fila__meta">{meta}</span>}
        </div>
        <span className={`fila__monto tono-${tono}`}>{monto}</span>
      </div>
      {pie}
    </>
  )
  if (onClick) {
    return (
      <button type="button" className="fila fila--boton" onClick={onClick}>
        {cuerpo}
      </button>
    )
  }
  return <div className="fila">{cuerpo}</div>
}
