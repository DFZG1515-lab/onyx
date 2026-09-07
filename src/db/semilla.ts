import type { Categoria } from '../lib/tipos'

/** Categorías con las que arranca la base de datos. Las claves alimentan al intérprete de texto. */
export const CATEGORIAS_INICIALES: Categoria[] = [
  { id: 'tienda', nombre: 'Tienda', tope: 0, claves: ['oxxo', 'seven', '7-eleven', 'circle k', 'tiendita'] },
  {
    id: 'super',
    nombre: 'Súper',
    tope: 0,
    claves: ['soriana', 'walmart', 'heb', 'chedraui', 'despensa', 'costco', 'sams', 'aurrera', 'la comer', 'mercado', 'super'],
  },
  {
    id: 'transporte',
    nombre: 'Transporte',
    tope: 0,
    claves: ['gasolina', 'gas', 'uber', 'didi', 'caseta', 'metro', 'camion', 'taxi', 'estacionamiento', 'pension'],
  },
  {
    id: 'comida',
    nombre: 'Comida',
    tope: 0,
    claves: ['comida', 'tacos', 'restaurante', 'cafe', 'starbucks', 'rappi', 'pizza', 'desayuno', 'cena', 'tortas', 'sushi'],
  },
  { id: 'casa', nombre: 'Casa', tope: 0, claves: ['renta', 'luz', 'cfe', 'agua', 'internet', 'telmex', 'izzi', 'totalplay', 'predial'] },
  { id: 'salud', nombre: 'Salud', tope: 0, claves: ['farmacia', 'doctor', 'similares', 'guadalajara', 'medicina', 'dentista', 'consulta'] },
  { id: 'ropa', nombre: 'Ropa', tope: 0, claves: ['ropa', 'zapatos', 'tenis', 'zara', 'liverpool', 'suburbia'] },
  { id: 'entretenimiento', nombre: 'Entretenimiento', tope: 0, claves: ['cine', 'netflix', 'spotify', 'juego', 'concierto', 'bar', 'cerveza'] },
  { id: 'otros', nombre: 'Otros', tope: 0, claves: [] },
]

export const CATEGORIA_POR_DEFECTO = 'otros'
