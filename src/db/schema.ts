import Dexie, { type EntityTable } from 'dexie'
import type { Ajustes, Categoria, Ciclo, CompraMSI, Deuda, Foto, Gasto, GastoFijo, Ingreso } from '../lib/tipos'
import { CATEGORIAS_INICIALES } from './semilla'

/**
 * Base de datos local. Toda escritura pasa por aquí primero; la app funciona sin red.
 * `declare` evita que los campos de clase pisen las tablas que Dexie crea en el constructor.
 */
export class BaseDeDatos extends Dexie {
  declare gastos: EntityTable<Gasto, 'id'>
  declare categorias: EntityTable<Categoria, 'id'>
  declare ciclos: EntityTable<Ciclo, 'id'>
  declare gastosFijos: EntityTable<GastoFijo, 'id'>
  declare comprasMSI: EntityTable<CompraMSI, 'id'>
  declare ajustes: EntityTable<Ajustes, 'id'>
  declare fotos: EntityTable<Foto, 'id'>
  declare ingresos: EntityTable<Ingreso, 'id'>
  declare deudas: EntityTable<Deuda, 'id'>

  constructor() {
    super('onyx')
    this.version(1).stores({
      gastos: 'id, cicloId, fecha, categoriaId, [cicloId+fecha]',
      categorias: 'id',
      ciclos: 'id, inicio',
      gastosFijos: 'id',
      comprasMSI: 'id, fechaCompra',
      ajustes: 'id',
    })
    // v2: fotos de tickets adjuntas a un gasto.
    this.version(2).stores({ fotos: 'id, gastoId' })
    // v3: ingresos extra por quincena y deudas de gastos compartidos.
    this.version(3).stores({ ingresos: 'id, cicloId', deudas: 'id, gastoId' })
    this.on('populate', () => {
      void this.categorias.bulkAdd(CATEGORIAS_INICIALES)
    })
  }
}

export const db = new BaseDeDatos()
