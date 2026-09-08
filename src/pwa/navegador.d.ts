interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface WindowEventMap {
  beforeinstallprompt: BeforeInstallPromptEvent
}

interface Navigator {
  /** Solo en Safari de iOS: true cuando la página corre como app instalada. */
  readonly standalone?: boolean
}

/** Reconocimiento de voz del navegador (Web Speech API). Tipos mínimos que usamos. */
interface ResultadoVoz {
  readonly results: ArrayLike<ArrayLike<{ readonly transcript: string }>>
}
interface ReconocimientoVoz {
  lang: string
  interimResults: boolean
  maxAlternatives: number
  onresult: ((e: ResultadoVoz) => void) | null
  onerror: ((e: { error: string }) => void) | null
  onend: (() => void) | null
  start(): void
  stop(): void
  abort(): void
}
interface Window {
  SpeechRecognition?: new () => ReconocimientoVoz
  webkitSpeechRecognition?: new () => ReconocimientoVoz
}
