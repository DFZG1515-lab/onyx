import { useUI } from '../store/ui'
import { Captura } from './Captura'
import { Hoja } from './Hoja'

/** La captura vive en una hoja que sube desde abajo al tocar el botón central. */
export function HojaCaptura() {
  const abierta = useUI((s) => s.capturaAbierta)
  const cerrar = useUI((s) => s.cerrarCaptura)
  const mostrarAviso = useUI((s) => s.mostrarAviso)

  return (
    <Hoja abierta={abierta} titulo="Nuevo gasto" onCerrar={cerrar}>
      <Captura
        alGuardar={(mensaje) => {
          cerrar()
          mostrarAviso(mensaje)
        }}
      />
    </Hoja>
  )
}
