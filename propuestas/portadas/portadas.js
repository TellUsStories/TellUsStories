// Genera el HTML de cada portada propuesta a partir de los datos del pedido.
// Lo usan la galería de portadas y el configurador de la web.
(function () {
  var ROLES = {
    'Mamá': 'f', 'Papá': 'm', 'Abuela': 'f', 'Abuelo': 'm', 'Tía': 'f', 'Tío': 'm',
    'Yaya': 'f', 'Yayo': 'm', 'Madrina': 'f', 'Padrino': 'm'
  };
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function genero(rol) { return ROLES[rol] || 'f'; }

  function portada(tipo, d) {
    var nombre = esc(d.nombre || 'Carmen');
    var rol = esc(d.rol || 'Abuela');
    var rolMin = rol.toLowerCase();
    var oa = genero(d.rol || 'Abuela') === 'f' ? 'a' : 'o';
    var ninos = esc(d.ninos || 'Mia y Leo');
    var marca = '<div class="sello-marca">Tale Us Stories</div>';
    var acu = '<div class="acuarela"></div>';
    switch (tipo) {
      case 'etiqueta':
        return '<div class="portada-b p-etiqueta">' + acu +
          '<div class="rol"><span>' + rol + '</span></div>' +
          '<div class="nombre">' + nombre + '</div>' +
          '<div class="para">Una historia para ' + ninos + '</div>' + marca + '</div>';
      case 'tela':
        return '<div class="portada-b p-tela ' + (d.color || '') + '"><div class="marco"></div>' +
          '<div class="ventana">' + acu + '</div>' +
          '<div class="titulo"><small>La historia de</small><b>' + nombre + '</b><div class="orla">❦</div><em>contada para ' + ninos + '</em></div>' + marca + '</div>';
      case 'noche':
        return '<div class="portada-b p-noche"><div class="cielo"></div><div class="luna"></div>' +
          '<div class="inicial">' + nombre.charAt(0) + '</div>' +
          '<div class="titulo"><small>Las estrellas de</small><b>' + nombre + '</b><em>Un cuento para leer con ' + ninos + '</em></div>' + marca + '</div>';
      case 'album':
        return '<div class="portada-b p-album">' +
          '<div class="foto f1"><div class="acuarela"></div><span>de pequeñ' + oa + '</span></div>' +
          '<div class="foto f2"><div class="acuarela"></div><span>de joven</span></div>' +
          '<div class="foto f3"><div class="acuarela"></div><span>hoy</span></div>' +
          '<div class="titulo"><small>Antes de ser ' + rolMin + '</small><b>' + nombre + '</b><em>Para ' + ninos + '</em></div>' + marca + '</div>';
      case 'sello':
        return '<div class="portada-b p-sello"><div class="sello"><div class="dentro">' + acu + '<span class="valor">40</span></div></div>' +
          '<div class="matasellos">Edición<br>única<br>· 2026 ·</div>' +
          '<div class="titulo"><b>' + nombre + ', <i>antes de ser ' + rolMin + '</i></b><em>Para ' + ninos + '</em></div>' + marca + '</div>';
    }
    return '';
  }
  window.TUSPortadas = { portada: portada, roles: Object.keys(ROLES), genero: genero };
})();
