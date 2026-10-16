// Las ocho portadas de Tale Us Stories (832 × 1176, el tamaño de las de Make).
// Cada diseño es una acuarela con su color fijo y una etiqueta de papel: la web solo escribe encima
// «El universo de» y el nombre. La contraportada (imprenta.js) usa la misma acuarela con la dedicatoria.
// Lo usan la web (index.html), el formulario, la plantilla de Make y la imprenta.
(function () {
  // delante / detras = etiqueta de papel [x, y, ancho, alto] en el dibujo de 832 × 1176
  // titulo = tinta de «El universo de»; nombreCol = tinta del nombre; lomo = color liso del lomo
  var DISENOS = [
    { n: 1, nombre: 'Vichy rosa', titulo: '#935756', nombreCol: '#915453', lomo: '#935756', papel: '#EEE4D8', delante: [116, 326, 600, 494], detras: [119, 326, 595, 485] },
    { n: 2, nombre: 'Floral', titulo: '#5F5E46', nombreCol: '#B65749', lomo: '#B65749', papel: '#EEE3D2', delante: [81, 351, 671, 446], detras: [76, 351, 680, 447] },
    { n: 3, nombre: 'Escocés', titulo: '#BD4756', nombreCol: '#C34958', lomo: '#C34958', papel: '#F4E4D2', delante: [107, 333, 619, 452], detras: [108, 330, 617, 450] },
    { n: 4, nombre: 'Ajedrez', titulo: '#5D5E52', nombreCol: '#8E3827', lomo: '#8E3827', papel: '#EFE6D5', delante: [81, 334, 671, 449], detras: [82, 335, 670, 449] },
    { n: 5, nombre: 'Rayas mandarina', titulo: '#703164', nombreCol: '#D65A25', lomo: '#703164', papel: '#F5E3C9', delante: [77, 328, 679, 455], detras: [76, 330, 681, 455] },
    { n: 6, nombre: 'Vichy verde', titulo: '#3B5738', nombreCol: '#3B5736', lomo: '#3B5738', papel: '#F0E8D6', delante: [92, 330, 647, 461], detras: [92, 330, 647, 461] },
    { n: 7, nombre: 'Rayas verdes', titulo: '#414D28', nombreCol: '#414C28', lomo: '#414D28', papel: '#EFEAD7', delante: [77, 340, 678, 435], detras: [77, 340, 678, 435] },
    { n: 8, nombre: 'Cuadros', titulo: '#72181D', nombreCol: '#781B20', lomo: '#72181D', papel: '#F6E5D0', delante: [78, 333, 676, 449], detras: [79, 333, 673, 449] }
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
  function imagen(d, cara, calidad) {
    return RAIZ + 'img/portadas/' + d.n + (cara === 'detras' ? '-tras' : '') + (calidad ? '-' + calidad : '') + '.jpg';
  }

  // svg(diseño, nombre, [diseñoDeMake], [opciones]): la portada delantera con el título.
  // opciones.calidad: 'mini' (miniaturas), 'hd' (imprenta); por defecto la de la web.
  function svg(estilo, nombre, alt, op) {
    op = op || {};
    var d = diseno(/\d/.test(String(alt || '')) ? alt : estilo), n = String(nombre || 'Carmen').trim() || 'Carmen';
    var e = d.delante, x = e[0] + e[2] / 2, nom = n.toUpperCase();
    // El texto nunca puede salirse del marco: «El universo de» ocupa siempre el 70 % del ancho de la etiqueta
    // y el nombre, como mucho el 78 % (textLength lo encaja aunque el navegador use una letra más ancha)
    var tamT = Math.round(e[3] * .2), tamN = cabe(nom, Math.round(e[3] * .38), e[2] * .74, .36);
    var anchoT = Math.round(e[2] * .7), maxN = Math.round(e[2] * .78), estN = nom.length * tamN * .42;
    var ajusteN = estN > maxN ? ' textLength="' + maxN + '" lengthAdjust="spacingAndGlyphs"' : '';
    // Aire entre «El universo de» y el nombre, para que las tildes (Á, É, Í…) no toquen la línea de arriba
    var yT = Math.round(e[1] + e[3] * .37);
    return '<svg class="tus-portada" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Portada ' + esc(d.nombre) + ': El universo de ' + esc(n) + '">' +
      '<image href="' + imagen(d, 'delante', op.calidad) + '" width="' + W + '" height="' + H + '" preserveAspectRatio="none"/>' +
      '<text x="' + x + '" y="' + yT + '" text-anchor="middle" textLength="' + anchoT + '" lengthAdjust="spacingAndGlyphs" font-family="\'Dancing Script\', cursive" font-weight="400" font-size="' + tamT + '" fill="' + d.titulo + '">El universo de</text>' +
      '<text x="' + x + '" y="' + Math.round(yT + tamN * 1.12) + '" text-anchor="middle" font-family="\'Amatic SC\', cursive" font-weight="700" font-size="' + tamN + '" letter-spacing="2"' + ajusteN + ' fill="' + d.nombreCol + '">' + esc(nom) + '</text>' +
      '</svg>';
  }

  window.TUSPortadas = { svg: svg, disenos: DISENOS, diseno: diseno, imagen: imagen, W: W, H: H };
})();
