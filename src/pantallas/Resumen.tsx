import { useEffect, useState } from 'react'
import { AvisoInstalacion } from '../componentes/AvisoInstalacion'
import { useContador } from '../hooks/useContador'
import type { Ciclo, GastoFijo } from '../lib/tipos'
import { useUI } from '../store/ui'
import { HojaFijo } from './HojaFijo'
import { HojaIngreso } from './HojaIngreso'
import { AvisoRecurrente } from './resumen/AvisoRecurrente'
import { BloqueHeroe } from './resumen/BloqueHeroe'
import { Categorias } from './resumen/Categorias'
import { Comprometido } from './resumen/Comprometido'
import { Historial } from './resumen/Historial'
import { TeDeben } from './resumen/TeDeben'
import { useResumen } from './resumen/useResumen'

/** La pantalla que responde "¿me alcanza?". El cálculo vive en useResumen; aquí solo se compone. */
export function Resumen() {
  const r = useResumen()
  const entradaHecha = useUI((s) => s.entradaHecha)
  const marcarEntrada = useUI((s) => s.marcarEntrada)
  const heroeAnterior = useUI((s) => s.heroeAnterior)
  const setHeroeAnterior = useUI((s) => s.setHeroeAnterior)

  // La entrada se anima una sola vez por sesión; después todo responde solo a acciones.
  const [animarEntrada] = useState(() => !entradaHecha)
  useEffect(() => {
    if (!entradaHecha) marcarEntrada()
  }, [entradaHecha, marcarEntrada])

  const [fijoEnEdicion, setFijoEnEdicion] = useState<GastoFijo | 'nuevo' | null>(null)
  const [editandoIngreso, setEditandoIngreso] = useState<Ciclo | null>(null)

  const cifraHeroe = r?.cifraHeroe ?? 0
  const heroeAnimado = useContador(cifraHeroe, animarEntrada ? 0 : heroeAnterior)
  useEffect(() => {
    if (r) setHeroeAnterior(cifraHeroe)
  }, [cifraHeroe, r, setHeroeAnterior])

  if (!r) return null

  return (
    <div className={animarEntrada ? 'cascada' : undefined}>
      <BloqueHeroe r={r} heroeAnimado={heroeAnimado} animarEntrada={animarEntrada} alEditarIngreso={() => setEditandoIngreso(r.ciclo)} />
      <AvisoInstalacion />
      <AvisoRecurrente r={r} />
      <Categorias r={r} />
      <Comprometido r={r} alEditarFijo={setFijoEnEdicion} />
      <TeDeben r={r} />
      <Historial r={r} />
      <HojaFijo fijo={fijoEnEdicion} onCerrar={() => setFijoEnEdicion(null)} />
      <HojaIngreso ciclo={editandoIngreso} onCerrar={() => setEditandoIngreso(null)} />
    </div>
  )
}
