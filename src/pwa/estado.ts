import { create } from 'zustand'

const CLAVE_AVISO = 'onyx.aviso-instalacion-descartado'

function leerDescartado(): boolean {
  try {
    return localStorage.getItem(CLAVE_AVISO) === '1'
  } catch {
    return false
  }
}

export function estaInstalada(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true
}

type EstadoPWA = {
  enLinea: boolean
  hayActualizacion: boolean
  aplicarActualizacion: () => void
  promptInstalacion: BeforeInstallPromptEvent | null
  avisoDescartado: boolean
  instalar: () => Promise<void>
  descartarAviso: () => void
}

export const useEstadoPWA = create<EstadoPWA>()((set, get) => ({
  enLinea: typeof navigator === 'undefined' ? true : navigator.onLine,
  hayActualizacion: false,
  aplicarActualizacion: () => {},
  promptInstalacion: null,
  avisoDescartado: leerDescartado(),

  instalar: async () => {
    const prompt = get().promptInstalacion
    if (!prompt) return
    await prompt.prompt()
    const { outcome } = await prompt.userChoice
    set({ promptInstalacion: null })
    if (outcome === 'accepted') get().descartarAviso()
  },

  descartarAviso: () => {
    try {
      localStorage.setItem(CLAVE_AVISO, '1')
    } catch {
      /* sin almacenamiento local seguimos, solo que el aviso volverá */
    }
    set({ avisoDescartado: true })
  },
}))
