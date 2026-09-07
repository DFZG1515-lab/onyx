import type { SVGProps } from 'react'

type Props = SVGProps<SVGSVGElement>

/** Íconos de trazo 1.5 dibujados a mano. Heredan el color del texto. */
function Icono({ children, ...props }: Props) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      {children}
    </svg>
  )
}

export const IconoGraficaCircular = (p: Props) => (
  <Icono {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 3v9h9" />
  </Icono>
)

export const IconoLista = (p: Props) => (
  <Icono {...p}>
    <path d="M4 7h16M4 12h16M4 17h10" />
  </Icono>
)

export const IconoMas = (p: Props) => (
  <Icono {...p}>
    <path d="M12 5v14M5 12h14" />
  </Icono>
)

export const IconoCalendarioRepetir = (p: Props) => (
  <Icono {...p}>
    <rect x="3" y="5" width="18" height="16" />
    <path d="M3 10h18M8 3v4M16 3v4" />
    <path d="M9.5 17a2.5 2.5 0 0 1 4.7-1.2M14.5 13.8v2.2h-2.2" />
  </Icono>
)

export const IconoAjustes = (p: Props) => (
  <Icono {...p}>
    <path d="M4 8h9M19 8h1M4 16h3M11 16h9" />
    <circle cx="15.5" cy="8" r="2.5" />
    <circle cx="8.5" cy="16" r="2.5" />
  </Icono>
)

export const IconoBote = (p: Props) => (
  <Icono {...p}>
    <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6" />
  </Icono>
)

export const IconoPalomita = (p: Props) => (
  <Icono {...p}>
    <path d="M5 12.5l4.5 4.5L19 7" />
  </Icono>
)

export const IconoChevron = (p: Props) => (
  <Icono {...p}>
    <path d="M9 6l6 6-6 6" />
  </Icono>
)
