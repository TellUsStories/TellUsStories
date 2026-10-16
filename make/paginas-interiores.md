# Páginas interiores a juego con la portada

Cada página interior lleva como marco la acuarela de la portada elegida, encima una hoja de papel con
doble línea en la tinta del diseño, el título manuscrito, una estrella dorada y el texto. La ilustración
usa la paleta de la portada y, si alguien sostiene un libro en la escena, lleva ese mismo estampado.
El montaje lo hace `imprenta.js` (`TUSImprenta.pagina`); las paletas están en `portadas.js`.

## 1. Escenario «Integration Webhooks» → módulo HTTP que llama al generador de páginas (id 129)

En el campo **color**, borrar el `switch(...)` y poner:
```
{{1.portadaColorId}}
```
(el formulario envía ahí el número de portada, 1–8)

## 2. Escenario «Generador de Página Interior» → módulo PiAPI (id 1), campo **prompt**

Buscar esta frase:
```
Soft, bright and varied palette: coral and salmon, warm sand and caramel, mustard yellow, soft sky blue and denim blue, sage green, all on a warm cream paper background (#F9F3E8).
```
y sustituirla por:
```
{{switch(2.color; "1"; "PALETTE, MATCHING THE BOOK COVER CHOSEN: dusty rose, soft raspberry pink and blush pink with touches of sage green, all on a warm cream paper background (#F9F3E8), plus soft natural skin tones, hair colours and light neutrals only where needed. Cushions, blankets, rugs, curtains, bedding and clothes use these colours and, where it feels natural, repeat the cover pattern: a dusty rose and cream watercolour gingham (vichy) check. Any book a character holds or reads has a cover with a dusty rose and cream watercolour gingham (vichy) check."; "2"; "PALETTE, MATCHING THE BOOK COVER CHOSEN: coral red, terracotta and soft olive green, all on a warm cream paper background (#F9F3E8), plus soft natural skin tones, hair colours and light neutrals only where needed. Cushions, blankets, rugs, curtains, bedding and clothes use these colours and, where it feels natural, repeat the cover pattern: a coral red and olive green watercolour floral damask pattern on cream. Any book a character holds or reads has a cover with a coral red and olive green watercolour floral damask pattern on cream."; "3"; "PALETTE, MATCHING THE BOOK COVER CHOSEN: turquoise aqua, raspberry pink and tangerine orange, all on a warm cream paper background (#F9F3E8), plus soft natural skin tones, hair colours and light neutrals only where needed. Cushions, blankets, rugs, curtains, bedding and clothes use these colours and, where it feels natural, repeat the cover pattern: a turquoise, raspberry pink and tangerine orange watercolour tartan plaid. Any book a character holds or reads has a cover with a turquoise, raspberry pink and tangerine orange watercolour tartan plaid."; "4"; "PALETTE, MATCHING THE BOOK COVER CHOSEN: brick red and soft blue-grey with touches of sage green, all on a warm cream paper background (#F9F3E8), plus soft natural skin tones, hair colours and light neutrals only where needed. Cushions, blankets, rugs, curtains, bedding and clothes use these colours and, where it feels natural, repeat the cover pattern: a brick red and soft blue-grey watercolour checkerboard. Any book a character holds or reads has a cover with a brick red and soft blue-grey watercolour checkerboard."; "5"; "PALETTE, MATCHING THE BOOK COVER CHOSEN: mandarin orange and plum purple with touches of warm pink, all on a warm cream paper background (#F9F3E8), plus soft natural skin tones, hair colours and light neutrals only where needed. Cushions, blankets, rugs, curtains, bedding and clothes use these colours and, where it feels natural, repeat the cover pattern: wide mandarin orange and plum purple watercolour stripes. Any book a character holds or reads has a cover with wide mandarin orange and plum purple watercolour stripes."; "6"; "PALETTE, MATCHING THE BOOK COVER CHOSEN: cornflower sky blue and grass green with touches of sunny yellow, all on a warm cream paper background (#F9F3E8), plus soft natural skin tones, hair colours and light neutrals only where needed. Cushions, blankets, rugs, curtains, bedding and clothes use these colours and, where it feels natural, repeat the cover pattern: a cornflower blue and grass green watercolour gingham (vichy) check. Any book a character holds or reads has a cover with a cornflower blue and grass green watercolour gingham (vichy) check."; "7"; "PALETTE, MATCHING THE BOOK COVER CHOSEN: emerald green, deep forest green and pale butter yellow, all on a warm cream paper background (#F9F3E8), plus soft natural skin tones, hair colours and light neutrals only where needed. Cushions, blankets, rugs, curtains, bedding and clothes use these colours and, where it feels natural, repeat the cover pattern: emerald green, deep forest green and pale butter yellow watercolour stripes. Any book a character holds or reads has a cover with emerald green, deep forest green and pale butter yellow watercolour stripes."; "8"; "PALETTE, MATCHING THE BOOK COVER CHOSEN: coral salmon, cobalt blue, emerald green and burgundy, all on a warm cream paper background (#F9F3E8), plus soft natural skin tones, hair colours and light neutrals only where needed. Cushions, blankets, rugs, curtains, bedding and clothes use these colours and, where it feels natural, repeat the cover pattern: a coral salmon, cobalt blue, emerald green and burgundy watercolour checked pattern. Any book a character holds or reads has a cover with a coral salmon, cobalt blue, emerald green and burgundy watercolour checked pattern."; "Soft, bright and varied palette: coral and salmon, warm sand and caramel, mustard yellow, soft sky blue and denim blue, sage green, all on a warm cream paper background (#F9F3E8).")}}
```

## 3. Escenario «Generador de Página Interior» → módulo hcti (id 9), campo **html**

Sustituir todo el html por:
```
<style>body{margin:0}</style><div id="p" style="width:218mm;height:288mm"></div><script src="https://tale-us-stories.netlify.app/portadas.js?v=20261016d"></script><script src="https://tale-us-stories.netlify.app/imprenta.js?v=20261016d"></script><script>var c='{{2.color}}';document.getElementById('p').innerHTML=TUSImprenta.pagina({diseno:/^[1-8]$/.test(c)?c:'',color:c,img:"{{ifempty(8.data.data.output.image_url; first(8.data.data.output.image_urls))}}",titulo:decodeURIComponent("{{encodeURL(trim(replace(substring(2.value; indexOf(2.value; "TITULO:") + 7; indexOf(2.value; "TEXTO:")); newline; space)))}}"),texto:decodeURIComponent("{{encodeURL(trim(replace(substring(2.value; indexOf(2.value; "TEXTO:") + 6; indexOf(2.value; "ILUSTRACION:")); newline; space)))}}")});</script>
```
`google_fonts` (Cormorant Garamond|Dancing Script), `selector` (#p), `device_scale` (3) y `ms_delay` se quedan como están;
conviene subir `ms_delay` a 1500 para que carguen las dos imágenes.

Si `color` no es un número (pedidos antiguos), la página sale como antes, sin marco.
