# WEBFinal_Futbolle UAI - Universidad Abierta Interamericana

## Proyecto Final Individual - Desarrollo y Arquitecturas Web 2026

### Futbolle

Basado en dataset de jugadores (FIFA-style dataset) provisto por la cátedra.

## Reglas

El juego selecciona un jugador de fútbol "secreto" al iniciar la partida, obtenido desde un endpoint provisto por la cátedra. El usuario debe adivinar de qué jugador se trata escribiendo nombres en un campo de búsqueda con autocompletado, también alimentado desde el endpoint.

Por cada intento, el sistema compara los atributos del jugador ingresado contra el jugador secreto y devuelve una pista visual por atributo:

- **Nacionalidad (Nationality):** verde si coincide, rojo si no.
- **Club:** verde si coincide, rojo si no.
- **Posición (Position):** verde si coincide, rojo si no.
- **Edad (Age):** verde si coincide, flecha hacia arriba o abajo si el jugador secreto es mayor o menor.
- **Overall (Puntaje general):** verde si coincide, flecha hacia arriba o abajo si el jugador secreto es mayor o menor.
- **Altura, Height(cm.):** verde si coincide, flecha hacia arriba o abajo si el jugador secreto es más alto o más bajo.

El jugador gana si adivina el nombre correcto dentro de los 8 intentos. Si agota los intentos sin acertar, pierde y se revela el jugador secreto.

## Endpoints

La cátedra provee dos endpoints que exponen el dataset de jugadores:

### Búsqueda de Jugadores

**GET:** `https://futbolle-daw-uai-2026.onrender.com/api/players/search?q={nombre}&limit=8`
Devuelve jugadores cuyo nombre coincide parcialmente (contains, case-insensitive) con `q`. Se usa para alimentar el autocompletado del input de búsqueda. Si `q` tiene menos de 2 caracteres, devuelve `[]`. El parámetro `limit` acepta valores entre 1 y 25 (por defecto 8).

### Jugador Aleatorio

**GET:** `https://futbolle-daw-uai-2026.onrender.com/api/players/random`
Devuelve un jugador aleatorio completo. Se usa para obtener el jugador secreto al iniciar cada partida.

Ambos endpoints devuelven el/los jugador/es con la misma estructura:

```json
{
  "id": 158023,
  "name": "L. Messi",
  "age": 35,
  "photo": "https://cdn.sofifa.net/players/158/023/23_60.png",
  "nationality": "Argentina",
  "flag": "https://cdn.sofifa.net/flags/ar.png",
  "overall": 91,
  "potential": 91,
  "club": "Paris Saint-Germain",
  "clubLogo": "https://cdn.sofifa.net/teams/73/30.png",
  "value": 54000000,
  "wage": 195000,
  "preferredFoot": "Left",
  "position": "RW",
  "heightCm": 169,
  "weightLbs": 158.76,
  "bestOverallRating": 0
}
```

_Respuesta Esperada:_

- **Foto del jugador:** ![Foto del jugador](https://cdn.sofifa.net/players/158/023/23_60.png)
- **Bandera de Nacionalidad:** ![Bandera de Nacionalidad](https://cdn.sofifa.net/flags/ar.png)
- **Logo del Club:** ![Logo del Club](https://cdn.sofifa.net/teams/73/30.png)

Como ambos endpoints devuelven el objeto completo del jugador, la comparación entre el intento y el jugador secreto (nacionalidad, club, posición, edad, overall, altura) debe resolverse en el frontend con JavaScript, ya que el backend no expone un endpoint separado de "adivinar". Toda comunicación con el endpoint debe hacerse con fetch, nunca hardcodeando el dataset dentro del proyecto.

## Requerimientos Obligatorios

- Código prolijo y estricto (HTML5, CSS3 y ES5).
- El proyecto deberá estar deployado y accesible públicamente mediante GitHub Pages, con el link funcionando correctamente al momento de la entrega.
- Consistencia en comentarios, commits y estilos de código.
- Responsividad y estética del juego y la web (usando Flexbox).
- No deberá tener código bloqueante (uso de alert). Utilizar modales en lugar de alert.
- Juego completamente funcional para un jugador debiendo ingresar nombre del jugador al iniciar la partida, validando como mínimo 3 letras para el nombre.
- Al iniciar cada partida se debe solicitar al endpoint un jugador secreto aleatorio.
- El tablero de intentos debe generarse dinámicamente con JavaScript.
- Input de búsqueda con autocompletado dinámico, generado con JavaScript, contra la lista de nombres obtenida del endpoint.
- El jugador debe poder:
  - Escribir y seleccionar un nombre de jugador desde el autocompletado para registrar un intento.
  - Ver, por cada intento, el feedback visual (colores y flechas) de cada atributo comparado.
- Si el jugador acierta el nombre del jugador secreto, gana automáticamente y se muestra un mensaje de victoria indicando la cantidad de intentos utilizados.
- Si el jugador agota los 8 intentos sin acertar, pierde automáticamente y se muestra un mensaje revelando el jugador secreto.
- No se debe permitir repetir un mismo nombre como intento dentro de la misma partida.
- No se debe permitir registrar un intento vacío o con un nombre que no exista en el dataset.
- Mostrar el contador de intentos restantes, actualizado luego de cada intento.
- Mostrar temporizador desde que comienza el juego (primer intento) hasta que termina la partida.
- Opción para reiniciar la partida (nuevo jugador secreto) sin recargar la página.
- Validación de inputs y manejo de errores (por ejemplo, fallas de red al consultar el endpoint deben mostrarse en un modal, sin romper la ejecución del juego).
- Crear una página de Contacto, con un formulario que permita ingresar nombre, mail y mensaje, y al enviar se abra la herramienta de envío de emails predeterminada del sistema operativo.
- Validaciones del formulario de contacto con JavaScript (no con HTML) (nombre alfanumérico, mail válido y mensaje con más de 5 caracteres).
- Agregar un link a la página de Github donde se alojó el código del juego, que al apretarlo se abra en una nueva pestaña.

## Requerimientos Deseados

- Accesibilidad: modo oscuro y modo claro.
- Agregar sonido libremente. Ejemplo: al acertar un atributo, al ganar o al perder la partida.
- Guardar los resultados de cada partida usando LocalStorage, recordando el nombre del jugador humano, resultado (ganó/perdió), cantidad de intentos, fecha y hora y duración de la partida.
- Agregar un botón para mostrar un popup (modal) con la lista de partidas jugadas, jugadores, resultados, intentos y duraciones.
- Agregar la opción de ordenar el historial por fecha o por cantidad de intentos.
- Pista adicional: mostrar la foto (Photo) del jugador secreto desenfocada, revelándose progresivamente con cada intento fallido.
- Selector de nivel de dificultad, limitando la cantidad de atributos que se muestran como pista (por ejemplo, modo difícil sin pista de Club).
- Selector de nivel de dificultad, modificando el tipo y cantidad de pistas disponibles:
  - **Fácil:** se muestra la foto del jugador secreto desenfocada (blur), y se va desenfocando progresivamente con cada intento fallido, además de las pistas de atributos habituales.
  - **Medio:** no se muestra la foto. En su lugar, se van revelando de a poco cualidades del jugador (por ejemplo, altura, edad, overall) a medida que se agotan intentos, aunque no se hayan adivinado.
  - **Difícil:** sin pistas adicionales de ningún tipo (ni foto ni revelado progresivo). El jugador debe adivinar únicamente a partir del feedback (colores y flechas) que generan los propios intentos que va cargando.
- Sistema de puntuación: al ganar la partida se calcula un puntaje = (puntos base según dificultad) - (intentos usados - 1) x 10 + bonus por tiempo. Puntos base: Fácil 60, Medio 80, Difícil 100. Se restan 10 puntos por cada intento usado además del primero. Bonus por tiempo: +20 si se ganó en menos de 60 segundos, +10 si se ganó en menos de 120 segundos, +0 en cualquier otro caso. Si el jugador pierde, el puntaje registrado es 0. El puntaje mínimo en una partida ganada es 10.

En los puntos anteriores los requerimientos obligatorios son básicos para aprobar (Nota 4). Los requerimientos deseados son opcionales y suman a la nota, siendo que si cumplen con todos los puntos a la perfección tendrán nota 10 (diez).

## Condiciones mínimas para una correcta entrega

### Tipo de nomenclaturas:

- **Pascal Case:** `SomeName`
- **Camel Case:** `someName`
- **Snake Case:** `some_name`
- **Kebab Case:** `some-name`

### Git/Github

- Los commits deben contar el paso a paso que se realizó. Si leo los mensajes de los commits entiendo cómo se construyó el proyecto.
- No hay una cantidad de commits correcta, pero no tiene sentido tener pocos commits.
- No sirve de nada poner comentarios como "Fixes", "Progress", "Changes". Los comentarios deben reflejar el cambio realizado en términos del progreso para el proyecto.
- El comentario del commit debe ser corto y claro.

### Archivos y carpetas

- El repositorio debe tener un Readme claro, con la información necesaria del proyecto y bien formateado.
- Los archivos imágenes, css y js deben estar guardados en las carpetas correspondientes.
- Los nombres de archivos y carpetas deben mantener un estilo de nombre, por ejemplo, CamelCase o Kebab Case.
- Utilizar un archivo `.gitignore` es una buena práctica para evitar subir archivos ocultos del sistema operativo (`.vscode`, `.DS_Store`, `.thumbnails`, etc).

### HTML

- Siempre definir el Doctype, meta tag de viewport, título y charset.
- Siempre agregar un archivo css para normalizar los estilos cross browser (ej. `reset.css`).
- Nunca usar elementos `<br>` para separar líneas, se puede lograr desde código CSS y es mejor.
- Las referencias a JavaScript pueden ser agregadas al final del elemento `<body>` o al final del elemento `<head>` manejando el evento `onLoad` del DOM.
- Nunca usar estilos en línea.
- Nunca usar javascript en línea.
- Los nombres de ids y de clases deben mantener consistencia, o se utiliza CamelCase, o se utiliza Kebab Case.
- La indentación debe ser perfecta, no mezclar espacios con tabs. SIEMPRE revisar cómo queda el archivo indentado en Github dado que en el IDE de su propia computadora puede parecer diferente. Se evalúa el código en Github, no el de su computadora.
- No dejar líneas en blanco.
- No dejar comentarios innecesarios.

### CSS

- Utilizar siempre flexbox, nada de grid ni float.
- Utilizar siempre el mismo estilo de color, Hexadecimal, rgb o con palabras, pero no una mezcla.
- Utilizar unidades de medidas consistentes, px, rem, %, vw, etc. No es necesario usar siempre la misma unidad, pero se debe ser consciente de cuándo y por qué se usa cada una.
- En un selector compuesto, cuando tiene un selector de ID, todo lo que está antes del `#` no es tomado en cuenta y debería borrarse.
- Las reglas deben estar ordenadas por selectores, primero los selectores de elementos, luego los de pseudoelementos, luego los selectores de clase, de id, y selectores compuestos, por orden de aparición en el html.
- Los media queries deben ir siempre al final del código.
- Ser muy consciente de las reglas y propiedades que se pisan usando media queries.
- Ordenar las propiedades dentro de las reglas, por ejemplo, se pueden ordenar alfabéticamente, o mejor aún si se ordenan así: primero display y position, luego las propiedades de flex (si aplica), luego las propiedades del box model, luego background, luego propiedades de texto, luego fuentes y por último el resto de las propiedades.
- La indentación dentro de las reglas y dentro de los medios queries debe ser perfecta, no mezclar espacios con tabs. SIEMPRE revisar cómo queda el archivo indentado en Github.
- No dejar líneas en blanco.
- No dejar comentarios innecesarios.

### JavaScript

- Siempre usar código estricto agregando `'use strict'` al principio del archivo.
- No usar `let`, `const`, `() => {}` ni ningún otro tipo de sintaxis de ES6 para el final de LPPA.
- No mezclar comillas dobles y comillas simples, o se usa siempre una o siempre la otra.
- Si se pone `;` al final de una sentencia, usar `;` en todas, o en ninguna.
- Si se crean funciones anónimas y se guardan en variables, hacerlo siempre así, de lo contrario usar siempre funciones nominadas.
- Para las operaciones de comparación por igualdad usar siempre `===` y `!==`.
- La sintaxis del `if else` y de los bucles `for` debe ser siempre igual.
- Se deben declarar todas las variables globales al principio del archivo, y las locales deben declararse al principio de cada función.
- Manejar todos los eventos desde JavaScript con la propiedad `addEventListener` de objetos del DOM.
- Evitar crear funciones anónimas directamente como callbacks, es mejor extraer el código de la función fuera del callback y guardarlo en una variable.
- Ordenar las funciones según su aparición, es decir, si una función X dentro de su código llama a la función Y, entonces Y debe ser declarada antes que X.
- Es una buena práctica separar el archivo JS en archivos más pequeños, agrupando las funciones según sus características (manejadores de evento, core del juego, llamadas al endpoint, inicializadores del DOM, etc).
- Evitar inyectar HTML desde JavaScript, siempre que sea posible tener el HTML ya escrito en el archivo HTML correspondiente, con una clase que le aplique la regla css `display: none;` y luego cambiar la clase desde JavaScript para que aparezca o desaparezca según corresponda.
- La indentación debe ser perfecta, no mezclar espacios con tabs. SIEMPRE revisar cómo queda el archivo indentado en Github.
- No dejar líneas en blanco.
- No dejar comentarios innecesarios.

### General

- No mezclar código en inglés y en español. Escribir todo el proyecto en español, o todo en inglés.
- El proyecto deberá entregarse vía mail y WhatsApp con un máximo de 7 días de anticipación a la mesa final, con el fin de realizar una validación previa y las correcciones que sean necesarias.
- Contacto para consultas: mail `Tomas.ariaskarle@uai.edu.ar` - WhatsApp: `3413598175`
- Todo trabajo entregado fuera de este plazo no será tenido en cuenta.
