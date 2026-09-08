import { useEffect, useState } from 'react'
import type { Tono } from './Fila'

type Props = {
  /** Fracciones de 0 a 1. Se dibujan en orden: primero comprometido, luego gastado. */
  comprometido: number
  gastado: number
  etiqueta: string
  animar: boolean
  /** Color del tramo gastado: el mismo del chip de ritmo. */
  tono: Tono
}

const RADIO = 30
const LARGO = 2 * Math.PI * RADIO

/** Anillo de uso del ingreso: comprometido en gris, gastado en el color del ritmo, resto en regla. */
export function Anillo({ comprometido, gastado, etiqueta, animar, tono }: Props) {
  const [listo, setListo] = useState(!animar)
  useEffect(() => {
    if (!animar) return
    const marco = requestAnimationFrame(() => setListo(true))
    return () => cancelAnimationFrame(marco)
  }, [animar])

  const recorta = (f: number) => Math.max(0, Math.min(1, f))
  const c = listo ? recorta(comprometido) * LARGO : 0
  const g = listo ? recorta(gastado) * LARGO : 0
  const porcentaje = Math.round(recorta(comprometido + gastado) * 100)

  return (
    <svg className="anillo" width="84" height="84" viewBox="0 0 84 84" role="img" aria-label={`${etiqueta}: ${porcentaje} por ciento`}>
      <circle cx="42" cy="42" r={RADIO} fill="none" stroke="var(--rule)" strokeWidth="6" />
      <circle cx="42" cy="42" r={RADIO} fill="none" stroke="var(--muted)" strokeWidth="6" strokeDasharray={`${c} ${LARGO}`} transform="rotate(-90 42 42)" />
      <circle cx="42" cy="42" r={RADIO} fill="none" stroke={`var(--${tono})`} strokeWidth="6" strokeDasharray={`${g} ${LARGO}`} strokeDashoffset={-c} transform="rotate(-90 42 42)" />
      <text x="42" y="46" textAnchor="middle" className="anillo__texto">
        {porcentaje} %
      </text>
    </svg>
  )
}
