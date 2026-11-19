# I will wait for GTA 6 PC: bloqueador de spoilers de GTA 6 para Chrome y Firefox

![I will wait for GTA 6 on PC - extensión de Chrome que oculta los spoilers de GTA 6](assets/banner.jpg)

<p align="center">
  <a href="README.md"><img src="assets/lang/en.svg" alt="English" height="36"></a>
  <a href="README.tr.md"><img src="assets/lang/tr.svg" alt="Türkçe" height="36"></a>
  <a href="README.az.md"><img src="assets/lang/az.svg" alt="Azərbaycanca" height="36"></a>
  <a href="README.es.md"><img src="assets/lang/es-active.svg" alt="Español" height="36"></a>
</p>

**Bloqueador de spoilers de GTA 6** para Chrome, Firefox, Edge, Brave y Opera. ¿Esperas a **GTA 6 en PC** y no quieres
que te destripen la versión de consola? Esta extensión gratuita y de código abierto oculta spoilers, tráilers,
filtraciones, detalles de la historia, noticias, vídeos de YouTube, publicaciones de Reddit (r/GTA6) y tuits sobre
**GTA 6 / GTA VI / Grand Theft Auto 6** hasta que estés listo para jugar.

Oculta o elimina todo lo relacionado con GTA 6 en cualquier página web, incluido el contenido que se carga después
(scroll infinito en YouTube, Reddit, X, Google y webs de noticias).

## Instalación (cargar descomprimida)
1. Descarga el zip más reciente desde la página de Releases y descomprímelo (o clona este repositorio).
2. Abre `chrome://extensions` en Chrome.
3. Activa el **Modo de desarrollador** (arriba a la derecha).
4. Haz clic en **Cargar descomprimida** y elige la carpeta que contiene `manifest.json`.
5. Fija la extensión desde el menú de la pieza de puzle para ver el contador en el icono.

Funciona igual en Edge, Brave y Opera.

### Firefox
Instálala desde Firefox Add-ons cuando esté aprobada. Mientras tanto, para probarla de forma temporal:
1. Descarga `i-will-wait-for-gta6-pc-firefox-<versión>.zip` desde la página de Releases.
2. Abre `about:debugging#/runtime/this-firefox` y haz clic en **Cargar complemento temporal...**
3. Elige el archivo zip. (Los complementos temporales se eliminan al reiniciar Firefox.)

Requiere Firefox 128 o posterior.

### Compilar
`node scripts/build.mjs` crea los zips de Chrome y Firefox en `dist/`.

## Qué hace
- Busca las palabras clave en el texto de la página, el texto alternativo de las imágenes, los tooltips, las etiquetas aria y las URL de los enlaces.
- Oculta la publicación, el vídeo, el tuit, el resultado de búsqueda o el elemento de lista completo que contiene la coincidencia.
- Si el propio título de la página coincide (por ejemplo, abres un vídeo de GTA 6), cubre la página y pausa los vídeos.
  Puedes hacer clic en "Mostrar esta página de todos modos".
- También detecta subreddits como `r/GTA6`, `r/GTA6Leaks` y `r/GTAVI`, hashtags como `#GTA6Trailer` y cuentas como `@GTA6News`.
  Al abrir uno de esos subreddits, o cualquier página cuya URL mencione GTA 6, se cubre la página entera. (`r/GTAViceCity` no se bloquea.)
- El contador del icono muestra cuántos elementos se han ocultado en la pestaña actual.

## Ajustes del popup
- **Bloqueo activado/desactivado**
- **Ocultar** (por defecto, reversible) o **Eliminar de la página** (borra los elementos; recarga para recuperarlos).
  Ocultar es más seguro en webs como YouTube y X, que pueden fallar si se borran sus elementos.
- **Cubrir la página entera si el título coincide**
- **Palabras clave**: una por línea. Los espacios también coinciden con `-`, `_` y `.`, así que `GTA 6` detecta `gta-6`. No distingue mayúsculas.
  Solo coincide con palabras completas, así que `GTA VI` no detecta `GTA Vice City`.
- **Modo agresivo**: bloquea todos los juegos de Grand Theft Auto, no solo GTA 6 (GTA V, GTA5, GTA Online, San Andreas, Vice City, Los Santos, r/GTAOnline...).
  Ten en cuenta que también oculta "GTA" a secas, que se usa para otras cosas (por ejemplo, Greater Toronto Area).
- **Pausar en este sitio**
- **Avisarme de nuevas versiones**: muestra un aviso en el popup cuando hay una versión nueva en GitHub.

Palabras clave por defecto: GTA 6, GTA VI, GTA6, GTAVI, Grand Theft Auto 6 / VI / Six, GTA Six, Leonida, Lucia Caminos, Jason Duval.

La interfaz está en español cuando el navegador está en español. También está disponible en inglés, turco y azerí.

## Privacidad
La extensión no recopila ningún dato. La única petición de red es una comprobación opcional de actualizaciones: el popup pregunta a GitHub como mucho cada 12 horas si hay una versión nueva (desactívala con "Avisarme de nuevas versiones"). Tus ajustes se quedan en el almacenamiento de tu navegador. Más detalles: [PRIVACY.md](PRIVACY.md)

## Limitaciones
- El texto dibujado dentro de imágenes o fotogramas de vídeo (miniaturas con "VI" en el arte) no se puede leer; solo se comprueba el texto que lo rodea.
- No se analiza el contenido dentro de shadow DOM cerrado.
