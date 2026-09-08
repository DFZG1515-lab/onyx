type Props = { tamano?: number; className?: string }

/** La marca: una piedra de ónix facetada en tinta con una cara verde. */
export function Marca({ tamano = 20, className }: Props) {
  return (
    <svg className={className} width={tamano} height={tamano} viewBox="0 0 100 100" aria-hidden="true">
      <polygon points="50,10 86,32 86,68 50,90 14,68 14,32" fill="var(--ink)" />
      <polygon points="50,10 86,32 50,50" fill="var(--green)" />
      <polygon points="50,50 86,32 86,68" fill="var(--ink)" opacity="0.75" />
      <polygon points="14,32 50,50 14,68" fill="var(--paper)" opacity="0.14" />
    </svg>
  )
}
