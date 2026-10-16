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

  // o = { diseno (1–8; también vale o.estilo), nombre, dedicatoria, firma }
  function portada(m, o) {
    var H = hoja(m), F = m.contentFrontSize, B = m.contentBackSize, S = m.spineSize;
    var d = TUSPortadas.diseno(o.diseno || o.estilo), nombre = String(o.nombre || '').trim() || 'Carmen';
    var ratio = TUSPortadas.H / TUSPortadas.W;
    // Dónde va el dibujo (832 × 1176) en cada cara: centrado y 5 mm más grande que la parte visible,
    // por si el corte o el doblado se mueven un poco.
    function colocacion(A) {
      var w = A.width + 10, h = w * ratio;
      if (h < A.height + 10) { h = A.height + 10; w = h / ratio; }
      return { w: w, h: h, x: A.left + A.width / 2 - w / 2, y: A.top + A.height / 2 - h / 2, k: w / TUSPortadas.W };
    }
    // Una cara (delantera o trasera) de x0 a x1 de la hoja. Debajo, la misma acuarela ampliada y difuminada
    // rellena lo que se dobla hacia dentro, para que no quede ningún borde blanco.
    function cara(A, x0, x1, contenido, fondoImg) {
      var L = colocacion(A), cx = L.x + L.w / 2, cy = L.y + L.h / 2;
      var wF = Math.max(2 * (x1 - cx), 2 * (cx - x0)) + 4, hF = Math.max(wF * ratio, 2 * Math.max(cy, H.height - cy) + 4);
      wF = Math.max(wF, hF / ratio);
      return '<div style="position:absolute;left:' + x0 + 'mm;top:0;width:' + (x1 - x0) + 'mm;height:' + H.height + 'mm;overflow:hidden;background:' + d.papel + '">' +
        '<img src="' + fondoImg + '" style="position:absolute;left:' + (cx - x0 - wF / 2) + 'mm;top:' + (cy - hF / 2) + 'mm;width:' + wF + 'mm;height:' + hF + 'mm;filter:blur(1.5mm)">' +
        '<div style="position:absolute;left:' + (L.x - x0) + 'mm;top:' + L.y + 'mm;width:' + L.w + 'mm;height:' + L.h + 'mm">' + contenido + '</div>' +
      '</div>';
    }
    var imgDel = TUSPortadas.imagen(d, 'delante', 'hd'), imgTras = TUSPortadas.imagen(d, 'detras', 'hd');

    // Delantera: la portada de la web (acuarela + «El universo de» y el nombre en la etiqueta)
    var del = cara(F, S.left + S.width, H.width, TUSPortadas.svg(d.n, nombre, null, { calidad: 'hd' }), imgDel);

    // Lomo: franja lisa del color del diseño con el título en vertical, en blanco (se lee de arriba abajo)
    var lomoTxt = S.width >= 5 ? '<div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) rotate(90deg);white-space:nowrap;font-family:\'PT Serif\',serif;font-size:' + (S.width * .42).toFixed(2) + 'mm;letter-spacing:.3mm;color:#fff">El universo de <b>' + esc(nombre) + '</b></div>' : '';
    var lomo = '<div style="position:absolute;left:' + (S.left - 1) + 'mm;top:0;width:' + (S.width + 2) + 'mm;height:' + H.height + 'mm;background:' + d.lomo + '">' + lomoTxt + '</div>';

    // Contraportada: la misma acuarela con su etiqueta vacía; dentro, la dedicatoria tal cual la escribió
    // quien regala el libro, su firma y el logo de Tale Us Stories en las tintas del diseño.
    var LB = colocacion(B), e = d.detras, k = LB.k;
    var ex = LB.x + (e[0] + 26) * k, ey = LB.y + (e[1] + 26) * k, ew = (e[2] - 52) * k, eh = (e[3] - 52) * k;
    var ded = String(o.dedicatoria || '').trim();
    var logo = '<div style="display:inline-block;text-align:left;font-family:\'Bricolage Grotesque\',\'Arial Black\',sans-serif;font-weight:800;font-size:3.6mm;letter-spacing:.5mm;line-height:1.05;text-transform:uppercase;color:' + d.nombreCol + '">Tale Us<br>Stories' +
      '<span style="display:block;width:7mm;height:.8mm;border-radius:.5mm;background:' + d.nombreCol + ';margin-top:1.2mm"></span></div>';
    var texto = '<div class="tus-ded" style="position:absolute;left:' + ex + 'mm;top:' + ey + 'mm;width:' + ew + 'mm;height:' + eh + 'mm;box-sizing:border-box;padding:4mm 7mm;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;overflow:hidden">' +
        '<p style="font-family:\'Cormorant Garamond\',serif;font-style:italic;font-size:6mm;line-height:1.45;color:' + d.titulo + ';margin:0;white-space:pre-line">' + esc(ded) + '</p>' +
        '<div style="width:14mm;height:.3mm;background:' + d.titulo + ';opacity:.5;margin:3.5mm 0 2.5mm"></div>' +
        (o.firma ? '<div style="font-family:\'Dancing Script\',cursive;font-size:6.5mm;line-height:1.2;color:' + d.titulo + ';margin-bottom:3mm">' + esc(o.firma) + '</div>' : '') +
        logo +
      '</div>';
    var tras = cara(B, 0, S.left - 1, '<img src="' + imgTras + '" style="display:block;width:100%;height:100%">', imgTras) + texto;

    // Si la dedicatoria es larga, la letra se reduce hasta que todo quepa en la etiqueta (hcti ejecuta el script)
    var ajuste = '<script>(function(){var c=document.querySelectorAll(".tus-ded");c.forEach(function(b){var p=b.querySelector("p"),t=6;while(b.scrollHeight>b.clientHeight+1&&t>3.4){t-=.2;p.style.fontSize=t.toFixed(1)+"mm";}});})();<\/script>';

    return '<style>.tus-portada-abierta svg{display:block;width:100%;height:100%}</style>' +
      '<div class="tus-portada-abierta" style="position:relative;overflow:hidden;width:' + H.width + 'mm;height:' + H.height + 'mm;background:' + d.papel + '">' + tras + del + lomo + '</div>' + ajuste;
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
