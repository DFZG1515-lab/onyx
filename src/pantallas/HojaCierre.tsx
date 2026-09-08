import { Hoja } from '../componentes/Hoja'
import { Monto } from '../componentes/Monto'
import type { ResumenCiclo } from '../lib/analisis'
import { rangoDeCiclo } from '../lib/fechas'

type Props = { resumen: ResumenCiclo | null; nombreDe: (id: string) => string; onCerrar: () => void }

/** Se muestra una vez al abrir la app en una quincena nueva: cómo te fue en la anterior. */
export function HojaCierre({ resumen, nombreDe, onCerrar }: Props) {
  return (
    <Hoja abierta={resumen !== null} titulo="Cerró la quincena" onCerrar={onCerrar}>
      {resumen && (
        <div className="formulario">
          <p className="meta">Del {rangoDeCiclo(resumen)}</p>
          <div>
            <div className="cierre__cifra"><span>Entró</span><Monto centavos={resumen.ingreso} /></div>
            <div className="cierre__cifra"><span>Gastaste</span><Monto centavos={resumen.gastado} /></div>
            {resumen.msi > 0 && <div className="cierre__cifra"><span>Meses sin intereses</span><Monto className="tono-slate" centavos={resumen.msi} /></div>}
            <div className="cierre__cifra">
              <span style={{ fontWeight: 500 }}>{resumen.sobrante >= 0 ? 'Te sobró' : 'Te pasaste'}</span>
              <Monto className={`cifra__valor ${resumen.sobrante >= 0 ? 'tono-green' : 'tono-wine'}`} centavos={Math.abs(resumen.sobrante)} />
            </div>
          </div>
          {resumen.categoriaQueMasCrecio && (
            <p className="meta">
              Lo que más creció contra la quincena anterior: {nombreDe(resumen.categoriaQueMasCrecio.categoriaId)}, <Monto centavos={resumen.categoriaQueMasCrecio.diferencia} conCentavos={false} /> más.
            </p>
          )}
          {resumen.sobrante > 0 && <p className="meta">Lo que sobró se suma a tu guardado. Lo ves al final del Resumen.</p>}
          <div className="formulario__acciones">
            <button type="button" className="primario" onClick={onCerrar}>Entendido</button>
          </div>
        </div>
      )}
    </Hoja>
  )
}
