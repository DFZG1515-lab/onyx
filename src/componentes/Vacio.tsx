type Props = { texto: string }

/** Pantalla vacía como invitación, no como disculpa. */
export function Vacio({ texto }: Props) {
  return <p className="vacio">{texto}</p>
}
