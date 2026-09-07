import type { CSSProperties, ReactNode } from 'react'

export type Tono = 'ink' | 'muted' | 'green' | 'wine' | 'slate' | 'amber'

type Props = {
  titulo: ReactNode
  meta?: ReactNode
  monto: ReactNode
  tono?: Tono
  onClick?: () => void
  /** Contenido extra debajo del renglón, por ejemplo una barra de avance. */
  pie?: ReactNode
  /** Posición en la lista, para la animación en cascada. */
  indice?: number
}

/** Un renglón de libro contable: texto a la izquierda, monto alineado a la derecha, línea de 1px abajo. */
export function Fila({ titulo, meta, monto, tono = 'ink', onClick, pie, indice }: Props) {
  const estilo = indice === undefined ? undefined : ({ '--i': indice } as CSSProperties)
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
      <button type="button" className="fila fila--boton" style={estilo} onClick={onClick}>
        {cuerpo}
      </button>
    )
  }
  return (
    <div className="fila" style={estilo}>
      {cuerpo}
    </div>
  )
}
