import type { Tono } from './Fila'

type Props = { fraccion: number; tono?: Tono; etiqueta?: string }

/** Barra de progreso de 3px. La fracción se recorta entre 0 y 1. */
export function Barra({ fraccion, tono = 'ink', etiqueta }: Props) {
  const ancho = Math.max(0, Math.min(1, fraccion)) * 100
  return (
    <div className="barra" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(ancho)} aria-label={etiqueta}>
      <div className={`barra__relleno fondo-${tono}`} style={{ width: `${ancho}%` }} />
    </div>
  )
}
