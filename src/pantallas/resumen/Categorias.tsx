import { useState } from 'react'
import { Barra } from '../../componentes/Barra'
import { Fila } from '../../componentes/Fila'
import { Monto } from '../../componentes/Monto'
import { Vacio } from '../../componentes/Vacio'
import { pesos } from '../../lib/dinero'
import type { Resumen } from './useResumen'

export function Categorias({ r }: { r: Resumen }) {
  const [abierta, setAbierta] = useState<string | null>(null)
  return (
    <section className="seccion">
      <h2 className="seccion__titulo">Gastado por categoría</h2>
      {r.porCategoria.length === 0 ? (
        <Vacio texto="Todavía no hay gastos en esta quincena. Toca el botón de abajo para escribir el primero." />
      ) : (
        r.porCategoria.map((fila, i) => {
          const tope = r.topeDe(fila.categoriaId)
          const excede = tope > 0 && fila.total > tope
          const parte = r.p.gastado > 0 ? fila.total / r.p.gastado : 0
          return (
            <Fila
              key={fila.categoriaId}
              indice={i}
              titulo={r.nombreDe(fila.categoriaId)}
              meta={abierta === fila.categoriaId ? `${Math.round(parte * 100)} % del gasto${tope > 0 ? ` · tope ${pesos(tope, { centavos: false })}` : ' · sin tope'}` : undefined}
              monto={<Monto centavos={fila.total} />}
              tono={excede ? 'wine' : 'ink'}
              onClick={() => setAbierta(abierta === fila.categoriaId ? null : fila.categoriaId)}
              pie={<Barra fraccion={parte} tono={excede ? 'wine' : 'ink'} etiqueta={`Parte de ${r.nombreDe(fila.categoriaId)} en el gasto`} />}
            />
          )
        })
      )}
    </section>
  )
}
