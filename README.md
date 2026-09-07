# Onyx

Control de gastos personales por quincena, para México. Responde una sola pregunta al abrirse: ¿me alcanza?

- Ciclos por quincena, no por mes calendario.
- Meses sin intereses como entidad propia: una compra a 12 MSI se reparte en las siguientes 24 quincenas y se descuenta del disponible antes de mostrar el saldo libre.
- Captura en lenguaje natural desde un solo campo: "oxxo 85 efectivo" se convierte en monto, categoría y método de pago.

Funciona sin conexión. Todo se guarda en el dispositivo, en IndexedDB. No hay servidor.

## Correr en local

```sh
npm install
npm run dev
```

## Verificar

```sh
npm test            # pruebas de la lógica pura (parser, presupuesto, quincenas, MSI)
npm run typecheck   # TypeScript estricto
npm run build       # build de producción con service worker y manifest
npm run preview     # sirve dist/ en http://localhost:4173
```

Para probar el modo avión: abre la vista previa, espera un par de segundos a que el service worker precargue, corta la red desde las herramientas de desarrollo y recarga.

## Desplegar en Netlify

El repo ya trae `netlify.toml` con el comando de build, la carpeta `dist`, la redirección para rutas de SPA y los encabezados de caché.

```sh
npm install -g netlify-cli
netlify login
netlify init      # conecta el repo y crea el sitio
netlify deploy --build --prod
```

También puedes conectar el repo desde el panel de Netlify; detecta la configuración solo.

## Estructura

```
src/lib/        lógica pura con pruebas: parser, presupuesto, ciclos, msi, dinero, fechas
src/db/         esquema de Dexie y categorías iniciales
src/store/      tienda de Zustand; cada acción escribe en IndexedDB primero
src/hooks/      ciclo actual y presupuesto en vivo
src/componentes/ piezas de interfaz: fila, barra, hoja modal, captura
src/pantallas/  Resumen, Movimientos, Meses sin intereses y sus hojas de edición
src/pwa/        service worker, estado de conexión e instalación
src/styles/     tokens de diseño, base y estilos por pantalla
```

## Decisiones

- Todo el dinero son centavos enteros. Se formatea con `Intl.NumberFormat('es-MX')` solo al renderizar.
- Q1 va del 1 al 15; Q2 del 16 al fin de mes.
- El primer pago de una compra a meses cae en la quincena siguiente a la compra.
- Un gasto fijo cuenta como comprometido hasta su día de cobro, o hasta que se marca como pagado.
- Si el usuario corrige la categoría de un gasto, las palabras de la descripción se aprenden como claves para la próxima vez.
