import { useState, type FormEvent } from 'react'
import { Campo } from '../componentes/Campo'
import { Hoja } from '../componentes/Hoja'
import { normalizar } from '../lib/parser'
import type { Categoria } from '../lib/tipos'
import { useTienda } from '../store/tienda'

type Props = { categoria: Categoria | 'nueva' | null; onCerrar: () => void }

export function HojaCategoria({ categoria, onCerrar }: Props) {
  return (
    <Hoja abierta={categoria !== null} titulo={categoria === 'nueva' ? 'Nueva categoría' : 'Editar categoría'} onCerrar={onCerrar}>
      {categoria && <Formulario categoria={categoria === 'nueva' ? null : categoria} onCerrar={onCerrar} />}
    </Hoja>
  )
}

function idDesdeNombre(nombre: string, existentes: string[]): string {
  const base = normalizar(nombre).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'categoria'
  let id = base
  let n = 2
  while (existentes.includes(id)) id = `${base}-${n++}`
  return id
}

function Formulario({ categoria, onCerrar }: { categoria: Categoria | null; onCerrar: () => void }) {
  const categorias = useTienda((s) => s.categorias)
  const gastos = useTienda((s) => s.gastos)
  const guardarCategoria = useTienda((s) => s.guardarCategoria)
  const borrarCategoria = useTienda((s) => s.borrarCategoria)
  const actualizarGasto = useTienda((s) => s.actualizarGasto)

  const [nombre, setNombre] = useState(categoria?.nombre ?? '')
  const [claves, setClaves] = useState(categoria?.claves.join(', ') ?? '')
  const [error, setError] = useState<string | null>(null)
  const [confirmarBorrado, setConfirmarBorrado] = useState(false)
  const enUso = categoria ? gastos.filter((g) => g.categoriaId === categoria.id).length : 0

  const guardar = async (e: FormEvent) => {
    e.preventDefault()
    const limpio = nombre.trim()
    if (!limpio) return setError('Escribe el nombre. Por ejemplo: Mascotas')
    if (categorias.some((c) => c.id !== categoria?.id && normalizar(c.nombre) === normalizar(limpio))) return setError('Ya hay una categoría con ese nombre.')
    const listaClaves = [...new Set(claves.split(/[,\n]/).map((c) => normalizar(c.trim())).filter(Boolean))]
    await guardarCategoria({
      id: categoria?.id ?? idDesdeNombre(limpio, categorias.map((c) => c.id)),
      nombre: limpio,
      tope: categoria?.tope ?? 0,
      claves: listaClaves,
    })
    onCerrar()
  }

  const borrar = async () => {
    if (!categoria) return
    if (!confirmarBorrado) return setConfirmarBorrado(true)
    // Los gastos de la categoría pasan a Otros; no se pierde nada.
    for (const g of gastos.filter((x) => x.categoriaId === categoria.id)) await actualizarGasto(g.id, { categoriaId: 'otros' })
    await borrarCategoria(categoria.id)
    onCerrar()
  }

  return (
    <form className="formulario" onSubmit={guardar}>
      <Campo etiqueta="Nombre" error={error}>
        <input className="entrada" type="text" autoFocus={!categoria} placeholder="Mascotas" value={nombre} onChange={(e) => setNombre(e.target.value)} />
      </Campo>
      <Campo etiqueta="Palabras que la disparan" ayuda="Separadas por comas. Si escribes una de estas en «dónde», la app sugiere esta categoría.">
        <input className="entrada" type="text" placeholder="veterinario, croquetas, petco" value={claves} onChange={(e) => setClaves(e.target.value)} />
      </Campo>
      <div className="formulario__acciones">
        <button type="submit" className="primario">Guardar</button>
        {categoria && categoria.id !== 'otros' && (
          <button type="button" className="enlace tono-wine" onClick={() => void borrar()}>
            {confirmarBorrado ? `Confirmar: borrar y pasar ${enUso === 1 ? '1 gasto' : `${enUso} gastos`} a Otros` : 'Borrar categoría'}
          </button>
        )}
      </div>
    </form>
  )
}
