import { useEffect, useRef, useState } from 'react'

const reducido = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Anima un número desde un valor inicial hasta el objetivo con frenado cúbico.
 * `desde` es el punto de partida en el primer render: 0 para la entrada, el héroe de la
 * pantalla anterior para que el monto viaje entre pantallas, o null para empezar ya en el objetivo.
 */
export function useContador(objetivo: number, desde: number | null, duracion = 600): number {
  const [valor, setValor] = useState(() => (desde !== null && !reducido() ? desde : objetivo))
  const anterior = useRef(valor)

  useEffect(() => {
    const inicio = anterior.current
    anterior.current = objetivo
    if (inicio === objetivo) return
    if (reducido() || duracion === 0) {
      setValor(objetivo)
      return
    }
    let marco = 0
    const t0 = performance.now()
    const paso = (t: number) => {
      const k = Math.min(1, (t - t0) / duracion)
      const e = 1 - (1 - k) ** 3
      setValor(Math.round(inicio + (objetivo - inicio) * e))
      if (k < 1) marco = requestAnimationFrame(paso)
    }
    marco = requestAnimationFrame(paso)
    return () => cancelAnimationFrame(marco)
  }, [objetivo, duracion])

  return valor
}
