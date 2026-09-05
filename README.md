# Fathom

Sitio estático (HTML, CSS y JavaScript sin dependencias ni build step) que a
simple vista es la página de una empresa de instrumentos de acústica
submarina. Debajo de esa fachada hay una cadena de puzzles ocultos — una
palabra clave, código Morse, una secuencia de calibración y un cifrado César —
que van revelando nuevas secciones de la misma página hasta llegar a un final.

## Estructura

```
index.html
css/
  styles.css
js/
  eventBus.js        Pub/sub (Observer) que desacopla puzzles, estado e interfaz
  stateManager.js    Progreso del ARG (máquina de estados), persistido en localStorage
  audioSynth.js      Tonos generados con Web Audio API, sin archivos de audio
  uiController.js    Revelado de zonas, notificaciones y barra de progreso
  decorativeUI.js    Interacciones cosméticas de la fachada (formulario, onda del hero)
  main.js            Composition root: arma todos los módulos
  puzzles/
    keywordTrigger.js
    morseCode.js
    simonSays.js
    cipherSlider.js
    finalZone.js
```

## Cómo probarlo

Al ser estático, alcanza con abrir `index.html` en el navegador, o servirlo
con cualquier servidor estático (`npx serve`, `python3 -m http.server`, etc.).

## Publicarlo en GitHub Pages

1. Subí el contenido de esta carpeta a un repositorio.
2. En **Settings → Pages**, elegí la rama principal y la carpeta raíz (`/`)
   como fuente. GitHub Pages sirve `index.html` automáticamente.

## Sobre los puzzles

No hay spoilers acá a propósito — la gracia es descubrirlos. El progreso se
guarda en `localStorage`, así que recargar la página no reinicia lo ya
encontrado; hay un botón de reinicio al llegar al final.

## Retemizar

El motor del ARG (`eventBus`, `stateManager`, `uiController`) no depende del
contenido de Fathom: solo busca elementos por `id` y `data-role`. Se puede
cambiar el rubro, el nombre de la empresa o el copy sin tocar el JavaScript.
