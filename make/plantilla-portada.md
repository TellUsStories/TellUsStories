# Plantilla de portada para Make (hcti.io)

Hay ocho portadas fijas (cada una con su color): 1 Vichy rosa, 2 Floral, 3 Escocés, 4 Ajedrez,
5 Rayas mandarina, 6 Vichy verde, 7 Rayas verdes y 8 Cuadros. Las dibuja `portadas.js` de la web
(acuarela de `img/portadas/` + «El universo de» y el nombre), igual que en «Haz la portada».

**Cómo llegan los datos desde el formulario**
- `portadaEstilo` = `Estilo 1` siempre: todas las portadas salen por la ruta «Estilo 1» del router.
- `portadaColorId` = número del diseño (`1`–`8`): la plantilla lo pasa como tercer argumento y
  `TUSPortadas.svg` elige el diseño con él.
- `portadaDiseno` (número) y `portadaNombre` (p. ej. «Rayas mandarina») son para leerlos en el
  correo y en la hoja de pedidos; `portadaColor` = «Portada 5 · Rayas mandarina».

**html** (el que ya está en los módulos de Estilo 1, 2 y 3; no hay que cambiarlo)
```
<style>body{margin:0}#p svg{display:block;width:832px;height:1176px}</style><div id="p" style="width:832px;height:1176px"></div><script src="https://tale-us-stories.netlify.app/portadas.js"></script><script>document.getElementById('p').innerHTML=TUSPortadas.svg(+('{{1.portadaEstilo}}'.replace(/\D/g,'')||1),decodeURIComponent("{{encodeURL(1.protagonistName)}}"),'{{1.portadaColorId}}');</script>
```
`portadas.js` carga por su cuenta Dancing Script y Amatic SC, así que `google_fonts` puede quedarse como está.
**selector**: `#p` · **ms_delay**: `1000`

Las rutas «Estilo 2», «Estilo 3» y «Estilo 4» del router ya no reciben pedidos y se pueden borrar.
La cubierta completa para la imprenta (contraportada con la dedicatoria, lomo y portada) la monta `imprenta.js`.
