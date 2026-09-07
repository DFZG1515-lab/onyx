# Onyx

PWA de control de gastos personales por quincena, para México. La pregunta que responde al abrirse es "¿me alcanza?". Todo lo que se construya debe reducir la fricción de captura.

## Stack

Vite + React 18 + TypeScript estricto, Zustand, Dexie sobre IndexedDB, vite-plugin-pwa, Vitest, CSS plano con custom properties. Sin Tailwind, sin librerías de componentes, sin librerías de gráficas. Offline-first: toda escritura va a IndexedDB primero. Deploy estático en Netlify.

## Tokens de diseño

Viven en `src/styles/tokens.css`. Estos son los valores finales.

| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `--paper` | `#F1F2F0` | `#16181B` | Fondo de página |
| `--surface` | `#FFFFFF` | `#1E2126` | Campos, hojas modales |
| `--ink` | `#171A1F` | `#EDEEEA` | Texto principal, botón primario |
| `--muted` | `#767B72` | `#8B908A` | Metadatos, etiquetas secundarias |
| `--rule` | `rgba(23,26,31,0.10)` | `rgba(237,238,234,0.12)` | Líneas divisoras de 1px |
| `--green` | `#0F6E56` | `#5DCAA5` | Disponible, confirmaciones, vas bien |
| `--wine` | `#A32D2D` | `#F09595` | Excedido, errores, borrar |
| `--slate` | `#534AB7` | `#AFA9EC` | Meses sin intereses, deuda futura |
| `--amber` | `#854F0B` | `#EF9F27` | Justo, avisos |

Los tres colores semánticos suben de tono en oscuro para mantener contraste AA sobre `--paper`. Verificar con cálculo WCAG, no a ojo.

## Tipografía

- Schibsted Grotesk como única familia, autoalojada en `public/fonts`, pesos 400, 500 y 600.
- `tabular-nums` en todos los números para que las columnas de pesos alineen.
- Escala: monto héroe 62px/500 con `letter-spacing: -0.035em`; encabezados de sección 15px/500; cuerpo 15px/400; metadatos 12px/400.
- Todo en formato de oración. Nunca mayúsculas completas, ni siquiera en etiquetas.

## Layout

- Concepto: libro contable, no dashboard. Debe parecer un estado de cuenta bien tipografiado.
- Cero tarjetas. Los gastos son filas separadas por líneas de 1px, monto alineado a la derecha.
- Cero sombras, cero gradientes. Cero esquinas redondeadas salvo en chips y barras de progreso.
- Un solo elemento con voz alta por pantalla: el monto grande.
- Ancho máximo de contenido 420px, centrado.
- Movimiento solo como respuesta a una acción del usuario. Respetar `prefers-reduced-motion`.

## Copy

Voz activa, verbos concretos, sin relleno. "Guardar", no "Enviar". Los errores dicen qué pasó y cómo arreglarlo. Las pantallas vacías invitan a hacer algo, no se disculpan. Nunca "exitosamente", "por favor" ni signos de admiración.

## Datos

Todo el dinero en centavos, como enteros. Formatear con `Intl.NumberFormat('es-MX')` solo al renderizar. Fechas en epoch ms, hora local. Quincena Q1 del 1 al 15, Q2 del 16 al fin de mes; id `AAAA-MM-Q1`.

## Cómo trabajar

- Por fases. Antes de cada fase, plan en cinco líneas y esperar el visto bueno.
- Commits pequeños, en español, en imperativo.
- TypeScript estricto. Sin `any`.
- Lógica pura en `src/lib/` con pruebas de Vitest escritas antes de la implementación.
- Al terminar cada fase, correr `npm test`, `npm run typecheck` y `npm run build`, y mostrar la salida.
- No agregar dependencias sin preguntar. En particular, ninguna librería de gráficas ni de componentes.
- Si una decisión del usuario parece equivocada, decirlo antes de implementarla.
- Verificación visual: build de producción servido con `vite preview` y capturas con Chrome headless por CDP; los scripts viven en el scratchpad de la sesión.
