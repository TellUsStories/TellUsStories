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
      '<filter id="t' + id + '" x="0" y="0" width="100%" height="100%">' +
        '<feTurbulence type="fractalNoise" baseFrequency=".5" numOctaves="2" seed="4" result="g"/>' +
        '<feColorMatrix in="g" type="matrix" values="0 0 0 0 .3  0 0 0 0 .1  0 0 0 0 .05  0 0 0 .22 0" result="ga"/>' +
        '<feTurbulence type="fractalNoise" baseFrequency=".008" numOctaves="3" seed="9" result="m"/>' +
        '<feColorMatrix in="m" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 -.3 .14" result="ma"/>' +
        '<feMerge result="x"><feMergeNode in="ga"/><feMergeNode in="ma"/></feMerge>' +
        '<feComposite in="x" in2="SourceAlpha" operator="in" result="xa"/>' +
        '<feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="xa"/></feMerge>' +
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

  // Rayas y Mosaico usan las ilustraciones reales en acuarela (terracota). Para otro color se
  // vuelven a teñir: cada tono de la imagen se lleva al tono equivalente del color elegido.
  var RAIZ = ((document.currentScript && document.currentScript.src) || '').replace(/[^\/]*$/, '');
  var IMAGENES = { 1: 'img/portada-rayas.jpg', 2: 'img/portada-mosaico.jpg' };
  function rgb(h) { var x = parseInt(h.slice(1), 16); return [(x >> 16) & 255, (x >> 8) & 255, x & 255]; }
  function tinte(id, c) {
    if (c.id === 'terracota') return '';
    // Luminosidad de la imagen original → color: rojos (.34), naranjas (.40), rayas (.64), tonos claros (.71), papel (.91)
    var puntos = [[0, c.oscuro], [.34, mezcla(c.base, c.oscuro, .6)], [.42, mezcla(c.base, c.oscuro, .3)], [.64, mezcla(c.base, c.oscuro, .08)], [.72, mezcla(c.base, c.claro, .5)], [.91, PAPEL], [1, '#ffffff']];
    var canales = [[], [], []];
    for (var i = 0; i <= 50; i++) {
      var v = i / 50, k = 1;
      while (k < puntos.length - 1 && puntos[k][0] < v) k++;
      var t = (v - puntos[k - 1][0]) / (puntos[k][0] - puntos[k - 1][0]), a = rgb(puntos[k - 1][1]), b = rgb(puntos[k][1]);
      for (var ch = 0; ch < 3; ch++) canales[ch].push(((a[ch] + (b[ch] - a[ch]) * Math.min(1, Math.max(0, t))) / 255).toFixed(3));
    }
    return '<filter id="k' + id + '" color-interpolation-filters="sRGB">' +
      '<feColorMatrix type="matrix" values=".2126 .7152 .0722 0 0  .2126 .7152 .0722 0 0  .2126 .7152 .0722 0 0  0 0 0 1 0"/>' +
      '<feComponentTransfer><feFuncR type="table" tableValues="' + canales[0].join(' ') + '"/><feFuncG type="table" tableValues="' + canales[1].join(' ') + '"/><feFuncB type="table" tableValues="' + canales[2].join(' ') + '"/></feComponentTransfer>' +
    '</filter>';
  }
  function ilustracion(id, n, c) {
    return tinte(id, c) + '<image href="' + RAIZ + IMAGENES[n] + '" width="' + W + '" height="' + H + '" preserveAspectRatio="none"' + (c.id === 'terracota' ? '' : ' filter="url(#k' + id + ')"') + '/>';
  }

  function rayas(id, nombre, c) {
    var tinta = '#7B7F6F', tam = cabe(nombre, 132, 540, .44);
    return ilustracion(id, 1, c) +
      cartela(96, 386, 640, 342, tinta) +
      '<text x="416" y="528" text-anchor="middle" font-family="Allura, cursive" font-size="92" fill="' + tinta + '">El universo de</text>' +
      '<text x="416" y="' + (640 + tam * .12).toFixed(0) + '" text-anchor="middle" font-family="\'Amatic SC\', cursive" font-weight="700" font-size="' + tam + '" letter-spacing="5" fill="' + tinta + '">' + esc(nombre) + '</text>';
  }

  function mosaico(id, nombre, c) {
    var tam = cabe(nombre.toUpperCase(), 104, 440, .74), tinta = c.id === 'terracota' ? '#BF5138' : c.oscuro;
    return ilustracion(id, 2, c) +
      '<text x="416" y="532" text-anchor="middle" font-family="\'PT Serif\', serif" font-size="70" fill="' + tinta + '">El universo de</text>' +
      '<text x="416" y="' + (606 + tam * .3).toFixed(0) + '" text-anchor="middle" font-family="\'PT Serif\', serif" font-weight="700" font-size="' + tam + '" letter-spacing="2" fill="' + tinta + '">' + esc(nombre.toUpperCase()) + '</text>';
  }

  // Medidas de cada mayúscula en Playfair Display (por 1000 px): ancho de la tinta, margen izquierdo, alto y bajada
  var LETRAS = {"A":[688,16,719,0],"B":[594,-31,719,0],"C":[609,-31,734,16],"D":[688,-31,719,0],"E":[563,-31,719,0],"F":[531,-31,719,0],"G":[656,-47,734,16],"H":[719,-31,719,0],"I":[297,-31,719,0],"J":[359,31,719,203],"K":[672,-31,719,0],"L":[563,-31,719,0],"M":[844,-31,719,16],"N":[656,-31,719,16],"Ñ":[656,-31,922,16],"O":[703,-31,734,16],"P":[578,-31,719,0],"Q":[750,-31,734,203],"R":[672,-31,719,16],"S":[484,-47,734,16],"T":[625,-16,719,0],"U":[656,-16,719,16],"V":[688,16,719,16],"W":[969,16,719,16],"X":[688,0,719,0],"Y":[625,16,719,0],"Z":[531,-31,719,0]};
  function mezcla(a, b, t) {
    var x = parseInt(a.slice(1), 16), y = parseInt(b.slice(1), 16), r = '#';
    [16, 8, 0].forEach(function (s) { var v = Math.round(((x >> s) & 255) * (1 - t) + ((y >> s) & 255) * t); r += (v < 16 ? '0' : '') + v.toString(16); });
    return r;
  }

  function inicial(id, nombre, c) {
    // La primera letra del nombre, sin tilde (Á → A) pero respetando la Ñ
    var l = (nombre.trim().charAt(0) || 'C').toUpperCase();
    if (l !== 'Ñ') l = l.normalize('NFD').charAt(0);
    var m = LETRAS[l] || [650, -31, 719, 0];
    // Que la letra ocupe casi toda la portada (de y=82 a y=1058) sin salirse por los lados;
    // las muy anchas (M, W) se estrechan un poco antes de hacerse más pequeñas
    var alto = 976, anchoMax = 780, fs = alto * 1000 / (m[2] + m[3]), sx = 1;
    var fsW = anchoMax * 1000 / m[0];
    if (fsW < fs) { sx = Math.max(.82, fsW / fs); fs = Math.min(fs, fsW / sx); }
    var tinta = (m[2] + m[3]) * fs / 1000, baseY = 82 + (alto - tinta) / 2 + m[2] * fs / 1000;
    var x0 = -(m[0] / 2 - m[1]) * fs / 1000;
    var letra = '<text x="' + x0.toFixed(1) + '" y="' + baseY.toFixed(1) + '" transform="translate(' + (W / 2) + ' 0) scale(' + sx.toFixed(3) + ' 1)" font-family="\'Playfair Display\', serif" font-weight="600" font-size="' + fs.toFixed(1) + '">' + esc(l) + '</text>';
    // Franjas curvas en tres tonos, como en la acuarela original
    var claro = mezcla(c.base, '#ffffff', .36), medio = c.base, osc = mezcla(c.base, c.oscuro, .72), osc2 = mezcla(c.base, c.oscuro, .35);
    var tamN = cabe(nombre.toUpperCase(), 100, 450, .74);
    return papel(id) +
      '<clipPath id="c' + id + '">' + letra + '</clipPath>' +
      '<g filter="url(#t' + id + ')"><g clip-path="url(#c' + id + ')">' +
        '<rect width="' + W + '" height="' + H + '" fill="' + medio + '"/>' +
        '<circle cx="980" cy="-260" r="820" fill="' + claro + '"/>' +
        '<circle cx="1180" cy="1380" r="760" fill="' + claro + '"/>' +
        '<circle cx="-420" cy="560" r="700" fill="' + osc + '"/>' +
        '<circle cx="-240" cy="1320" r="560" fill="' + osc2 + '"/>' +
        '<circle cx="-660" cy="1500" r="640" fill="' + claro + '" fill-opacity=".55"/>' +
        '<circle cx="1260" cy="420" r="520" fill="' + osc2 + '" fill-opacity=".7"/>' +
      '</g></g>' +
      cartela(144, 428, 544, 286, c.oscuro) +
      '<text x="416" y="548" text-anchor="middle" font-family="\'PT Serif\', serif" font-size="60" fill="' + c.oscuro + '">El universo de</text>' +
      '<text x="416" y="' + (622 + tamN * .32).toFixed(0) + '" text-anchor="middle" font-family="\'PT Serif\', serif" font-weight="700" font-size="' + tamN + '" letter-spacing="1" fill="' + c.oscuro + '">' + esc(nombre.toUpperCase()) + '</text>';
  }

  function svg(estilo, nombre, colorId) {
    var id = ++uid, c = color(colorId), n = String(nombre || 'Carmen').trim() || 'Carmen';
    var dibujo = { 1: rayas, 2: mosaico, 3: inicial }[estilo] || rayas;
    return '<svg class="tus-portada" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Portada: El universo de ' + esc(n) + '">' +
      filtros(id) + dibujo(id, n, c) + (estilo == 3 ? grano(id) : '') + '</svg>';
  }

  window.TUSPortadas = { svg: svg, colores: COLORES, estilos: ESTILOS, color: color };
})();
