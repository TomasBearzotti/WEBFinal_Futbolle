# ⚽ Futbolle - Juego de Adivinanza de Jugadores

**Futbolle** es un juego web interactivo desarrollado como Proyecto Final Individual para la materia Desarrollo y Arquitecturas Web 2026 (UAI). Está inspirado en mecánicas tipo Wordle, utilizando un dataset real de jugadores estilo FIFA consumido a través de una API externa.

---

## 🎮 ¿Cómo jugar?
1. Al iniciar la partida, el sistema elige un **Jugador Secreto** al azar.
2. Ingresá tu nombre para comenzar.
3. Usá el buscador con **autocompletado dinámico** para intentar adivinar al jugador.
4. Por cada intento, el tablero te dará feedback visual:
   * 🟩 **Verde:** El atributo coincide exactamente.
   * 🟥 **Rojo:** El atributo no coincide.
   * ▲ / ▼ **Flechas:** Para Edad, Overall y Altura, indica si el jugador secreto es mayor/menor o más alto/bajo.
5. ¡Tenés **8 intentos** para adivinar el nombre correcto antes de que se revele el secreto!

---

## ✨ Características y Requerimientos Cumplidos

El proyecto cumple con la totalidad de los requerimientos obligatorios y deseados de la cátedra:

### 🚀 Obligatorios
* **Arquitectura Estricta:** HTML5 semántico, CSS3 (Flexbox) y JavaScript (ES5 estricto).
* **Consumo de API (Fetch):** Comunicación asincrónica contra los endpoints provistos (`/random` y `/search`), sin hardcodear el dataset.
* **Manipulación del DOM:** Generación del tablero y lista de sugerencias de forma dinámica.
* **Validaciones Nativas en JS:** Prevención de intentos vacíos/repetidos, validación de inputs (nombre > 3 caracteres) y manejo de errores de red mediante modales personalizados (cero uso de `alert()`).
* **Página de Contacto:** Formulario validado con JS que abre el cliente de correo del sistema (mailto).

### 🏆 Extras
* 🌗 **Temas:** Soporte completo para Modo Claro y Modo Oscuro.
* 💾 **Persistencia:** Historial de partidas guardado en `LocalStorage`.
* 📊 **Modal de Historial:** Visualización de partidas pasadas con opciones para ordenar por **Fecha** o **Intentos**.
* 🎚️ **Dificultades Dinámicas:**
  * **Fácil:** Muestra la foto del jugador secreto con un efecto `blur()` que se aclara matemáticamente con cada error.
  * **Medio:** Revela atributos progresivamente al fallar.
  * **Difícil:** Juego a ciegas, solo feedback del tablero.
* 💯 **Sistema de Puntuación:** Cálculo de puntos base por dificultad, penalización por intentos y bonus de tiempo.
* 🔊 **Audio:** Efectos de sonido integrados para la victoria y derrota.
* 🖼️ **Imágenes Extra:** Integración de banderas (Nacionalidad) y escudos (Clubes) consumidos desde la API.

---

## 🛠️ Tecnologías Utilizadas
* **HTML5:** Estructura semántica.
* **CSS3:** Flexbox, variables CSS, Media Queries (Responsive Design mobile-first).
* **JavaScript (Vanilla):** ES5 `use strict`, Fetch API, LocalStorage, manipulación asincrónica del DOM.

---

## 👨‍💻 Autor
**Tomás Bearzotti** *Universidad Abierta Interamericana (UAI)* *Desarrollo y Arquitecturas Web - 2026*