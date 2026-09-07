import { createBrowserRouter } from 'react-router-dom'
import { Marco } from './pantallas/Marco'
import { MesesSinIntereses } from './pantallas/MesesSinIntereses'
import { Movimientos } from './pantallas/Movimientos'
import { Presupuesto } from './pantallas/Presupuesto'
import { Resumen } from './pantallas/Resumen'

export const RUTAS = {
  resumen: '/',
  movimientos: '/movimientos',
  msi: '/msi',
  presupuesto: '/presupuesto',
} as const

export const enrutador = createBrowserRouter([
  {
    path: RUTAS.resumen,
    element: <Marco />,
    children: [
      { index: true, element: <Resumen /> },
      { path: RUTAS.movimientos, element: <Movimientos /> },
      { path: RUTAS.msi, element: <MesesSinIntereses /> },
      { path: RUTAS.presupuesto, element: <Presupuesto /> },
    ],
  },
])
