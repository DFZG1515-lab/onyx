import type { CSSProperties } from 'react'
import { diaMasCaro } from '../lib/analisis'
import { pesos } from '../lib/dinero'
import { nombreDiaSemana } from '../lib/fechas'

type Props = {
  porDia: number[]
  /** Índice (0-based) de hoy dentro del ciclo; -1 si el ciclo ya cerró. */
  indiceHoy: number
  /** Índices de días en que se cobra un gasto fijo. */
  diasFijos: Set<number>
  inicio: number
  etiquetaInicio: string
  etiquetaFin: string
  /** Gasto diario parejo: ingreso entre días. Se dibuja como línea punteada. */
  esperadoPorDia: number
  alTocar: (indice: number) => void
}

const ALTO = 34

/** Una barra por día del ciclo. Hoy en verde sólido, el día más caro en vino, el futuro en regla. */
export function GraficaDiaria({ porDia, indiceHoy, diasFijos, inicio, etiquetaInicio, etiquetaFin, esperadoPorDia, alTocar }: Props) {
  const maximo = Math.max(...porDia, esperadoPorDia, 1)
  const alturaRitmo = Math.round((esperadoPorDia / maximo) * ALTO)
  const caro = diaMasCaro(porDia)
  const hayGasto = caro !== null
  const contexto = hayGasto ? `el ${nombreDiaSemana(inicio + (caro - 1) * 86_400_000)} ${caro - 1 === indiceHoy ? 'llevas' : 'fue'} lo más caro` : 'todavía sin gastos'

  return (
    <div className="grafica">
      <div className="grafica__cabecera">
        <span>Gasto de cada día</span>
        <span>{contexto}</span>
      </div>
      <div className="grafica__dias">
        {esperadoPorDia > 0 && (
          <div className="grafica__ritmo" style={{ bottom: alturaRitmo }} title={`Gasto parejo: ${pesos(esperadoPorDia)} por día`} aria-hidden="true">
            <span>ritmo</span>
          </div>
        )}
        {porDia.map((v, i) => {
          const futuro = indiceHoy >= 0 && i > indiceHoy
          const clases = ['barra-dia']
          if (futuro) clases.push('barra-dia--futuro')
          else if (i === indiceHoy) clases.push('barra-dia--hoy', 'barra-dia--latido')
          else if (caro !== null && i === caro - 1) clases.push('barra-dia--maximo')
          if (diasFijos.has(i)) clases.push('barra-dia--fijo')
          const alto = futuro ? 4 : Math.max(3, Math.round((v / maximo) * ALTO))
          return (
            <button
              key={i}
              type="button"
              className={clases.join(' ')}
              style={{ height: alto, '--i': i } as CSSProperties}
              disabled={futuro}
              aria-label={futuro ? `Día ${i + 1}, todavía no` : `Día ${i + 1}, ${pesos(v)}. Ver movimientos de ese día`}
              onClick={() => alTocar(i)}
            />
          )
        })}
      </div>
      <div className="grafica__pie">
        <span>{etiquetaInicio}</span>
        <span>{indiceHoy >= 0 ? 'hoy' : ''}</span>
        <span>{etiquetaFin}</span>
      </div>
    </div>
  )
}
