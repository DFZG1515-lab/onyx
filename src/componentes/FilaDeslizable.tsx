import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react'

const ANCHO_ACCIONES = 160
const UMBRAL = 6

type Props = { children: ReactNode; acciones: ReactNode; onTocar?: () => void }

/**
 * Deslizar a la izquierda descubre las acciones. Un toque sin arrastre dispara onTocar.
 * Solo eventos de puntero; sin librerías.
 */
export function FilaDeslizable({ children, acciones, onTocar }: Props) {
  const [dx, setDx] = useState(0)
  const [arrastrando, setArrastrando] = useState(false)
  const inicio = useRef<{ x: number; y: number; dx: number } | null>(null)
  const eje = useRef<'x' | 'y' | null>(null)
  const seMovio = useRef(false)
  const contenedor = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (dx === 0) return
    const cerrar = (e: globalThis.PointerEvent) => {
      if (!contenedor.current?.contains(e.target as Node)) setDx(0)
    }
    document.addEventListener('pointerdown', cerrar)
    return () => document.removeEventListener('pointerdown', cerrar)
  }, [dx])

  const alBajar = (e: PointerEvent<HTMLDivElement>) => {
    inicio.current = { x: e.clientX, y: e.clientY, dx }
    eje.current = null
    seMovio.current = false
  }

  const alMover = (e: PointerEvent<HTMLDivElement>) => {
    if (!inicio.current) return
    const ddx = e.clientX - inicio.current.x
    const ddy = e.clientY - inicio.current.y
    if (eje.current === null) {
      if (Math.abs(ddx) < UMBRAL && Math.abs(ddy) < UMBRAL) return
      eje.current = Math.abs(ddx) > Math.abs(ddy) ? 'x' : 'y'
      if (eje.current === 'x') {
        e.currentTarget.setPointerCapture(e.pointerId)
        setArrastrando(true)
      }
    }
    if (eje.current !== 'x') return
    seMovio.current = true
    setDx(Math.max(-ANCHO_ACCIONES, Math.min(0, inicio.current.dx + ddx)))
  }

  const alSoltar = () => {
    if (!inicio.current) return
    if (eje.current === 'x') setDx((actual) => (actual < -ANCHO_ACCIONES / 2 ? -ANCHO_ACCIONES : 0))
    inicio.current = null
    setArrastrando(false)
  }

  const alTocar = () => {
    if (seMovio.current) return
    if (dx !== 0) {
      setDx(0)
      return
    }
    onTocar?.()
  }

  return (
    <div className="deslizable" ref={contenedor}>
      <div className="deslizable__acciones" style={{ width: ANCHO_ACCIONES }} aria-hidden={dx === 0}>
        {acciones}
      </div>
      <div
        className="deslizable__contenido"
        style={{ transform: `translateX(${dx}px)`, transition: arrastrando ? 'none' : 'transform var(--duracion) var(--curva)' }}
        onPointerDown={alBajar}
        onPointerMove={alMover}
        onPointerUp={alSoltar}
        onPointerCancel={alSoltar}
        onClick={alTocar}
      >
        {children}
      </div>
    </div>
  )
}
