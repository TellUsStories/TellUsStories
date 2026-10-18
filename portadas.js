// Las portadas de Tale Us Stories (832 × 1176, el tamaño de las de Make).
// Cada diseño es una acuarela con su color fijo y una etiqueta de papel: la web solo escribe encima
// «El universo de» y el nombre. La contraportada (imprenta.js) usa la misma acuarela con la dedicatoria.
// Lo usan la web (index.html), el formulario, la plantilla de Make y la imprenta.
(function () {
  // delante / detras = etiqueta de papel [x, y, ancho, alto] en el dibujo de 832 × 1176
  // titulo = tinta de «El universo de»; nombreCol = tinta del nombre; lomo = color liso del lomo
  // paleta y estampado: se usan en el prompt de las ilustraciones interiores (en inglés, como el resto del prompt)
  var DISENOS = [
    { n: 1, nombre: 'Vichy rosa', paleta: 'dusty rose, soft raspberry pink and blush pink with touches of sage green', estampado: 'a dusty rose and cream watercolour gingham (vichy) check', titulo: '#935756', nombreCol: '#915453', lomo: '#935756', papel: '#EEE4D8', delante: [89, 302, 654, 539], detras: [96, 306, 641, 522] },
    { n: 2, nombre: 'Floral', paleta: 'coral red, terracotta and soft olive green', estampado: 'a coral red and olive green watercolour floral damask pattern on cream', titulo: '#5F5E46', nombreCol: '#B65749', lomo: '#B65749', papel: '#EEE3D2', delante: [64, 339, 705, 468], detras: [60, 340, 713, 468] },
    { n: 3, nombre: 'Escocés', paleta: 'turquoise aqua, raspberry pink and tangerine orange', estampado: 'a turquoise, raspberry pink and tangerine orange watercolour tartan plaid', titulo: '#BD4756', nombreCol: '#C34958', lomo: '#8E2F42', papel: '#F4E4D2', delante: [83, 314, 666, 486], detras: [89, 316, 653, 476] },
    { n: 4, nombre: 'Ajedrez', paleta: 'brick red and soft blue-grey with touches of sage green', estampado: 'a brick red and soft blue-grey watercolour checkerboard', titulo: '#5D5E52', nombreCol: '#8E3827', lomo: '#8E3827', papel: '#EFE6D5', delante: [59, 318, 714, 478], detras: [66, 324, 700, 469] },
    { n: 5, nombre: 'Rayas mandarina', paleta: 'mandarin orange and plum purple with touches of warm pink', estampado: 'wide mandarin orange and plum purple watercolour stripes', titulo: '#703164', nombreCol: '#D65A25', lomo: '#703164', papel: '#F5E3C9', delante: [54, 311, 725, 486], detras: [54, 314, 723, 483] },
    { n: 6, nombre: 'Vichy verde', paleta: 'cornflower sky blue and grass green with touches of sunny yellow', estampado: 'a cornflower blue and grass green watercolour gingham (vichy) check', titulo: '#3B5738', nombreCol: '#3B5736', lomo: '#3B5738', papel: '#F0E8D6', delante: [62, 306, 708, 504], detras: [68, 310, 697, 496] },
    { n: 7, nombre: 'Rayas verdes', paleta: 'emerald green, deep forest green and pale butter yellow', estampado: 'emerald green, deep forest green and pale butter yellow watercolour stripes', titulo: '#414D28', nombreCol: '#414C28', lomo: '#213325', papel: '#EFEAD7', delante: [57, 326, 719, 461], detras: [60, 328, 712, 457] },
    { n: 8, nombre: 'Cuadros', paleta: 'coral salmon, cobalt blue, emerald green and burgundy', estampado: 'a coral salmon, cobalt blue, emerald green and burgundy watercolour checked pattern', titulo: '#72181D', nombreCol: '#781B20', lomo: '#72181D', papel: '#F6E5D0', delante: [60, 319, 712, 473], detras: [63, 322, 705, 471] },
    { n: 9, nombre: 'Rayas salvia', paleta: 'soft sage green, warm linen beige and natural cream', estampado: 'French ticking stripes in sage green and linen beige on natural cream linen', titulo: '#5B7452', nombreCol: '#4F6A47', lomo: '#8A9C76', papel: '#F3EBDA', delante: [60, 330, 712, 440], detras: [60, 330, 712, 440] },
    { n: 10, nombre: 'Ikat azul', paleta: 'periwinkle blue and olive green on warm cream', estampado: 'a periwinkle blue ikat diamond pattern with small olive green diamonds on cream', titulo: '#5A6B3D', nombreCol: '#55663A', lomo: '#5D74C4', papel: '#F3EBDA', delante: [60, 330, 712, 440], detras: [60, 330, 712, 440] },
    { n: 11, nombre: 'Rayas coral', paleta: 'soft coral, peach and warm cream with touches of grey-green', estampado: 'thin hand-painted coral watercolour stripes on cream', titulo: '#7A8674', nombreCol: '#6E7A68', lomo: '#E07A5C', papel: '#F5ECE1', delante: [100, 395, 632, 330], detras: [100, 395, 632, 330] },
    { n: 12, nombre: 'Escocés lavanda', paleta: 'buttery lemon yellow, soft lavender and lilac with touches of fresh lime green', estampado: 'a pastel lemon yellow, lavender and lime green watercolour plaid', titulo: '#7B4B87', nombreCol: '#734581', lomo: '#D9B443', papel: '#F6EEE2', delante: [60, 330, 712, 440], detras: [60, 330, 712, 440] }
  ];
  var W = 832, H = 1176;
  // Las imágenes se piden con la ruta completa de la web (así funcionan también desde Make/hcti)
  var RAIZ = ((document.currentScript && document.currentScript.src) || '').replace(/[^\/]*$/, '');
  // Las dos letras del título. Se cargan aquí por si la página (o la plantilla de Make) no las trae.
  if (!document.querySelector('link[href*="Dancing+Script"]') || !document.querySelector('link[href*="Amatic+SC"]')) {
    var f = document.createElement('link'); f.rel = 'stylesheet';
    f.href = 'https://fonts.googleapis.com/css2?family=Dancing+Script&family=Amatic+SC:wght@700&display=block';
    (document.head || document.documentElement).appendChild(f);
  }

  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  // Tamaño de letra para que nombres largos quepan en el ancho de la etiqueta
  function cabe(texto, max, ancho, factor) { return Math.min(max, Math.floor(ancho / (Math.max(texto.length, 1) * factor))); }

  // Acepta 1–8, «3», «Estilo 3» o «d3». La plantilla de Make pasa el diseño en el tercer argumento
  // (portadaColorId), porque todas las portadas salen por la misma ruta del escenario.
  function diseno(x) {
    var n = parseInt(String(x == null ? '' : x).replace(/\D/g, ''), 10);
    return DISENOS[(n >= 1 && n <= DISENOS.length ? n : 1) - 1];
  }
  // Al cambiar el dibujo de una portada, subir su número aquí: hcti y los navegadores guardan copia de las imágenes
  var VERSION_IMG = { 10: 2 };
  function imagen(d, cara, calidad) {
    return RAIZ + 'img/portadas/' + d.n + (cara === 'detras' ? '-tras' : '') + (calidad ? '-' + calidad : '') + '.jpg' + (VERSION_IMG[d.n] ? '?v=' + VERSION_IMG[d.n] : '');
  }

  // svg(diseño, nombre, [diseñoDeMake], [opciones]): la portada delantera con el título.
  // opciones.calidad: 'mini' (miniaturas), 'hd' (imprenta); por defecto la de la web.
  function svg(estilo, nombre, alt, op) {
    op = op || {};
    var d = diseno(/\d/.test(String(alt || '')) ? alt : estilo), n = String(nombre || 'Carmen').trim() || 'Carmen';
    // op.espejo: la acuarela va dada la vuelta (imprenta), así que el centro de la etiqueta también se refleja
    var e = d.delante, x = op.espejo ? W - e[0] - e[2] / 2 : e[0] + e[2] / 2, nom = n.toUpperCase();
    // El texto nunca puede salirse del marco: «El universo de» ocupa siempre el 70 % del ancho de la etiqueta
    // y el nombre, como mucho el 78 % (textLength lo encaja aunque el navegador use una letra más ancha)
    var tamT = Math.round(e[3] * .2), tamN = cabe(nom, Math.round(e[3] * .38), e[2] * .74, .36);
    var anchoT = Math.round(e[2] * .7), maxN = Math.round(e[2] * .78), estN = nom.length * tamN * .42;
    var ajusteN = estN > maxN ? ' textLength="' + maxN + '" lengthAdjust="spacingAndGlyphs"' : '';
    // Aire entre «El universo de» y el nombre, para que las tildes (Á, É, Í…) no toquen la línea de arriba
    var yT = Math.round(e[1] + e[3] * .37);
    return '<svg class="tus-portada" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Portada ' + esc(d.nombre) + ': El universo de ' + esc(n) + '">' +
      // op.sinImagen: solo el texto (la imprenta pone debajo la acuarela por su cuenta)
      (op.sinImagen ? '' : '<image href="' + imagen(d, 'delante', op.calidad) + '" width="' + W + '" height="' + H + '" preserveAspectRatio="none"/>') +
      '<text x="' + x + '" y="' + yT + '" text-anchor="middle" textLength="' + anchoT + '" lengthAdjust="spacingAndGlyphs" font-family="\'Dancing Script\', cursive" font-weight="400" font-size="' + tamT + '" fill="' + d.titulo + '">El universo de</text>' +
      '<text x="' + x + '" y="' + Math.round(yT + tamN * 1.12) + '" text-anchor="middle" font-family="\'Amatic SC\', cursive" font-weight="700" font-size="' + tamN + '" letter-spacing="2"' + ajusteN + ' fill="' + d.nombreCol + '">' + esc(nom) + '</text>' +
      '</svg>';
  }

  window.TUSPortadas = { svg: svg, disenos: DISENOS, diseno: diseno, imagen: imagen, W: W, H: H };
})();
