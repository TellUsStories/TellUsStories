// Efectos de las páginas por búsqueda: secciones que aparecen al bajar, tarjetas «hoy / antes» que giran,
// libro abierto que se inclina con el ratón y etiqueta tachada que va cambiando de nombre.
(function () {
  document.documentElement.classList.add('js');
  var quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var io = 'IntersectionObserver' in window && new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('visto'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.aparece').forEach(function (el) { if (io) io.observe(el); else el.classList.add('visto'); });

  document.querySelectorAll('.giro').forEach(function (b) {
    b.addEventListener('click', function () { b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); });
  });

  if (quieto) return;

  // Las tarjetas se giran solas, una detrás de otra, mientras se ven; en cuanto alguien toca una, mandan sus clics
  document.querySelectorAll('.giros').forEach(function (grupo) {
    var tarjetas = [].slice.call(grupo.querySelectorAll('.giro')), paso = 0, reloj = null;
    function siguiente() {
      if (paso < tarjetas.length) tarjetas[paso].setAttribute('aria-pressed', 'true');
      else tarjetas.forEach(function (t) { t.setAttribute('aria-pressed', 'false'); });
      paso = (paso + 1) % (tarjetas.length + 1);
    }
    function parar() { clearInterval(reloj); reloj = null; }
    var vigia = 'IntersectionObserver' in window && new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) { if (!reloj) reloj = setInterval(siguiente, 2200); } else parar();
    }, { threshold: .5 });
    if (vigia) vigia.observe(grupo);
    ['pointerdown', 'keydown'].forEach(function (ev) { grupo.addEventListener(ev, function () { parar(); if (vigia) vigia.disconnect(); }); });
  });

  document.querySelectorAll('.libro').forEach(function (l) {
    var h = l.querySelector('.hojas');
    l.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      var r = l.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      h.style.transform = 'rotateX(' + (4 - y * 10).toFixed(1) + 'deg) rotateY(' + (x * 18 - 3).toFixed(1) + 'deg)';
    });
    l.addEventListener('pointerleave', function () { h.style.transform = ''; });
  });

  document.querySelectorAll('.tachon[data-nombres]').forEach(function (t) {
    var nombres = t.getAttribute('data-nombres').split(','), i = 0, n = t.querySelector('.nombre');
    setInterval(function () {
      i = (i + 1) % nombres.length;
      t.classList.remove('vivo'); void t.offsetWidth;
      n.textContent = nombres[i]; t.classList.add('vivo');
    }, 4200);
  });
})();