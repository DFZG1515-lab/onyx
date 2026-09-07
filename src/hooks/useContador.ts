import { useEffect, useRef, useState } from 'react'

const reducido = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Anima un número desde su valor anterior hasta el nuevo con frenado cúbico.
 * `desdeCero` arranca la primera vez desde 0 (animación de entrada).
 */
export function useContador(objetivo: number, desdeCero: boolean, duracion = 600): number {
  const [valor, setValor] = useState(() => (desdeCero && !reducido() ? 0 : objetivo))
  const anterior = useRef(valor)

  useEffect(() => {
    const desde = anterior.current
    anterior.current = objetivo
    if (desde === objetivo) return
    if (reducido() || duracion === 0) {
      setValor(objetivo)
      return
    }
    let marco = 0
    const inicio = performance.now()
    const paso = (t: number) => {
      const k = Math.min(1, (t - inicio) / duracion)
      const e = 1 - (1 - k) ** 3
      setValor(Math.round(desde + (objetivo - desde) * e))
      if (k < 1) marco = requestAnimationFrame(paso)
    }
    marco = requestAnimationFrame(paso)
    return () => cancelAnimationFrame(marco)
  }, [objetivo, duracion])

  return valor
}
