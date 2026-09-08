import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { LimiteDeErrores } from './componentes/LimiteDeErrores'
import { iniciarPWA } from './pwa/registro'
import { useTienda } from './store/tienda'
import './styles/index.css'

void useTienda.getState().cargarTodo()
iniciarPWA()

const raiz = document.getElementById('raiz')
if (!raiz) throw new Error('No existe el elemento #raiz en index.html')

createRoot(raiz).render(
  <StrictMode>
    <LimiteDeErrores>
      <App />
    </LimiteDeErrores>
  </StrictMode>,
)
