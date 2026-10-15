// Las tres portadas de Tale Us Stories, dibujadas en SVG (832 × 1176, el tamaño de las de Make).
// El color lo elige quien hace el libro y en la portada «Inicial» la letra grande sale del nombre.
// Lo usan la web (index.html) y el formulario.
(function () {
  var COLORES = [
    { id: 'terracota', nombre: 'Terracota', base: '#E07A5C', claro: '#F3C9B4', oscuro: '#B24A30' },
    { id: 'rosa', nombre: 'Rosa', base: '#E39AA6', claro: '#F5D2D7', oscuro: '#B25E6D' },
    { id: 'salvia', nombre: 'Verde salvia', base: '#97AB8B', claro: '#D2DCCA', oscuro: '#5D7352' },
    { id: 'azul', nombre: 'Azul', base: '#8EAACB', claro: '#CEDCEA', oscuro: '#4D6C91' },
    { id: 'mostaza', nombre: 'Mostaza', base: '#DDAE55', claro: '#F1DBAB', oscuro: '#9A7226' },
    { id: 'lavanda', nombre: 'Lavanda', base: '#A99AC9', claro: '#DAD2E9', oscuro: '#6A5A94' }
  ];
  var ESTILOS = [
    { n: 1, nombre: 'Rayas' },
    { n: 2, nombre: 'Mosaico' },
    { n: 3, nombre: 'Inicial' }
  ];
  var PAPEL = '#F6EFE5', W = 832, H = 1176, uid = 0;

  function color(id) { for (var i = 0; i < COLORES.length; i++) if (COLORES[i].id === id) return COLORES[i]; return COLORES[0]; }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  // Aleatorio con semilla: la misma portada sale siempre igual
  function azar(s) { return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
  // Tamaño de letra para que nombres largos quepan en el ancho disponible
  function cabe(nombre, max, ancho, factor) { return Math.min(max, Math.floor(ancho / (Math.max(nombre.length, 1) * factor))); }

  // Acuarela: bordes irregulares + manchas de más y menos pigmento + papel con grano
  function filtros(id) {
    return '<defs>' +
      '<filter id="a' + id + '" x="-5%" y="-5%" width="110%" height="110%">' +
        '<feTurbulence type="fractalNoise" baseFrequency=".03" numOctaves="3" seed="' + (id % 97 + 3) + '" result="n1"/>' +
        '<feDisplacementMap in="SourceGraphic" in2="n1" scale="9" xChannelSelector="R" yChannelSelector="G" result="d"/>' +
        '<feTurbulence type="fractalNoise" baseFrequency=".011" numOctaves="4" seed="7" result="n2"/>' +
        '<feColorMatrix in="n2" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1 1.32" result="m"/>' +
        '<feComposite in="d" in2="m" operator="in"/>' +
      '</filter>' +
      '<filter id="p' + id + '" x="0" y="0" width="100%" height="100%">' +
        '<feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="2"/>' +
        '<feColorMatrix type="matrix" values="0 0 0 0 .35  0 0 0 0 .27  0 0 0 0 .2  0 0 0 .09 0"/>' +
      '</filter>' +
    '</defs>';
  }
  function papel(id) { return '<rect width="' + W + '" height="' + H + '" fill="' + PAPEL + '"/>'; }
  function grano(id) { return '<rect width="' + W + '" height="' + H + '" filter="url(#p' + id + ')"/>'; }
  // Recuadro con doble línea para el título
  function cartela(x, y, w, h, tinta) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + PAPEL + '"/>' +
      '<rect x="' + (x + 12) + '" y="' + (y + 12) + '" width="' + (w - 24) + '" height="' + (h - 24) + '" fill="none" stroke="' + tinta + '" stroke-width="2.6"/>' +
      '<rect x="' + (x + 19) + '" y="' + (y + 19) + '" width="' + (w - 38) + '" height="' + (h - 38) + '" fill="none" stroke="' + tinta + '" stroke-width="1.2"/>';
  }

  function rayas(id, nombre, c) {
    var r = azar(11), s = '', tinta = '#7B7F6F';
    for (var x = 20; x < W; x += 43) {
      var w = 12 + r() * 5, pts = [], pts2 = [];
      for (var y = -20; y <= H + 20; y += 70) { var dx = (r() - .5) * 3; pts.push((x + dx) + ',' + y); pts2.unshift((x + dx + w + (r() - .5) * 2) + ',' + y); }
      s += '<polygon points="' + pts.concat(pts2).join(' ') + '" fill="' + c.base + '" fill-opacity="' + (.78 + r() * .22).toFixed(2) + '" stroke="' + c.oscuro + '" stroke-opacity=".25" stroke-width="1.5"/>';
    }
    var tam = cabe(nombre, 124, 500, .44);
    return papel(id) + '<g filter="url(#a' + id + ')">' + s + '</g>' +
      cartela(150, 400, 532, 312, tinta) +
      '<text x="416" y="530" text-anchor="middle" font-family="Allura, cursive" font-size="84" fill="' + tinta + '">El universo de</text>' +
      '<text x="416" y="' + (640 + tam * .1).toFixed(0) + '" text-anchor="middle" font-family="\'Amatic SC\', cursive" font-weight="700" font-size="' + tam + '" letter-spacing="5" fill="' + tinta + '">' + esc(nombre) + '</text>';
  }

  function mosaico(id, nombre, c) {
    var r = azar(5), s = '', sw = 106, sh = 118, g = 14, x0 = 63, y0 = 67;
    for (var fila = 0; fila < 8; fila++) for (var col = 0; col < 6; col++) {
      if (fila > 1 && fila < 6 && col > 0 && col < 5) continue;
      var x = x0 + col * (sw + g), y = y0 + fila * (sh + g), fuerte = (fila + col) % 2 === 0;
      s += '<rect x="' + x + '" y="' + y + '" width="' + sw + '" height="' + sh + '" rx="16" fill="' + (fuerte ? c.base : c.claro) + '" stroke="' + c.oscuro + '" stroke-opacity=".2" stroke-width="2"/>';
      if (fuerte && r() > .35) s += '<rect x="' + x + '" y="' + y + '" width="' + sw + '" height="' + sh + '" rx="16" fill="' + c.oscuro + '" fill-opacity="' + (.15 + r() * .35).toFixed(2) + '"/>';
    }
    var tam = cabe(nombre.toUpperCase(), 100, 440, .74);
    return papel(id) + '<g filter="url(#a' + id + ')">' + s + '</g>' +
      '<text x="416" y="574" text-anchor="middle" font-family="\'PT Serif\', serif" font-size="66" fill="' + c.oscuro + '">El universo de</text>' +
      '<text x="416" y="' + (650 + tam * .3).toFixed(0) + '" text-anchor="middle" font-family="\'PT Serif\', serif" font-weight="700" font-size="' + tam + '" letter-spacing="2" fill="' + c.oscuro + '">' + esc(nombre.toUpperCase()) + '</text>';
  }

  function inicial(id, nombre, c) {
    // La primera letra del nombre, sin tilde (Á → A) pero respetando la Ñ
    var l = (nombre.trim().charAt(0) || 'C').toUpperCase();
    if (l !== 'Ñ') l = l.normalize('NFD').charAt(0);
    var ancha = /[MW]/.test(l), tam = ancha ? 980 : 1320, base = ancha ? 960 : 1100;
    var letra = '<text x="' + (W / 2) + '" y="' + base + '" text-anchor="middle" font-family="\'Playfair Display\', serif" font-weight="600" font-size="' + tam + '">' + esc(l) + '</text>';
    var tamN = cabe(nombre.toUpperCase(), 98, 440, .7);
    return papel(id) +
      '<clipPath id="c' + id + '">' + letra + '</clipPath>' +
      '<g filter="url(#a' + id + ')"><g clip-path="url(#c' + id + ')">' +
        '<rect width="' + W + '" height="' + H + '" fill="' + c.base + '" fill-opacity=".85"/>' +
        '<circle cx="-120" cy="620" r="560" fill="' + c.oscuro + '" fill-opacity=".26"/>' +
        '<circle cx="-260" cy="760" r="470" fill="' + c.oscuro + '" fill-opacity=".32"/>' +
        '<circle cx="980" cy="120" r="420" fill="' + c.oscuro + '" fill-opacity=".18"/>' +
      '</g></g>' +
      cartela(150, 428, 532, 280, c.oscuro) +
      '<text x="416" y="548" text-anchor="middle" font-family="\'PT Serif\', serif" font-size="62" fill="' + c.oscuro + '">El universo de</text>' +
      '<text x="416" y="' + (620 + tamN * .32).toFixed(0) + '" text-anchor="middle" font-family="\'PT Serif\', serif" font-size="' + tamN + '" letter-spacing="2" fill="' + c.oscuro + '">' + esc(nombre.toUpperCase()) + '</text>';
  }

  function svg(estilo, nombre, colorId) {
    var id = ++uid, c = color(colorId), n = String(nombre || 'Carmen').trim() || 'Carmen';
    var dibujo = { 1: rayas, 2: mosaico, 3: inicial }[estilo] || rayas;
    return '<svg class="tus-portada" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Portada: El universo de ' + esc(n) + '">' +
      filtros(id) + dibujo(id, n, c) + grano(id) + '</svg>';
  }

  window.TUSPortadas = { svg: svg, colores: COLORES, estilos: ESTILOS, color: color };
})();
