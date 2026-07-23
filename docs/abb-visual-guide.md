# Guia Visual ABB para la POC

## Proposito y fuentes

Esta guia define una direccion visual para sustituir la estetica maritima azul
actual por una interfaz operativa coherente con ABB y compatible con Fluent UI
React v9.

La referencia principal es la presencia publica de ABB en
[abb.com/global/en](https://www.abb.com/global/en): una identidad industrial,
directa y de alto contraste que usa el rojo ABB como senal de marca, grandes
superficies blancas y negras, fotografia real de instalaciones, productos y
personas, y una jerarquia editorial sobria. Tambien se tomo como referencia el
mensaje de marca *Engineered to outrun* publicado por ABB.

No se encontro una guia publica completa de identidad ni especificaciones
licenciadas de tipografia. Los valores de esta guia son tokens de implementacion
para la POC, no sustituyen una aprobacion de marca de ABB.

## Principios de interfaz

1. **Industrial y preciso.** Priorizar datos, estados operativos y decisiones
   sobre decoracion ambiental.
2. **Rojo con proposito.** Reservar el rojo ABB para marca, accion primaria,
   seleccion importante y alertas que requieran atencion. No usarlo como fondo
   dominante de areas extensas de trabajo.
3. **Blanco, negro y gris estructural.** Las superficies neutras organizan el
   contenido; las lineas grises sustituyen sombras profundas y gradientes.
4. **Fotografia real cuando haya una imagen.** Usar equipo electrico,
   instalaciones, esquemas reales o personas trabajando. Evitar ilustraciones
   abstractas, burbujas, olas y fondos atmosfericos.
5. **Movimiento funcional.** Solo transiciones breves para abrir contenido,
   confirmar seleccion o indicar carga. Respetar `prefers-reduced-motion`.

## Tema y paleta propuesta

| Rol | Token de implementacion | Valor propuesto | Uso |
| --- | --- | --- | --- |
| Marca | `--abb-red` | `#FF0000` | logo, accion primaria, indicador activo |
| Marca interactiva | `--abb-red-hover` | `#D60000` | hover o pressed de accion primaria |
| Marca suave | `--abb-red-subtle` | `#FFF0F0` | seleccion suave, etiquetas no criticas |
| Tinta principal | `--abb-black` | `#0A0A0A` | encabezados, datos prioritarios |
| Tinta secundaria | `--abb-ink-muted` | `#4D4D4D` | texto auxiliar |
| Superficie | `--abb-white` | `#FFFFFF` | fondo de trabajo y tarjetas |
| Fondo estructural | `--abb-gray-10` | `#F5F5F5` | lienzo de aplicacion |
| Borde | `--abb-gray-30` | `#D1D1D1` | divisores y controles neutros |
| Borde fuerte | `--abb-gray-50` | `#A6A6A6` | estados hover y tablas |
| Exito | `--abb-success` | `#107C10` | estado correcto o conectado |
| Advertencia | `--abb-warning` | `#8A4B00` | condicion que requiere revision |
| Error | `--abb-danger` | `#C50F1F` | error, bloqueo o peligro |
| Foco | `--abb-focus` | `#0067B1` | anillo de foco de alto contraste |

Los tonos semanticos de exito, advertencia, error y foco no son colores de
marca ABB. Se conservan para comunicar estados de manera accesible y familiar.

### Reglas de contraste

- Texto normal: ratio minimo $4.5:1$ contra su fondo.
- Texto grande y controles: ratio minimo $3:1$.
- Nunca usar texto rojo ABB sobre blanco para contenido normal: el contraste no
  alcanza el minimo para texto pequeno. Usar negro como texto y reservar el rojo
  para superficies, bordes, iconos o texto de tamano grande validado.
- El foco debe ser visible en todos los fondos, incluido un boton primario rojo.

## Mapeo a Fluent UI v9

La aplicacion ya usa `FluentProvider` y `createLightTheme`. La capa de marca se
debe construir como una variacion de tema Fluent y los componentes deben seguir
consumiendo tokens semanticos, no valores hexadecimales dispersos en CSS.

| Necesidad ABB | Tokens Fluent preferidos | Regla |
| --- | --- | --- |
| Fondo de aplicacion | `colorNeutralBackground2` | gris estructural, no patron decorativo |
| Superficie y tarjetas | `colorNeutralBackground1`, `colorNeutralBackground1Hover` | blanco con borde neutro |
| Texto | `colorNeutralForeground1`, `colorNeutralForeground2` | negro y gris de tinta |
| Accion primaria ABB | `colorBrandBackground`, `colorBrandBackgroundHover`, `colorBrandForeground1` | rojo ABB con texto blanco validado |
| Seleccion | `colorBrandBackground2`, `colorBrandStroke1` | rojo suave, no un degradado |
| Borde | `colorNeutralStroke1`, `colorNeutralStroke1Hover` | separacion visual clara |
| Foco | `colorStrokeFocus2` | azul accesible, consistente con Fluent |
| Estados | `colorStatusSuccess*`, `colorStatusWarning*`, `colorStatusDanger*` | conservar semantica Fluent |

La implementacion debe ampliar el `BrandVariants` usado por `createLightTheme`
en `app/page.tsx`. Los CSS Modules pueden conservarse, pero solo deben aplicar
variables locales o tokens tematicos; no deben redefinir colores del componente
mediante `!important` salvo una limitacion documentada de Fluent.

## Tipografia

### Recomendacion para la POC

- Usar la tipografia de Fluent UI v9 por defecto (`Segoe UI`, `Segoe UI Web`,
  `Arial`, sans-serif) para controles, datos y texto operativo.
- Usar pesos 400, 600 y 700; reservar mayusculas para etiquetas breves,
  categorias y estados, con espaciado normal.
- Mantener escala compacta: 12 px auxiliar, 14 px cuerpo, 16 px titulo de
  panel, 20-24 px encabezado de pagina. No usar tipografia hero dentro de un
  panel operativo.

### Elemento de marca no Fluent

La identidad editorial de ABB puede emplear una tipografia corporativa propia
en sus piezas de marca. No se debe asumir que esta fuente puede distribuirse o
cargarse sin licencia. Si ABB entrega una fuente autorizada, limitarla a logo,
titulo de producto y comunicaciones de marca; conservar la tipografia Fluent
para la interfaz operativa. Esto evita afectar legibilidad, rendimiento y
coherencia de componentes.

## Componentes y composicion

| Area actual | Direccion ABB | Componente Fluent |
| --- | --- | --- |
| Cabecera azul con olas | franja blanca o negra, logotipo ABB rojo, titulo claro y estado a la derecha | `Toolbar`, `Badge`, `Button` con icono |
| Panel de chat con burbujas | superficie blanca, borde gris, cabecera compacta, mensajes con jerarquia textual | `Card`, `Divider`, `Avatar`, `Text` |
| Composer degradado | entrada neutra y boton rojo solido | `Textarea`, `Button appearance="primary"` |
| Tarjetas de vuelos y camarotes | rejilla de datos con borde, precio y accion; seleccion con borde/tono rojo suave | `Card`, `Button`, `Badge` |
| Selector de fechas | calendario sobre superficie blanca, confirmacion roja | componentes existentes + `Button` Fluent |
| Alertas | mensaje semantico con icono y borde de estado | `MessageBar` o `Toast` Fluent |

### Elementos ABB que no son componentes Fluent

Estos elementos se pueden usar como contenido o capa de marca, no deben
reemplazar controles accesibles de Fluent:

- Logotipo oficial ABB: usar el activo oficial autorizado, sin reconstruirlo con
  texto o CSS.
- Fotografia industrial o de producto: contenido editorial, no fondo de un
  formulario o conversacion.
- Titulares de marca en mayusculas: tratamiento editorial; no para etiquetas,
  campos ni acciones.
- Bloques negros de comunicacion y rojo ABB de gran formato: apropiados para
  banners o contexto de producto, no para el cuerpo del chat.

## Sustituciones concretas en el codigo actual

1. En `app/page.tsx`, sustituir la escala `trasmedBrand` azul por una escala de
   `BrandVariants` roja basada en `--abb-red`.
2. En `app/globals.css`, eliminar la cuadricula azul, los orbes y los gradientes
   ambientales; dejar un fondo neutro `--abb-gray-10`.
3. En `app/page.module.css`, retirar olas, barco y cabecera degradada. Crear una
   cabecera estructural con logo oficial, titulo y `Badge` de estado.
4. En `components/chat/*.module.css`, sustituir los fondos oceano, burbujas y
   azules por superficies neutras, divisores y una sola senal roja para acciones
   y progreso.
5. En `components/travel/**/*.module.css`, reemplazar cada estado seleccionado
   azul por `colorBrandBackground2` y `colorBrandStroke1`; reemplazar los
   botones degradados por el boton primario Fluent.
6. Eliminar gradientes puramente decorativos, animaciones de olas y burbujas.
   Conservar solo `fade` o desplazamientos de 120-200 ms al mostrar contenido.

## Orden de adopcion

1. Definir el tema Fluent ABB y las variables globales semanticas.
2. Convertir cabecera, fondo y composer: son las zonas con mayor percepcion de
   marca.
3. Migrar estados de seleccion y botones en vuelos, pasajeros, fechas y
   camarotes.
4. Sustituir decoracion por una imagen ABB autorizada solo donde aporte contexto.
5. Validar teclado, foco, contraste y los breakpoints de escritorio y movil con
   Playwright.

## Criterios de aceptacion visual

- No quedan olas, burbujas, barco, degradados decorativos ni color azul como
  color de marca.
- Toda accion primaria usa el tema Fluent rojo ABB y mantiene contraste.
- Los estados de error, exito y advertencia siguen siendo semanticos y no se
  confunden con la marca.
- Ningun control interactivo se reconstruye como un `div` o elemento HTML sin
  la semantica que ya ofrece Fluent.
- La fuente corporativa de ABB, si se recibe, esta autorizada y aislada de los
  controles Fluent.