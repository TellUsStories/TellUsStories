// Apunta de dónde llega cada visita (Google, Bing, Instagram, TikTok…) la primera vez que entra en la web.
// Se guarda solo en el navegador del visitante (localStorage) y el formulario lo manda con el pedido.
const ORIGEN = `<script>try{if(!localStorage.getItem('tus_origen')){var q=new URLSearchParams(location.search),h='';try{h=document.referrer?new URL(document.referrer).hostname:''}catch(e){}if(h!==location.hostname){localStorage.setItem('tus_origen',JSON.stringify({utm:q.get('utm_source')||'',ref:h,ua:/Instagram/i.test(navigator.userAgent)?'instagram':/musical_ly|TikTok|Bytedance/i.test(navigator.userAgent)?'tiktok':/FBAN|FBAV/i.test(navigator.userAgent)?'facebook':/Pinterest/i.test(navigator.userAgent)?'pinterest':'',pag:location.pathname,fecha:new Date().toISOString().slice(0,10)}))}}}catch(e){}</script>`;

// Medición (banner de cookies + píxel de Meta solo si aceptan + eventos del formulario y del pago). Ver /medicion.js
// No se carga en las páginas privadas (editor, personajes, pedidos…).
const MEDICION = `<script src="/medicion.js?v=20261110" defer></script>`;
const PRIVADAS = /^\/(editor|personajes|pedidos|muestra-imprenta|prueba-paginas|mis-personajes|aportar)/;

export async function onRequest(context) {
  const res = await context.next();
  try {
    if (!(res.headers.get('content-type') || '').includes('text/html')) return res;
    const ruta = new URL(context.request.url).pathname;
    const extra = PRIVADAS.test(ruta) ? '' : MEDICION;
    return new HTMLRewriter().on('head', { element(e) { e.append(ORIGEN + extra, { html: true }); } }).transform(res);
  } catch (e) {
    return res;
  }
}
