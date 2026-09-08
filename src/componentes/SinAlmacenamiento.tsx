type Props = { mensaje: string; alReintentar: () => void }

/** IndexedDB no abrió: modo privado, sin espacio, o el navegador lo bloquea. */
export function SinAlmacenamiento({ mensaje, alReintentar }: Props) {
  return (
    <div className="arranque" role="alert">
      <h1 className="arranque__titulo">No se pudo abrir el almacenamiento del teléfono</h1>
      <p className="tono-muted">Onyx guarda todo en este dispositivo. Si estás en una ventana privada, ábrela en una normal. Si no, revisa que el teléfono tenga espacio libre y que el navegador permita guardar datos de sitios.</p>
      <p className="meta">{mensaje}</p>
      <button type="button" className="primario" onClick={alReintentar}>
        Intentar de nuevo
      </button>
    </div>
  )
}
