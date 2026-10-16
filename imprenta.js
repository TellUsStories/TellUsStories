// Plantillas de impresión de Tale Us Stories (Gelato, fotolibro 21 × 28 cm).
// Todo se mide en milímetros: hcti las renderiza a ~300 ppp y Make las junta en el PDF de imprenta.
// Necesita portadas.js (la portada delantera es la misma que se ve en la web y en el formulario).
(function () {
  var SANGRADO = 4;                       // Gelato pide 4 mm de sangrado por cada lado
  var PAG = { w: 210 + 2 * SANGRADO, h: 280 + 2 * SANGRADO };
  var PAPEL = '#F9F3E8', TINTA = '#3D2B1F';

  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  // ---------- Página interior (218 × 288 mm con sangrado) ----------
  // o = { diseno (1–8), img, titulo, texto, numero, sobresale }. texto puede llevar <span class="hl">…</span> (lo escribe Claude).
  // Sin título ni texto = página de solo ilustración.
  // Con diseño: la acuarela de la portada hace de marco y encima va una hoja de papel con la doble línea
  // en la tinta del diseño; arriba el título, una estrella dorada y el texto; la ilustración llena la hoja.
  function pagina(o) {
    var conTexto = !!(o.titulo || o.texto);
    if (!o.diseno) return paginaSinMarco(o, conTexto);
    var d = TUSPortadas.diseno(o.diseno), M = { x: SANGRADO + 11, y: SANGRADO + 11 };   // 11 mm de marco visible
    // o.sobresale: la ilustración baja por encima del marco hasta el borde de la página (en ~1 de cada 4 páginas).
    // La hoja llega entonces hasta abajo y la doble línea se desvanece antes de llegar a la ilustración.
    var sale = !!o.sobresale;
    var lineas = sale ? '-webkit-mask-image:linear-gradient(#000 50%,transparent 72%);mask-image:linear-gradient(#000 50%,transparent 72%);' : '';
    var h = '<style>.tus-pag .hl{color:inherit;font-weight:500}</style>' +
      '<div class="tus-pag" style="position:relative;overflow:hidden;width:' + PAG.w + 'mm;height:' + PAG.h + 'mm;background:' + d.papel + '">' +
      '<img src="' + TUSPortadas.imagen(d, 'delante', 'hd') + '" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">' +
      '<div style="position:absolute;left:' + M.x + 'mm;right:' + M.x + 'mm;top:' + M.y + 'mm;bottom:' + (sale ? 0 : M.y) + 'mm;overflow:hidden;background:' + PAPEL + ';box-shadow:0 .6mm 1.6mm rgba(40,25,10,.25)">' +
        '<div style="position:absolute;inset:0;pointer-events:none;z-index:2;' + lineas + '">' +
          '<div style="position:absolute;inset:2.6mm;border:.6mm solid ' + d.titulo + '"></div>' +
          '<div style="position:absolute;inset:3.9mm;border:.25mm solid ' + d.titulo + '"></div>' +
        '</div>' +
        // La hoja es una columna: arriba el texto (lo que ocupe) y debajo la ilustración, que nunca se mete en el texto.
        // La ilustración llega con la parte de arriba vacía (así se pide a la IA): se recorta por arriba si hace falta.
        '<div style="position:absolute;inset:0;display:flex;flex-direction:column">';
    if (conTexto) {
      h += '<div style="flex:none;box-sizing:border-box;padding:13mm 13mm 3mm;text-align:center">' +
          '<div style="font-family:\'Dancing Script\',cursive;font-weight:500;font-size:14mm;line-height:1.1;color:' + d.titulo + '">' + esc(o.titulo) + '</div>' +
          '<div style="color:#E3A93C;font-size:6mm;line-height:1;margin:2.5mm 0 3mm">★</div>' +
          '<p style="font-family:\'Cormorant Garamond\',serif;font-weight:500;font-size:7mm;line-height:1.42;color:' + d.titulo + ';margin:0">' + (o.texto || '') + '</p>' +
        '</div>';
    }
    h += '<div style="flex:1;min-height:0;position:relative"><img src="' + esc(o.img) + '" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center bottom;-webkit-mask-image:linear-gradient(transparent,#000 22%);mask-image:linear-gradient(transparent,#000 22%)"></div></div>';
    // (la parte de arriba de la ilustración se funde poco a poco con la hoja: el crema de la IA nunca es
    // exactamente el del papel y, si empieza de golpe, se nota una franja)
    h += '</div>';
    // Número de página: una etiqueta redonda de papel centrada abajo, encima del marco de acuarela
    // (queda a ~8 mm del corte, dentro de la zona segura) y con la tinta del diseño
    if (numero(o)) h += '<div style="position:absolute;left:50%;bottom:' + (M.y - 5) + 'mm;transform:translateX(-50%);width:10mm;height:10mm;border-radius:50%;background:' + PAPEL + ';border:.35mm solid ' + d.titulo + ';box-shadow:0 .4mm 1mm rgba(40,25,10,.2);display:flex;align-items:center;justify-content:center;font-family:\'Cormorant Garamond\',serif;font-weight:600;font-size:5mm;line-height:1;color:' + d.titulo + ';z-index:3">' + numero(o) + '</div>';
    return h + '</div>';
  }
  // El número de página (o.numero), solo si es un número de verdad
  function numero(o) { var n = parseInt(o.numero, 10); return n > 0 ? n : ''; }
  // Página sin marco (pedidos anteriores a las portadas nuevas)
  function paginaSinMarco(o, conTexto) {
    var color = o.color || '#C4622D';
    var h = '<style>.tus-pag .hl{color:' + color + ';font-weight:600}</style>' +
      '<div class="tus-pag" style="position:relative;overflow:hidden;width:' + PAG.w + 'mm;height:' + PAG.h + 'mm;background:' + PAPEL + '">' +
      '<img src="' + esc(o.img) + '" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;object-position:center bottom">';
    if (conTexto) {
      h += '<div style="position:absolute;left:0;top:0;width:100%;height:36%;box-sizing:border-box;padding:24mm 20mm 4mm;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center">' +
          '<div style="font-family:\'Dancing Script\',cursive;font-size:15.2mm;line-height:1.1;color:' + color + ';margin-bottom:4mm">' + esc(o.titulo) + '</div>' +
          '<p style="font-family:\'Cormorant Garamond\',serif;font-size:7.9mm;line-height:1.55;color:' + TINTA + ';margin:0">' + (o.texto || '') + '</p>' +
        '</div>';
    }
    if (numero(o)) h += '<div style="position:absolute;left:0;right:0;bottom:' + (SANGRADO + 7) + 'mm;text-align:center;font-family:\'Cormorant Garamond\',serif;font-weight:600;font-size:5mm;line-height:1;color:' + TINTA + '">' + numero(o) + '</div>';
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
    var ratio = TUSPortadas.H / TUSPortadas.W, blanda = !m.wraparoundInsideSize;   // tapa blanda: sin cartón ni bisagras
    var ext = blanda ? 0 : 1;   // en tapa dura las caras y el lomo se solapan 1 mm (cae en la bisagra)
    // Dónde va el dibujo (832 × 1176) en cada cara: centrado y 5 mm más grande que la parte visible,
    // por si el corte o el doblado se mueven un poco.
    function colocacion(A) {
      var w = A.width + 10, h = w * ratio;
      if (h < A.height + 10) { h = A.height + 10; w = h / ratio; }
      // El borde de la acuarela es irregular (cuadros o rayas a medias): se esconde 6 mm por debajo del lomo,
      // así junto al lomo se ve estampado normal. En tapa dura el dibujo cubre además la bisagra, sin franjas.
      var cx = A.left + A.width / 2, borde = cx < S.left ? S.left : S.left + S.width;
      var wl = 2 * Math.abs(cx - borde) + 12;
      if (blanda) {
        // Tapa blanda: centrado en la cara (la etiqueta queda centrada) y cubriendo también el sangrado de fuera
        w = Math.max(wl, A.width + 2 * SANGRADO + 2); h = w * ratio;
        return { w: w, h: h, x: cx - w / 2, y: A.top + A.height / 2 - h / 2, k: w / TUSPortadas.W };
      }
      if (wl > w) { w = wl; h = w * ratio; }
      return { w: w, h: h, x: cx - w / 2, y: A.top + A.height / 2 - h / 2, k: w / TUSPortadas.W };
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
    var lomo = '<div style="position:absolute;left:' + (S.left - ext) + 'mm;top:0;width:' + (S.width + 2 * ext) + 'mm;height:' + H.height + 'mm;background:' + d.lomo + '">' + lomoTxt + '</div>';

    // Contraportada: la misma acuarela con su etiqueta vacía; dentro, la dedicatoria tal cual la escribió
    // quien regala el libro, su firma y el logo de Tale Us Stories en las tintas del diseño.
    // Detrás va la misma acuarela que delante (su etiqueta también está vacía): así las líneas del
    // estampado quedan a la misma altura a los dos lados del lomo y no se «cortan»
    var LB = colocacion(B), e = d.delante, k = LB.k;
    var ex = LB.x + (e[0] + 26) * k, ey = LB.y + (e[1] + 26) * k, ew = (e[2] - 52) * k, eh = (e[3] - 52) * k;
    var ded = String(o.dedicatoria || '').trim();
    var logo = '<div style="display:inline-block;text-align:left;font-family:\'Bricolage Grotesque\',\'Arial Black\',sans-serif;font-weight:800;font-size:3.6mm;letter-spacing:.5mm;line-height:1.05;text-transform:uppercase;color:' + d.nombreCol + '">Tale Us<br>Stories' +
      '<span style="display:block;width:7mm;height:.8mm;border-radius:.5mm;background:' + d.nombreCol + ';margin-top:1.2mm"></span></div>';
    // La dedicatoria y la firma, centradas en el recuadro; el logo, siempre abajo en el centro
    var texto = '<div class="tus-ded" style="position:absolute;left:' + ex + 'mm;top:' + ey + 'mm;width:' + ew + 'mm;height:' + eh + 'mm;box-sizing:border-box;padding:4mm 7mm 3.5mm;display:flex;flex-direction:column;align-items:center;text-align:center;overflow:hidden">' +
        '<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center">' +
          '<p style="font-family:\'Cormorant Garamond\',serif;font-style:italic;font-size:7.2mm;line-height:1.4;color:' + d.titulo + ';margin:0;white-space:pre-line">' + esc(ded) + '</p>' +
          '<div style="width:14mm;height:.3mm;background:' + d.titulo + ';opacity:.5;margin:3.5mm 0 2.5mm"></div>' +
          (o.firma ? '<div style="font-family:\'Dancing Script\',cursive;font-size:6.5mm;line-height:1.2;color:' + d.titulo + '">' + esc(o.firma) + '</div>' : '') +
        '</div>' +
        '<div style="flex:none;margin-top:3mm">' + logo + '</div>' +
      '</div>';
    var tras = cara(B, 0, S.left - ext, '<img src="' + imgDel + '" style="display:block;width:100%;height:100%">', imgDel) + texto;

    // Si la dedicatoria es larga, la letra se reduce hasta que todo quepa en la etiqueta (hcti ejecuta el script)
    var ajuste = '<script>(function(){var c=document.querySelectorAll(".tus-ded");c.forEach(function(b){var p=b.querySelector("p"),t=7.2;while(b.scrollHeight>b.clientHeight+1&&t>4){t-=.2;p.style.fontSize=t.toFixed(1)+"mm";}});})();<\/script>';

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

  // Tapa blanda 21 × 28, 40 páginas: medidas APROXIMADAS (4 mm de sangrado, lomo ~3,5 mm) solo para la muestra;
  // las reales también se piden a Gelato. Con un lomo de menos de 5 mm no se pone texto en él.
  var EJEMPLO_TAPA_BLANDA = {
    bleedSize: { width: 431.5, height: 288, left: 0, top: 0 },
    contentBackSize: { width: 210, height: 280, left: 4, top: 4 },
    spineSize: { width: 3.5, height: 280, left: 214, top: 4 },
    contentFrontSize: { width: 210, height: 280, left: 217.5, top: 4 }
  };

  window.TUSImprenta = { pagina: pagina, portada: portada, hoja: hoja, PAG: PAG, SANGRADO: SANGRADO, EJEMPLO_TAPA_DURA: EJEMPLO_TAPA_DURA, EJEMPLO_TAPA_BLANDA: EJEMPLO_TAPA_BLANDA };
})();
