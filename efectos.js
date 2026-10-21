// Efectos de las páginas por búsqueda: secciones que aparecen al bajar, tarjetas «hoy / antes» que giran,
// libro abierto que se inclina con el ratón y etiqueta tachada que va cambiando de nombre.
(function () {
  document.documentElement.classList.add('js');
  var quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var io = 'IntersectionObserver' in window && new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('visto'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.aparece').forEach(function (el) { if (io) io.observe(el); else el.classList.add('visto'); });

  // Tarjetas «hoy / antes»: con ratón se giran al pasar por encima (lo hace el CSS); al tocarlas en el móvil
  // o con el teclado se giran y vuelven solas a los 3 segundos
  var conRaton = window.matchMedia('(hover: hover)').matches;
  document.querySelectorAll('.giro').forEach(function (b) {
    var vuelta = null;
    b.addEventListener('click', function () {
      if (conRaton && b.matches(':hover')) return;
      clearTimeout(vuelta);
      var girada = b.getAttribute('aria-pressed') !== 'true';
      b.setAttribute('aria-pressed', girada ? 'true' : 'false');
      if (girada) vuelta = setTimeout(function () { b.setAttribute('aria-pressed', 'false'); }, 3000);
    });
  });

  if (quieto) return;

  // Además se giran solas, una detrás de otra, mientras se ven; se pausan mientras el ratón está encima
  // o justo después de tocar una, y luego siguen
  document.querySelectorAll('.giros').forEach(function (grupo) {
    var tarjetas = [].slice.call(grupo.querySelectorAll('.giro')), paso = 0, reloj = null, visible = false, pausa = false, espera = null;
    function siguiente() {
      if (pausa) return;
      if (paso < tarjetas.length) tarjetas[paso].setAttribute('aria-pressed', 'true');
      else tarjetas.forEach(function (t) { t.setAttribute('aria-pressed', 'false'); });
      paso = (paso + 1) % (tarjetas.length + 1);
    }
    function todasDelante() { tarjetas.forEach(function (t) { t.setAttribute('aria-pressed', 'false'); }); paso = 0; }
    var vigia = 'IntersectionObserver' in window && new IntersectionObserver(function (es) {
      visible = es[0].isIntersecting;
      if (visible && !reloj) reloj = setInterval(siguiente, 2200);
      if (!visible) { clearInterval(reloj); reloj = null; }
    }, { threshold: .5 });
    if (vigia) vigia.observe(grupo);
    grupo.addEventListener('mouseenter', function () { pausa = true; todasDelante(); });
    grupo.addEventListener('mouseleave', function () { pausa = false; });
    grupo.addEventListener('touchstart', function () {
      pausa = true; clearTimeout(espera); todasDelante();
      espera = setTimeout(function () { pausa = false; paso = 0; }, 4000);
    }, { passive: true });
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
    // Cada nombre puede traer su etiqueta delante ("ABUELA:Carmen"); si no, se queda la que hay
    var nombres = t.getAttribute('data-nombres').split(','), i = 0, n = t.querySelector('.nombre'), e = t.querySelector('.eti');
    setInterval(function () {
      i = (i + 1) % nombres.length;
      var partes = nombres[i].split(':');
      t.classList.remove('vivo'); void t.offsetWidth;
      if (partes.length > 1) e.textContent = partes[0];
      n.textContent = partes[partes.length - 1]; t.classList.add('vivo');
    }, 4200);
  });
})();