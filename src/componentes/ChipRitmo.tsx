import { useEffect, useRef, useState } from 'react'
import type { EstadoRitmo } from '../lib/presupuesto'

const TEXTO: Record<EstadoRitmo, string> = { bien: 'Vas bien', justo: 'Vas justo', excedido: 'Te pasaste' }

/** Chip de estado con fondo tenue. Pulsa cuando cambia de estado. */
export function ChipRitmo({ estado }: { estado: EstadoRitmo }) {
  const anterior = useRef(estado)
  const [pulso, setPulso] = useState(false)

  useEffect(() => {
    if (anterior.current === estado) return
    anterior.current = estado
    setPulso(true)
    const t = window.setTimeout(() => setPulso(false), 400)
    return () => window.clearTimeout(t)
  }, [estado])

  return <span className={`chip-estado chip-estado--${estado}${pulso ? ' chip-estado--pulso' : ''}`}>{TEXTO[estado]}</span>
}
