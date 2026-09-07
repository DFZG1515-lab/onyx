import { create } from 'zustand'

/** Estado de interfaz que no se persiste: hoja de captura y aviso breve. */
type EstadoUI = {
  capturaAbierta: boolean
  abrirCaptura: () => void
  cerrarCaptura: () => void
  aviso: string | null
  mostrarAviso: (texto: string) => void
  ocultarAviso: () => void
  /** true después de la primera animación de entrada; no se repite en la sesión. */
  entradaHecha: boolean
  marcarEntrada: () => void
}

export const useUI = create<EstadoUI>()((set) => ({
  capturaAbierta: false,
  abrirCaptura: () => set({ capturaAbierta: true }),
  cerrarCaptura: () => set({ capturaAbierta: false }),
  aviso: null,
  mostrarAviso: (texto) => set({ aviso: texto }),
  ocultarAviso: () => set({ aviso: null }),
  entradaHecha: false,
  marcarEntrada: () => set({ entradaHecha: true }),
}))
