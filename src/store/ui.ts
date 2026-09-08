import { create } from 'zustand'

export type AccionAviso = { texto: string; alHacer: () => void }
export type AvisoUI = { texto: string; accion?: AccionAviso; duracion: number }

/** Estado de interfaz que no se persiste: hoja de captura, aviso breve, filtros y entrada. */
type EstadoUI = {
  capturaAbierta: boolean
  abrirCaptura: () => void
  cerrarCaptura: () => void
  aviso: AvisoUI | null
  /** Con acción (por ejemplo Deshacer) dura 5 segundos; sin acción, 2.5. */
  mostrarAviso: (texto: string, accion?: AccionAviso) => void
  ocultarAviso: () => void
  /** true después de la primera animación de entrada; no se repite en la sesión. */
  entradaHecha: boolean
  marcarEntrada: () => void
  /** Día (epoch ms) al que se filtra Movimientos desde la gráfica; null sin filtro. */
  filtroDia: number | null
  setFiltroDia: (dia: number | null) => void
}

export const useUI = create<EstadoUI>()((set) => ({
  capturaAbierta: false,
  abrirCaptura: () => set({ capturaAbierta: true }),
  cerrarCaptura: () => set({ capturaAbierta: false }),
  aviso: null,
  mostrarAviso: (texto, accion) => set({ aviso: accion ? { texto, accion, duracion: 5_000 } : { texto, duracion: 2_500 } }),
  ocultarAviso: () => set({ aviso: null }),
  entradaHecha: false,
  marcarEntrada: () => set({ entradaHecha: true }),
  filtroDia: null,
  setFiltroDia: (filtroDia) => set({ filtroDia }),
}))
