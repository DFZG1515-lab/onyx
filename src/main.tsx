import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { useTienda } from './store/tienda'
import './styles/index.css'

void useTienda.getState().cargarTodo()

const raiz = document.getElementById('raiz')
if (!raiz) throw new Error('No existe el elemento #raiz en index.html')

createRoot(raiz).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
