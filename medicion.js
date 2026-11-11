/* Medición de Tale Us Stories
   - Banner de cookies: el píxel de Meta SOLO se carga si la persona pulsa «Aceptar».
   - Guarda de dónde llega cada visita (utm_source / utm_medium / utm_campaign, web de origen o app) y lo añade a cada evento.
   - Eventos: PageView (cada página), PasoFormulario (cada paso), IniciarFormulario (paso 1 → 2),
     Lead + InitiateCheckout (envía el formulario y va a pagar, con el importe) y Purchase (página /gracias).
   Se carga en todas las páginas desde functions/_middleware.js. */
(function () {
  var PIXEL_ID = '2308899656318623';   // «Web Tale Us Stories» (porfolio Tale Us Stories)
  var CLAVE = 'tus_cookies';           // 'si' | 'no'
  var PRECIOS = { dura: 67.45, blanda: 49.45 };   // libro + envío 5,95 € (desde 12/11/2026)

  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

  /* ---------- 1. De dónde viene (se guarda siempre, sin cookies: solo en el navegador) ---------- */
  var q = new URLSearchParams(location.search);
  if (q.get('utm_source') || q.get('fbclid') || q.get('gclid')) {
    ls('tus_utm', JSON.stringify({
      source: q.get('utm_source') || (q.get('fbclid') ? 'facebook/instagram' : q.get('gclid') ? 'google-ads' : ''),
      medium: q.get('utm_medium') || '', campaign: q.get('utm_campaign') || '',
      content: q.get('utm_content') || '', fecha: new Date().toISOString().slice(0, 10)
    }));
  }
  function origen() {
    var o = {}; try { o = JSON.parse(ls('tus_origen') || '{}'); } catch (e) {}
    var u = {}; try { u = JSON.parse(ls('tus_utm') || '{}'); } catch (e) {}
    return {
      origen: u.source || o.utm || o.ua || o.ref || 'directo',
      origen_medio: u.medium || '', origen_campana: u.campaign || '',
      primera_pagina: o.pag || '', primera_visita: o.fecha || ''
    };
  }
  window.tusOrigen = origen;

  /* ---------- 2. Píxel de Meta (solo con consentimiento) ---------- */
  var cola = [];
  function track(ev, datos, propio) {
    var d = Object.assign({}, origen(), datos || {});
    if (ls(CLAVE) === 'si' && window.fbq && PIXEL_ID.indexOf('PON_') !== 0) { propio ? fbq('trackCustom', ev, d) : fbq('track', ev, d); }
    else if (ls(CLAVE) !== 'no') cola.push([ev, d, propio]);   // si rechaza, no se guarda nada
  }
  window.tusTrack = track;

  function cargarPixel() {
    if (window.fbq || PIXEL_ID.indexOf('PON_') === 0) return;
    !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments) };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = !0;
      t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s) }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', PIXEL_ID);
    fbq('track', 'PageView', origen());
    cola.splice(0).forEach(function (c) { c[2] ? fbq('trackCustom', c[0], c[1]) : fbq('track', c[0], c[1]); });
  }

  /* ---------- 3. Banner de cookies ---------- */
  function banner() {
    if (ls(CLAVE)) return;
    var css = '#tus-ck{position:fixed;left:16px;right:16px;bottom:16px;z-index:99999;max-width:520px;margin:0 auto;background:#FBF6EC;color:#4A2C1F;border:1px solid #E6D9C3;border-radius:14px;box-shadow:0 8px 30px rgba(74,44,31,.18);padding:16px 18px;font:14px/1.45 Georgia,serif}' +
      '#tus-ck p{margin:0 0 12px}#tus-ck a{color:#9E3A26}#tus-ck .b{display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap}' +
      '#tus-ck button{font:600 14px/1 system-ui,sans-serif;border-radius:999px;padding:10px 18px;cursor:pointer;border:1px solid #9E3A26}' +
      '#tus-ck .no{background:transparent;color:#9E3A26}#tus-ck .si{background:#9E3A26;color:#fff}';
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    var d = document.createElement('div'); d.id = 'tus-ck'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-label', 'Cookies');
    d.innerHTML = '<p>Usamos cookies de Meta (Instagram y Facebook) para saber qué anuncios funcionan y enseñar los nuestros a quien le puedan interesar. Solo se activan si aceptas. <a href="/legal.html#cookies">Más información</a></p>' +
      '<div class="b"><button class="no" type="button">Rechazar</button><button class="si" type="button">Aceptar</button></div>';
    document.body.appendChild(d);
    d.querySelector('.si').onclick = function () { ls(CLAVE, 'si'); d.remove(); cargarPixel(); };
    d.querySelector('.no').onclick = function () { ls(CLAVE, 'no'); cola.length = 0; d.remove(); };
  }
  window.tusCookies = function () { try { localStorage.removeItem(CLAVE); } catch (e) {} banner(); };

  /* ---------- 4. Eventos del formulario y del pago ---------- */
  // Pasos del formulario: la página cambia de /formulario-nuevo/paso-N con history.pushState
  var push = history.pushState;
  history.pushState = function (st, t, url) {
    var r = push.apply(this, arguments);
    try {
      var m = String(url || '').match(/paso-(\d+)/);
      if (m) {
        var n = +m[1];
        track('PasoFormulario', { paso: n }, true);
        if (n === 2 && !sessionStorage.getItem('tus_ini')) { sessionStorage.setItem('tus_ini', '1'); track('IniciarFormulario', {}, true); }
      }
    } catch (e) {}
    return r;
  };
  // Envío del formulario: se guarda la historia (webhook de Make) y luego va a Stripe a pagar
  var f0 = window.fetch;
  if (f0) window.fetch = function (url, opt) {
    try {
      if (String(url).indexOf('hook.eu1.make.com/k3ru6hcymtkupq46hflxu9qmzloafpes') > -1) {
        var b = {}; try { b = JSON.parse((opt && opt.body) || '{}'); } catch (e) {}
        var dd = {}; try { dd = typeof b.datos === 'string' ? JSON.parse(b.datos) : (b.datos || {}); } catch (e) {}
        var fmt = /blanda/i.test(dd.formato || b.formato || '') ? 'blanda' : 'dura';
        var datos = { value: PRECIOS[fmt], currency: 'EUR', content_name: 'Cuento tapa ' + fmt, formato: fmt, pedido: b.pedido || '' };
        ls('tus_ultimo_pedido', JSON.stringify({ formato: fmt, pedido: b.pedido || '', fecha: Date.now() }));
        track('Lead', datos);
        track('InitiateCheckout', datos);
      }
    } catch (e) {}
    return f0.apply(this, arguments);
  };
  // Página de gracias (Stripe vuelve aquí después de pagar): compra, una sola vez por pedido
  if (/^\/gracias/.test(location.pathname)) {
    var p = {}; try { p = JSON.parse(ls('tus_ultimo_pedido') || '{}'); } catch (e) {}
    var fmt2 = q.get('formato') || p.formato || 'blanda';
    var idc = q.get('session_id') || q.get('pedido') || p.pedido || String(p.fecha || '');
    if (!ls('tus_compra_' + idc)) {
      ls('tus_compra_' + idc, '1');
      track('Purchase', { value: PRECIOS[fmt2] || 49.45, currency: 'EUR', content_name: 'Cuento tapa ' + fmt2, formato: fmt2, pedido: p.pedido || '' }, false);
    }
  }
  // Clic en «Crear mi cuento» / enlaces al formulario desde cualquier página
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href*="formulario"]');
    if (a) track('ClicCrearCuento', { desde: location.pathname }, true);
  }, true);

  /* ---------- 5. Arranque ---------- */
  function go() { if (ls(CLAVE) === 'si') cargarPixel(); else banner(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
})();
