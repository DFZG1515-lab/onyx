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
- Dígitos tabulares en todos los montos, aplicados solo a las corridas de dígitos con la clase `.num` a través del componente `Monto`. No usar `tabular-nums` global: en Schibsted Grotesk esa función también ensancha punto, coma y dos puntos y separa la puntuación ("$1 , 333"). Medido en Chrome.
- Escala: monto héroe 62px/500 con `letter-spacing: -0.035em`; encabezados de sección 15px/500; cuerpo 15px/400; metadatos 12px/400.
- Todo en formato de oración. Nunca mayúsculas completas, ni siquiera en etiquetas.

## Layout

- Concepto: libro contable, no dashboard. Debe parecer un estado de cuenta bien tipografiado.
- Cero tarjetas. Los gastos son filas separadas por líneas de 1px, monto alineado a la derecha.
- Cero sombras, cero gradientes. Cero esquinas redondeadas salvo en chips y barras de progreso.
- Un solo elemento con voz alta por pantalla: el monto grande.
- Ancho máximo de contenido 420px, centrado.
- Movimiento con dos permisos: una animación de entrada al abrir la app, una sola vez por sesión (el monto cuenta hasta su valor, el anillo se dibuja, las filas entran en cascada de 30 ms), y respuestas a acciones del usuario (guardar, borrar, cambiar de pantalla, cambio de estado). Nunca al hacer scroll ni al volver a una pestaña. Todo se apaga con `prefers-reduced-motion`. Duraciones: 160 ms para respuestas, 600 ms para la entrada.

## Copy

Voz activa, verbos concretos, sin relleno. "Guardar", no "Enviar". Los errores dicen qué pasó y cómo arreglarlo. Las pantallas vacías invitan a hacer algo, no se disculpan. Nunca "exitosamente", "por favor" ni signos de admiración.

## Captura

Decisión del usuario (7 de septiembre de 2026): la hoja de nuevo gasto es un formulario por campos, no un campo de texto libre. Orden: cuánto (monto grande con teclado decimal), dónde o en qué, categoría en chips, método en segmentos, meses sin intereses en segmentos, fecha, chips de gastos frecuentes, y Guardar con cámara y micrófono como secundarios. La cámara adjunta la foto del ticket al gasto (tabla `fotos` de Dexie, v2; sin OCR). El micrófono dicta con el reconocimiento de voz del navegador (`src/lib/dictado.ts` convierte números dichos con palabras y llena los campos con el intérprete); se oculta donde el navegador no lo soporta. Ningún aviso debe mostrarse con el toast global mientras la hoja está abierta: el `<dialog>` lo tapa; los avisos de la captura van dentro de la hoja. La app sugiere categoría y método a partir del texto de "dónde" (`src/lib/sugerencias.ts`: primero el último gasto igual, luego las claves) y muestra la razón. Si el usuario corrige la categoría, la palabra se aprende. El intérprete de texto libre (`parser.ts`) sigue en el repo con sus pruebas para el dictado y la cámara futuros.

## Pantallas y funciones

- Resumen: héroe, anillo, chip de ritmo, rejilla de cifras, gráfica de gasto diario (tocar una barra filtra Movimientos a ese día), aviso de recurrente (misma descripción tres quincenas seguidas con montos dentro de un 20 %), categorías con barra, comprometido, quincenas anteriores con guardado acumulado.
- Movimientos: buscador con espera de 200 ms, filtros por método, filtro por día, filas de 13/12/14 px, deslizar a la izquierda para borrar con deshacer de 5 segundos (el borrado se aplica al vencer o al salir de la pantalla), tocar para editar.
- Meses sin intereses: proyección de las próximas siete quincenas, "Libre en", compras con avance.
- Presupuesto: ingreso, topes por categoría con barra y sugerencia por historial, sin asignar, aviso al 80 %, tema (sistema, claro, oscuro), respaldo JSON (exportar, restaurar, borrar todo). Las fotos no van en el respaldo.
- Primer uso: lista de tres pasos (ingreso, fijos, compras a meses). Cierre de quincena: hoja de una sola vez al abrir en una quincena nueva. Atajo del manifest `/?nuevo=1` abre la captura.
- Pasada de diseño (7 sep 2026): secciones con 48 px arriba; cabecera con marca y nombre en todas las pantallas; centavos menores en todos los montos (`.monto__centavos`); un solo acento por pantalla (comprometido y MSI en tinta; el anillo toma el color del ritmo); línea punteada de ritmo en la gráfica diaria; categorías del Resumen muestran su porcentaje solo al tocarlas; captura con monto formateado al escribir, categoría como chip plegable y meses/fecha detrás de "Más opciones"; Movimientos con la fecha en columna izquierda y montos de tarjeta en gris; el monto grande viaja entre pantallas (`heroeAnterior` en el store de UI); la barra inferior se esconde al bajar.
- La lógica de análisis vive en `src/lib/analisis.ts` y la de respaldo en `src/lib/respaldo.ts`, ambas con pruebas.

## Marca

Piedra de ónix facetada: tinta con una cara verde (`src/componentes/Marca.tsx` para la interfaz, `public/icono.svg` para el ícono, PNG generados con `qlmanage`). Elegida el 7 de septiembre de 2026 entre cinco opciones; sustituyó a los tres renglones.

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
