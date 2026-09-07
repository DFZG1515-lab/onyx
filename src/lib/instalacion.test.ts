import { describe, expect, test } from 'vitest'
import { necesitaInstruccionesIOS } from './instalacion'

const IPHONE_SAFARI = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'
const IPAD_SAFARI = 'Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'
const IPHONE_CHROME = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/125.0 Mobile/15E148 Safari/604.1'
const ANDROID_CHROME = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Mobile Safari/537.36'

describe('necesitaInstruccionesIOS', () => {
  test('Safari en iPhone o iPad sin instalar necesita las instrucciones manuales', () => {
    expect(necesitaInstruccionesIOS(IPHONE_SAFARI, false)).toBe(true)
    expect(necesitaInstruccionesIOS(IPAD_SAFARI, false)).toBe(true)
  })

  test('ya instalada como app no necesita nada', () => {
    expect(necesitaInstruccionesIOS(IPHONE_SAFARI, true)).toBe(false)
  })

  test('Chrome en iOS no puede instalar PWAs y no recibe instrucciones', () => {
    expect(necesitaInstruccionesIOS(IPHONE_CHROME, false)).toBe(false)
  })

  test('Android usa el evento del navegador, no instrucciones', () => {
    expect(necesitaInstruccionesIOS(ANDROID_CHROME, false)).toBe(false)
  })
})
