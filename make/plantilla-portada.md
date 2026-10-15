# Plantilla de portada para Make (hcti.io)

Una sola plantilla sirve para los tres estilos y los seis colores: dibuja la portada con
`portadas.js` de la web publicada, igual que en «Haz la portada».

Módulos HTTP de hcti del escenario «Integration Webhooks» (rutas Estilo 1, 2 y 3 del router):

**html**
```
<style>body{margin:0}#p svg{display:block;width:832px;height:1176px}</style><div id="p" style="width:832px;height:1176px"></div><script src="https://tale-us-stories.netlify.app/portadas.js"></script><script>document.getElementById('p').innerHTML=TUSPortadas.svg(+('{{1.portadaEstilo}}'.replace(/\D/g,'')||1),decodeURIComponent("{{encodeURL(1.protagonistName)}}"),'{{1.portadaColorId}}');</script>
```

**google_fonts**
```
Allura|Amatic SC:700|PT Serif:400,700|Playfair Display:600
```

**selector**: `#p` · **ms_delay**: `1000`

El formulario envía `portadaEstilo` («Estilo 1|2|3»), `portadaNombre` (Rayas, Mosaico, Inicial),
`portadaColor`, `portadaColorHex` y `portadaColorId` (terracota, rosa, salvia, azul, mostaza, lavanda).
