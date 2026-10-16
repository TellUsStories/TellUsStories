// Plantillas de impresión de Tale Us Stories (Gelato, fotolibro 21 × 28 cm).
// Todo se mide en milímetros: hcti las renderiza a ~300 ppp y Make las junta en el PDF de imprenta.
// Necesita portadas.js (la portada delantera es la misma que se ve en la web y en el formulario).
(function () {
  var SANGRADO = 4;                       // Gelato pide 4 mm de sangrado por cada lado
  var PAG = { w: 210 + 2 * SANGRADO, h: 280 + 2 * SANGRADO };
  var PAPEL = '#F9F3E8', TINTA = '#3D2B1F';

  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  // ---------- Página interior (218 × 288 mm con sangrado) ----------
  // texto puede llevar <span class="hl">…</span> (lo escribe Claude). Sin título ni texto = página de solo ilustración.
  function pagina(o) {
    var color = o.color || '#C4622D', conTexto = !!(o.titulo || o.texto);
    // La ilustración va SIEMPRE entera (contain): nunca se recorta ni se tapa. Se pide a la IA en 3:4,
    // casi la misma proporción que la página, y con el fondo color papel, así que encaja sin bordes.
    var h = '<style>.tus-pag .hl{color:' + color + ';font-weight:600}</style>' +
      '<div class="tus-pag" style="position:relative;overflow:hidden;width:' + PAG.w + 'mm;height:' + PAG.h + 'mm;background:' + PAPEL + '">' +
      '<img src="' + esc(o.img) + '" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;object-position:center bottom">';
    if (conTexto) {
      // El texto va encima, en la parte de arriba que la ilustración deja despejada (sin franjas que tapen el dibujo).
      // Queda lejos del corte y del lomo.
      h += '<div style="position:absolute;left:0;top:0;width:100%;height:36%;box-sizing:border-box;padding:24mm 20mm 4mm;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center">' +
          '<div style="font-family:\'Dancing Script\',cursive;font-size:15.2mm;line-height:1.1;color:' + color + ';margin-bottom:4mm">' + esc(o.titulo) + '</div>' +
          '<p style="font-family:\'Cormorant Garamond\',serif;font-size:7.9mm;line-height:1.55;color:' + TINTA + ';margin:0">' + (o.texto || '') + '</p>' +
        '</div>';
    }
    return h + '</div>';
  }

  // ---------- Portada abierta: contraportada + lomo + portada ----------
  // m = respuesta de Gelato /cover-dimensions (mm). Tapa dura: wraparoundInsideSize = hoja entera;
  // tapa blanda: bleedSize = hoja entera. Las zonas visibles son contentBackSize, spineSize y contentFrontSize.
  function hoja(m) {
    var a = m.wraparoundInsideSize || m.bleedSize;
    if (a) return { width: a.width, height: a.height };
    var f = m.contentFrontSize;
    return { width: f.left + f.width + m.contentBackSize.left, height: f.top + f.height + m.contentBackSize.top };
  }

  function portada(m, o) {
    var H = hoja(m), c = TUSPortadas.color(o.color), F = m.contentFrontSize, B = m.contentBackSize, S = m.spineSize;
    var nombre = String(o.nombre || '').trim() || 'Carmen';
    // Delantera: el dibujo de la web, centrado en la parte visible y un poco más grande (5 mm de margen
    // por si el corte o el doblado se mueven). Debajo, el mismo dibujo ampliado rellena lo que se dobla.
    // Cada cara (delantera y trasera) lleva el mismo dibujo del estilo elegido: en la trasera, sin el título.
    var ratio = 1176 / 832;
    // Dónde va el dibujo (832 × 1176) en cada cara: centrado y 5 mm más grande que la parte visible.
    // En «Mosaico» el dibujo ya trae su respiro alrededor de las baldosas (portadas.js), así que va
    // justo al tamaño de la cara visible: arriba, abajo y a los lados queda el mismo margen que en la web.
    function colocacion(A) {
      var w = A.width + 10, h = w * ratio;
      if (h < A.height + 10) { h = A.height + 10; w = h / ratio; }
      var x = A.left + A.width / 2 - w / 2, y = A.top + A.height / 2 - h / 2;
      if (o.estilo == 2) { w = A.width; h = A.height; x = A.left; y = A.top; }
      return { w: w, h: h, x: x, y: y, kx: w / 832, ky: h / 1176 };
    }
    function cara(A, x0, x1, fondo) {
      var L = colocacion(A), w = L.w, h = L.h;
      var cx = L.x + w / 2, cy = L.y + h / 2;
      var wF = Math.max(2 * (x1 - cx), 2 * (cx - x0)) + 4, hF = Math.max(wF * ratio, 2 * Math.max(cy, H.height - cy) + 4);
      wF = Math.max(wF, hF / ratio);
      // En «Mosaico» el dibujo se ajusta a la cara exacta (se estira menos de un 1 %, no se nota)
      function dibujo() {
        var s = TUSPortadas.svg(o.estilo || 1, nombre, o.color, fondo);
        return o.estilo == 2 ? s.replace('<svg ', '<svg preserveAspectRatio="none" ') : s;
      }
      // Fondo del mismo papel que el dibujo (#F6EFE5) para que no se note dónde acaba
      return '<div style="position:absolute;left:' + x0 + 'mm;top:0;width:' + (x1 - x0) + 'mm;height:' + H.height + 'mm;overflow:hidden;background:#F6EFE5">' +
        // Solo «Rayas» rellena lo que se dobla con el dibujo difuminado; en «Mosaico» e «Inicial»
        // quedaría una sombra de baldosas o de la letra: ahí basta el papel liso
        (o.estilo == 2 || o.estilo == 3 ? '' : '<div style="position:absolute;left:' + (cx - x0 - wF / 2) + 'mm;top:' + (cy - hF / 2) + 'mm;width:' + wF + 'mm;height:' + hF + 'mm;filter:blur(1.5mm)">' + dibujo() + '</div>') +
        '<div style="position:absolute;left:' + (cx - x0 - w / 2) + 'mm;top:' + (cy - h / 2) + 'mm;width:' + w + 'mm;height:' + h + 'mm">' + dibujo() + '</div>' +
      '</div>';
    }
    var del = cara(F, S.left + S.width, H.width, false);

    // Lomo: sigue el diseño de la portada (rayas, baldosas o papel) y lleva el título en vertical,
    // de arriba abajo, sobre una tirita de papel para que se lea bien.
    var tintaLomo = o.estilo == 1 ? '#7B7F6F' : c.oscuro;
    var lomoTxt = S.width >= 5 ? '<div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) rotate(90deg);white-space:nowrap;background:' + PAPEL + ';padding:' + (S.width * .14).toFixed(2) + 'mm ' + (S.width * .9).toFixed(2) + 'mm;font-family:\'PT Serif\',serif;font-size:' + (S.width * .42).toFixed(2) + 'mm;line-height:1;letter-spacing:.3mm;color:' + tintaLomo + '">El universo de <b>' + esc(nombre) + '</b></div>' : '';
    var lomoFondo;
    if (o.estilo == 2) {
      // Columna de baldosas pequeñas con los tonos del mosaico, con el mismo respiro arriba y abajo
      var lado = S.width - 1.6, paso = lado + 1.4, n = Math.floor((H.height - 2 * (S.top + 6)) / paso);
      var tonos = [c.oscuro, c.claro, c.base, c.claro], baldosas = '';
      for (var i = 0; i < n; i++) baldosas += '<div style="position:absolute;left:.8mm;top:' + (S.top + 6 + i * paso + ((H.height - 2 * (S.top + 6)) - n * paso + 1.4) / 2).toFixed(2) + 'mm;width:' + lado.toFixed(2) + 'mm;height:' + lado.toFixed(2) + 'mm;border-radius:' + (lado * .18).toFixed(2) + 'mm;background:' + tonos[i % 4] + ';opacity:.85"></div>';
      lomoFondo = '<div style="position:absolute;left:1mm;top:0;width:' + S.width + 'mm;height:100%">' + baldosas + '</div>';
    } else if (o.estilo == 3) {
      lomoFondo = '';
    } else {
      // Las rayas siguen por el lomo: el mismo dibujo de las tapas, usando una franja del lateral
      // (x ≈ 50 de 832) para que no se cuele el marco del título que trae pintado en el centro
      var LR = colocacion(B);
      lomoFondo = '<div style="position:absolute;left:' + ((S.width + 2) / 2 - 50 * LR.kx) + 'mm;top:' + LR.y + 'mm;width:' + LR.w + 'mm;height:' + LR.h + 'mm">' + TUSPortadas.svg(1, nombre, o.color, true) + '</div>';
    }
    var lomo = '<div style="position:absolute;left:' + (S.left - 1) + 'mm;top:0;width:' + (S.width + 2) + 'mm;height:' + H.height + 'mm;overflow:hidden;background:#F6EFE5">' + lomoFondo + lomoTxt + '</div>';

    // Contraportada: el mismo dibujo que delante y, encima, un recuadro de papel con la dedicatoria
    // que escribe quien regala el libro, su firma y el logo de Tale Us Stories en el color de la portada.
    // Abajo a la izquierda Gelato imprime su código: el recuadro queda por encima de esa zona.
    var ded = String(o.dedicatoria || '').trim(), tam = ded.length > 260 ? 5.4 : ded.length > 170 ? 6.1 : 7;
    // Misma tinta que el recuadro del título de delante; el logo, en el color de la portada
    var tinta = o.estilo == 1 ? '#7B7F6F' : (o.estilo == 2 && c.id === 'terracota') ? '#BF5138' : c.oscuro;
    var logo = '<div style="display:inline-block;text-align:left;font-family:\'Bricolage Grotesque\',\'Arial Black\',sans-serif;font-weight:800;font-size:5.2mm;letter-spacing:.7mm;line-height:1.05;text-transform:uppercase;color:' + c.oscuro + '">Tale Us<br>Stories' +
      '<span style="display:block;width:9.7mm;height:1.05mm;border-radius:.7mm;background:' + c.base + ';margin-top:1.7mm"></span></div>';
    // Mismo ancho que el recuadro del título de delante (77 % de la cara) y alto según lo que ocupe la dedicatoria;
    // centrado un poco por encima de la mitad para dejar libre la zona del código de Gelato.
    // El recuadro ocupa el mismo sitio que el título de delante (medidas del dibujo de 832 × 1176).
    // En «Rayas» la acuarela ya trae el marco pintado, así que tiene que quedar justo encima.
    var zona = { 1: [96, 386, 640, 342], 2: [180, 433, 472, 324], 3: [144, 428, 544, 286] }[o.estilo] || [96, 386, 640, 342];
    var LB = colocacion(B);
    var recW = zona[2] * LB.kx, recX = LB.x + zona[0] * LB.kx;
    var recY = LB.y + (zona[1] + zona[3] / 2) * LB.ky, recH = zona[3] * LB.ky;
    var tras = cara(B, 0, S.left - 1, true) +
      '<div style="position:absolute;left:' + recX + 'mm;top:' + recY + 'mm;transform:translateY(-50%);width:' + recW + 'mm;min-height:' + recH + 'mm;display:flex;background:' + PAPEL + ';box-sizing:border-box;padding:3.4mm">' +
        '<div style="flex:1;display:flex;box-sizing:border-box;border:.75mm solid ' + tinta + ';padding:1.4mm">' +
          '<div style="flex:1;box-sizing:border-box;border:.3mm solid ' + tinta + ';padding:11mm 11mm 9mm;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center">' +
            '<p style="font-family:\'Cormorant Garamond\',serif;font-style:italic;font-size:' + tam + 'mm;line-height:1.5;color:' + TINTA + ';margin:0;white-space:pre-line">' + esc(ded) + '</p>' +
            (o.firma ? '<div style="font-family:\'Dancing Script\',cursive;font-size:8.5mm;color:' + tinta + ';margin-top:4mm">' + esc(o.firma) + '</div>' : '') +
            '<div style="width:16mm;height:.3mm;background:' + tinta + ';opacity:.5;margin:7mm 0 6mm"></div>' +
            logo +
          '</div>' +
        '</div>' +
      '</div>';

    return '<style>.tus-portada-abierta svg{display:block;width:100%;height:100%}</style>' +
      '<div class="tus-portada-abierta" style="position:relative;overflow:hidden;width:' + H.width + 'mm;height:' + H.height + 'mm;background:' + PAPEL + '">' + tras + lomo + del + '</div>';
  }

  // Medidas de ejemplo (respuesta de Gelato para la tapa dura de 21 × 28). Las reales se piden a la API con el nº de páginas.
  var EJEMPLO_TAPA_DURA = {
    wraparoundInsideSize: { width: 468, height: 325, left: 0, top: 0, thickness: 17 },
    wraparoundEdgeSize: { width: 434, height: 291, left: 17, top: 17, thickness: 3 },
    contentBackSize: { width: 203, height: 285, left: 20, top: 20 },
    jointBackSize: { width: 8, height: 285, left: 223, top: 20 },
    spineSize: { width: 6, height: 285, left: 231, top: 20 },
    jointFrontSize: { width: 8, height: 285, left: 237, top: 20 },
    contentFrontSize: { width: 203, height: 285, left: 245, top: 20 }
  };

  window.TUSImprenta = { pagina: pagina, portada: portada, hoja: hoja, PAG: PAG, SANGRADO: SANGRADO, EJEMPLO_TAPA_DURA: EJEMPLO_TAPA_DURA };
})();
