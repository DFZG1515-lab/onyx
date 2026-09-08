import { Monto } from '../../componentes/Monto'
import { normalizar } from '../../lib/parser'
import { useTienda } from '../../store/tienda'
import { useUI } from '../../store/ui'
import type { Resumen } from './useResumen'

export function AvisoRecurrente({ r }: { r: Resumen }) {
  const agregarFijo = useTienda((s) => s.agregarFijo)
  const guardarAjustes = useTienda((s) => s.guardarAjustes)
  const mostrarAviso = useUI((s) => s.mostrarAviso)
  const { recurrente, gastoRecurrente } = r
  if (!recurrente || !gastoRecurrente) return null

  const volverloFijo = async () => {
    await agregarFijo({ descripcion: recurrente.descripcion, monto: recurrente.montoPromedio, diaDelMes: new Date(gastoRecurrente.fecha).getDate(), activo: true })
    mostrarAviso(`${recurrente.descripcion} ya es gasto fijo`)
  }
  const ignorar = () => void guardarAjustes({ recurrentesIgnorados: [...r.ignorados, normalizar(recurrente.descripcion)] })

  return (
    <div className="recurrente" role="status">
      <p>
        Compras en {recurrente.descripcion} cada quincena, unos <Monto centavos={recurrente.montoPromedio} conCentavos={false} />. ¿Volverlo gasto fijo?
      </p>
      <div className="recurrente__acciones">
        <button type="button" className="enlace" onClick={() => void volverloFijo()}>Volverlo fijo</button>
        <button type="button" className="enlace" onClick={ignorar}>Ignorar</button>
      </div>
    </div>
  )
}
