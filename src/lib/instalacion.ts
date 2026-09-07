/**
 * iOS no dispara `beforeinstallprompt`. Solo Safari puede agregar una PWA al inicio,
 * así que ahí mostramos instrucciones manuales; Chrome y Firefox en iOS no pueden instalar.
 */
export function necesitaInstruccionesIOS(userAgent: string, yaInstalada: boolean): boolean {
  if (yaInstalada) return false
  const esIOS = /iPhone|iPad|iPod/i.test(userAgent)
  const esSafari = /Safari/i.test(userAgent) && !/CriOS|FxiOS|EdgiOS|OPiOS/i.test(userAgent)
  return esIOS && esSafari
}
