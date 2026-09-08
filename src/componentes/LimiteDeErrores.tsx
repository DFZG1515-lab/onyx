import { Component, type ErrorInfo, type ReactNode } from 'react'

type Estado = { error: Error | null }

/** Si algo se rompe al dibujar, la app lo dice en vez de quedarse en blanco. Los datos no se tocan. */
export class LimiteDeErrores extends Component<{ children: ReactNode }, Estado> {
  override state: Estado = { error: null }

  static getDerivedStateFromError(error: Error): Estado {
    return { error }
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Onyx se detuvo al dibujar una pantalla', error, info.componentStack)
  }

  override render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="arranque" role="alert">
        <h1 className="arranque__titulo">Algo se rompió al dibujar esta pantalla</h1>
        <p className="tono-muted">Tus datos están guardados en el teléfono y no se tocaron. Recarga la app; si vuelve a pasar, descarga un respaldo desde Presupuesto y cuéntanos qué hacías.</p>
        <p className="meta">{this.state.error.message}</p>
        <button type="button" className="primario" onClick={() => window.location.reload()}>
          Recargar
        </button>
      </div>
    )
  }
}
