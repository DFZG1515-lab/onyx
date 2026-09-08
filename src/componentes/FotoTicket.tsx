import { useEffect, useState } from 'react'
import { db } from '../db/schema'

/** Muestra la foto de un ticket guardada en IndexedDB. */
export function FotoTicket({ fotoId }: { fotoId: string }) {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    let objeto: string | null = null
    void db.fotos.get(fotoId).then((foto) => {
      if (!foto) return
      objeto = URL.createObjectURL(foto.blob)
      setUrl(objeto)
    })
    return () => {
      if (objeto) URL.revokeObjectURL(objeto)
    }
  }, [fotoId])
  if (!url) return null
  return <img className="foto-ticket" src={url} alt="Foto del ticket" />
}
