import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Aviso } from '../componentes/Aviso'
import { BarraNavegacion } from '../componentes/BarraNavegacion'
import { AvisoActualizacion, IndicadorConexion } from '../componentes/EstadoConexion'
import { HojaCaptura } from '../componentes/HojaCaptura'
import { useCicloActual } from '../hooks/usePresupuesto'
import { resumenDeCiclo } from '../lib/analisis'
import { idAnterior } from '../lib/ciclos'
import { rangoDeCiclo } from '../lib/fechas'
import { useTienda } from '../store/tienda'
import { useUI } from '../store/ui'
import { HojaCierre } from './HojaCierre'
import { PrimerUso } from './PrimerUso'

/** Layout común: cabecera discreta, pantalla activa, barra inferior, hoja de captura y cierre de quincena. */
export function Marco() {
  const listo = useTienda((s) => s.listo)
  const ajustes = useTienda((s) => s.ajustes)
  const ciclos = useTienda((s) => s.ciclos)
  const gastos = useTienda((s) => s.gastos)
  const comprasMSI = useTienda((s) => s.comprasMSI)
  const categorias = useTienda((s) => s.categorias)
  const guardarAjustes = useTienda((s) => s.guardarAjustes)
  const abrirCaptura = useUI((s) => s.abrirCaptura)
  const { ciclo } = useCicloActual()
  const [cierreDescartado, setCierreDescartado] = useState(false)
  const [navOculta, setNavOculta] = useState(false)

  // La barra inferior se esconde al bajar y vuelve al subir: regala espacio a las listas largas.
  useEffect(() => {
    let ultimo = window.scrollY
    const alDesplazar = () => {
      const y = window.scrollY
      if (y > ultimo + 6 && y > 80) setNavOculta(true)
      else if (y < ultimo - 6 || y <= 80) setNavOculta(false)
      ultimo = y
    }
    window.addEventListener('scroll', alDesplazar, { passive: true })
    return () => window.removeEventListener('scroll', alDesplazar)
  }, [])

  // Tema forzado desde ajustes.
  useEffect(() => {
    const tema = ajustes?.tema
    if (!tema || tema === 'sistema') delete document.documentElement.dataset.tema
    else document.documentElement.dataset.tema = tema
  }, [ajustes?.tema])

  // Atajo del ícono: /?nuevo=1 abre la captura.
  useEffect(() => {
    if (!listo || !ajustes?.primerUsoCompleto) return
    if (new URLSearchParams(window.location.search).get('nuevo') === '1') {
      abrirCaptura()
      window.history.replaceState(null, '', window.location.pathname)
    }
  }, [listo, ajustes?.primerUsoCompleto, abrirCaptura])

  if (!listo) return null
  if (!ajustes?.primerUsoCompleto) return <PrimerUso />

  const anteriorId = ciclo ? idAnterior(ciclo.id) : null
  const anterior = anteriorId ? ciclos.find((c) => c.id === anteriorId) : undefined
  const hayDatosAnteriores = anteriorId !== null && gastos.some((g) => g.cicloId === anteriorId)
  const mostrarCierre = !cierreDescartado && anterior !== undefined && hayDatosAnteriores && ajustes.ultimoCierreVisto !== anteriorId
  const resumenCierre = mostrarCierre && anterior ? resumenDeCiclo(anterior, gastos, comprasMSI, ciclos.find((c) => c.id === idAnterior(anterior.id))) : null
  const nombreDe = (id: string) => categorias.find((c) => c.id === id)?.nombre ?? id

  const cerrarCierre = () => {
    setCierreDescartado(true)
    if (anteriorId) void guardarAjustes({ ultimoCierreVisto: anteriorId })
  }

  return (
    <div className="app">
      <header className="cabecera">
        <svg className="marca" width="20" height="20" viewBox="0 0 20 20" fill="none" strokeWidth="2.4" strokeLinecap="square" aria-hidden="true">
          <line x1="2" y1="4" x2="18" y2="4" stroke="var(--ink)" />
          <line x1="2" y1="10" x2="18" y2="10" stroke="var(--ink)" />
          <line x1="2" y1="16" x2="18" y2="16" stroke="var(--green)" />
        </svg>
        <span className="cabecera__nombre">Onyx</span>
        <span className="cabecera__quincena">{ciclo ? `${rangoDeCiclo(ciclo)}` : ''}</span>
        <IndicadorConexion />
      </header>
      <AvisoActualizacion />
      <main className="contenido">
        <Outlet />
      </main>
      <Aviso />
      <BarraNavegacion oculta={navOculta} />
      <HojaCaptura />
      <HojaCierre resumen={resumenCierre} nombreDe={nombreDe} onCerrar={cerrarCierre} />
    </div>
  )
}
