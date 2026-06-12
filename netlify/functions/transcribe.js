<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Tale Us Stories · Cuéntanoslo</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Lato:wght@300;400;700&display=swap" rel="stylesheet">
<style>
  :root{--cream:#F7F3EE;--coral:#C8544A;--coral-l:#EDE8E0;--navy:#1E2D4A;--muted:#8A7060;--border:#DDD5C8;--white:#FFFFFF;}
  *{margin:0;padding:0;box-sizing:border-box;}
  body{background:var(--cream);font-family:'Lato',sans-serif;color:var(--navy);min-height:100vh;}
  .prog-track{position:fixed;top:0;left:0;right:0;height:3px;background:var(--border);z-index:100;}
  .prog-fill{height:100%;background:var(--coral);transition:width .5s ease;width:0%;}
  header{text-align:center;padding:44px 24px 0;}
  .brand{font-family:'Playfair Display',serif;font-size:12px;letter-spacing:6px;color:var(--coral);text-transform:uppercase;margin-bottom:6px;}
  .step-lbl{font-size:11px;letter-spacing:3px;color:var(--muted);text-transform:uppercase;}
  .wrap{max-width:680px;margin:0 auto;padding:0 24px 100px;}
  .screen{display:none;}
  .screen.active{display:block;animation:up .4s ease forwards;}
  @keyframes up{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
  .sh{padding:42px 0 30px;border-bottom:1px solid var(--border);margin-bottom:30px;}
  .sh-chapter{font-size:10px;letter-spacing:4px;color:var(--coral);text-transform:uppercase;margin-bottom:6px;}
  .sh-title{font-family:'Playfair Display',serif;font-size:29px;line-height:1.25;color:var(--navy);margin-bottom:10px;}
  .sh-sub{font-size:14px;color:var(--muted);line-height:1.65;font-weight:300;}
  .chapter-badge{display:inline-flex;align-items:center;gap:10px;background:var(--coral-l);border:1px solid var(--coral);border-radius:4px;padding:8px 16px;margin-bottom:24px;}
  .ch-num{font-size:11px;font-weight:700;color:var(--coral);letter-spacing:1px;}
  .ch-name{font-family:'Playfair Display',serif;font-size:15px;color:var(--navy);}
  .field{margin-bottom:20px;}
  .field label{display:block;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--navy);margin-bottom:6px;}
  .hint{font-size:12px;color:var(--muted);margin-bottom:7px;font-style:italic;line-height:1.5;}
  input[type=text],input[type=email],select,textarea{width:100%;padding:12px 15px;border:1.5px solid var(--border);border-radius:4px;background:var(--white);font-family:'Lato',sans-serif;font-size:14px;color:var(--navy);outline:none;transition:border-color .2s,box-shadow .2s;appearance:none;}
  input:focus,select:focus,textarea:focus{border-color:var(--coral);box-shadow:0 0 0 3px rgba(200,84,74,.07);}
  textarea{resize:vertical;min-height:80px;line-height:1.6;}
  select{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%238A7060'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 14px center;cursor:pointer;}
  .two{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
  @media(max-width:500px){.two{grid-template-columns:1fr;}}
  .sdiv{display:flex;align-items:center;gap:12px;margin:26px 0 20px;}
  .sdiv::before,.sdiv::after{content:'';flex:1;height:1px;background:var(--border);}
  .sdiv span{font-size:10px;letter-spacing:3px;color:var(--muted);text-transform:uppercase;white-space:nowrap;}
  .gender-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:6px;}
  .gender-opt{border:2px solid var(--border);border-radius:8px;padding:20px 16px;cursor:pointer;transition:all .2s;background:var(--white);text-align:center;}
  .gender-opt:hover{border-color:var(--coral);}
  .gender-opt.selected{border-color:var(--coral);background:var(--coral-l);}
  .gender-emoji{font-size:30px;margin-bottom:8px;}
  .gender-title{font-size:14px;font-weight:700;color:var(--navy);margin-bottom:3px;}
  .gender-desc{font-size:12px;color:var(--muted);}
  .vc{background:var(--white);border:1.5px solid var(--border);border-radius:8px;padding:22px;margin-bottom:14px;transition:border-color .2s;}
  .vc:hover{border-color:rgba(200,84,74,.3);}
  .vc.done{border-color:var(--coral);background:var(--coral-l);}
  .vc-q{font-family:'Playfair Display',serif;font-size:17px;color:var(--navy);line-height:1.45;margin-bottom:5px;}
  .vc-h{font-size:12px;color:var(--muted);margin-bottom:15px;font-style:italic;line-height:1.5;}
  .vc-ctrls{display:flex;align-items:center;gap:11px;flex-wrap:wrap;}
  .btn-rec{display:flex;align-items:center;gap:7px;padding:9px 18px;border-radius:100px;border:2px solid var(--coral);background:var(--white);color:var(--coral);font-family:'Lato',sans-serif;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;cursor:pointer;transition:all .2s;}
  .btn-rec:hover{background:var(--coral);color:var(--white);}
  .btn-rec.rec{background:var(--coral);color:var(--white);animation:pulse 1.2s infinite;}
  @keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(200,84,74,.4)}50%{box-shadow:0 0 0 8px rgba(200,84,74,0)}}
  .rdot{width:7px;height:7px;border-radius:50%;background:currentColor;}
  .btn-rec.rec .rdot{animation:blink .8s step-end infinite;}
  @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
  .rtimer{font-size:13px;color:var(--muted);font-variant-numeric:tabular-nums;min-width:34px;}
  .rbadge{display:none;align-items:center;gap:5px;font-size:11px;color:var(--coral);font-weight:700;letter-spacing:1px;text-transform:uppercase;}
  .rbadge.show{display:flex;}
  .rbadge::before{content:'✓';}
  audio.ap{display:none;width:100%;margin-top:10px;height:36px;}
  audio.ap.show{display:block;}
  .btn-clr{display:none;font-size:11px;color:var(--muted);background:none;border:none;cursor:pointer;text-decoration:underline;font-family:'Lato',sans-serif;}
  .btn-clr.show{display:inline;}
  .or-d{display:flex;align-items:center;gap:10px;margin:10px 0 8px;}
  .or-d::before,.or-d::after{content:'';flex:1;height:1px;background:var(--border);}
  .or-d span{font-size:10px;letter-spacing:2px;color:var(--muted);text-transform:uppercase;}
  .tf{display:none;}
  .tf.show{display:block;}
  .btn-tw{font-size:11px;color:var(--muted);background:none;border:none;cursor:pointer;text-decoration:underline;font-family:'Lato',sans-serif;}
  .tone-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:6px;}
  .tone-opt{border:1.5px solid var(--border);border-radius:6px;padding:14px 16px;cursor:pointer;transition:all .2s;background:var(--white);}
  .tone-opt:hover{border-color:var(--coral);}
  .tone-opt.selected{border-color:var(--coral);background:var(--coral-l);}
  .te{font-size:20px;margin-bottom:5px;}
  .tt{font-size:13px;font-weight:700;color:var(--navy);margin-bottom:2px;}
  .td{font-size:11px;color:var(--muted);line-height:1.4;}
  .uzone{border:2px dashed var(--border);border-radius:6px;padding:24px;text-align:center;cursor:pointer;transition:all .2s;background:var(--white);}
  .uzone:hover{border-color:var(--coral);background:var(--coral-l);}
  .uzone-icon{font-size:22px;margin-bottom:6px;}
  .uzone-txt{font-size:13px;color:var(--muted);}
  #fileInput{display:none;}
  .fi{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--muted);padding:5px 0;border-bottom:1px solid var(--border);}
  .fi::before{content:'✓';color:var(--coral);font-weight:700;}
  .sb{background:var(--white);border:1.5px solid var(--border);border-radius:6px;padding:18px 22px;margin-bottom:14px;}
  .sb h3{font-size:10px;letter-spacing:3px;text-transform:uppercase;color:var(--coral);margin-bottom:12px;}
  .sr{display:flex;justify-content:space-between;align-items:flex-start;gap:14px;padding:7px 0;border-bottom:1px solid var(--border);font-size:13px;}
  .sr:last-child{border:none;}
  .sk{color:var(--muted);font-weight:700;font-size:11px;text-transform:uppercase;letter-spacing:.5px;min-width:120px;}
  .sv{color:var(--navy);text-align:right;flex:1;}
  .nav{display:flex;justify-content:space-between;align-items:center;margin-top:34px;padding-top:22px;border-top:1px solid var(--border);}
  .btn-back{font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted);background:none;border:none;cursor:pointer;font-family:'Lato',sans-serif;padding:12px 0;transition:color .2s;}
  .btn-back:hover{color:var(--coral);}
  .btn-back.h{visibility:hidden;}
  .btn-next{background:var(--coral);color:var(--white);border:none;padding:13px 30px;border-radius:2px;font-family:'Lato',sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;cursor:pointer;transition:all .2s;}
  .btn-next:hover{background:#b04840;transform:translateY(-1px);box-shadow:0 4px 14px rgba(200,84,74,.28);}
  .perm{display:none;background:#FFF3CD;border:1px solid #FFD966;border-radius:4px;padding:11px 15px;font-size:13px;color:#7A6000;margin-bottom:12px;}
  .perm.show{display:block;}
  .fin{text-align:center;padding:60px 0 40px;}
  .fin-h{font-size:50px;margin-bottom:22px;animation:hb 1.2s ease infinite;}
  @keyframes hb{0%,100%{transform:scale(1)}30%{transform:scale(1.15)}60%{transform:scale(1.05)}}
  .fin-t{font-family:'Playfair Display',serif;font-size:32px;color:var(--navy);margin-bottom:12px;}
  .fin-s{font-size:15px;color:var(--muted);line-height:1.7;max-width:400px;margin:0 auto 28px;}
  .fin-box{background:var(--white);border:1.5px solid var(--border);border-radius:6px;padding:16px 26px;display:inline-block;font-size:14px;color:var(--muted);line-height:1.7;}
  .fin-box strong{color:var(--coral);}
</style>
</head>
<body>

<div class="prog-track"><div class="prog-fill" id="prog"></div></div>
<header>
  <div class="brand">Tale Us Stories</div>
  <div class="step-lbl" id="stepLbl">Paso 1 de 7</div>
</header>
<div class="wrap">

<div class="screen active" id="s0">
  <div class="sh">
    <div class="sh-chapter">Antes de empezar</div>
    <h1 class="sh-title">No hace falta escribir.<br>Solo contar.</h1>
    <p class="sh-sub">Te iremos haciendo preguntas siguiendo la vida del protagonista. Graba una nota de voz respondiendo a cada una. Nosotros lo convertimos en el libro.</p>
  </div>
  <div class="two">
    <div class="field">
      <label>Nombre del protagonista</label>
      <input type="text" id="protName" placeholder="Ej: María, José, Carlos…" oninput="onNameInput()">
    </div>
    <div class="field">
      <label>Nombre/s de los niños</label>
      <input type="text" id="childNames" placeholder="Ej: Leo, Aco y Mía">
    </div>
  </div>
  <div class="field">
    <label>El protagonista es…</label>
    <div class="gender-grid">
      <div class="gender-opt selected" id="gf" onclick="setGender('f',this)">
        <div class="gender-emoji">👩</div>
        <div class="gender-title">Una mujer</div>
        <div class="gender-desc">Mamá, abuela, tía, amiga…</div>
      </div>
      <div class="gender-opt" id="gm" onclick="setGender('m',this)">
        <div class="gender-emoji">👨</div>
        <div class="gender-title">Un hombre</div>
        <div class="gender-desc">Papá, abuelo, tío, amigo…</div>
      </div>
    </div>
  </div>
  <div class="two">
    <div class="field">
      <label>Tipo de libro</label>
      <select id="bookType">
        <option value="">Selecciona…</option>
        <option>Las aventuras de Mamá</option>
        <option>Las aventuras de Papá</option>
        <option>Las aventuras del Abuelo</option>
        <option>Las aventuras de la Abuela</option>
        <option>Las aventuras del Tío</option>
        <option>Las aventuras de la Tía</option>
        <option>Título personalizado</option>
      </select>
    </div>
    <div class="field">
      <label>Quién hace el encargo</label>
      <input type="text" id="orderer" placeholder="Ej: Richi, su marido">
    </div>
  </div>
  <div class="field">
    <label>¿Quién narra el libro?</label>
    <div class="gender-grid">
      <div class="gender-opt" id="n1" onclick="setNarrator('protagonist',this)">
        <div class="gender-emoji">📖</div>
        <div class="gender-title">El propio protagonista</div>
        <div class="gender-desc">"Cuando yo era pequeña…"</div>
      </div>
      <div class="gender-opt selected" id="n2" onclick="setNarrator('other',this)">
        <div class="gender-emoji">👨‍👩‍👧</div>
        <div class="gender-title">Otra persona</div>
        <div class="gender-desc">"Antes de ser vuestra mamá…"</div>
      </div>
    </div>
  </div>
  <div class="field">
    <label>Tu email</label>
    <input type="email" id="email" placeholder="Te enviaremos el borrador aquí">
  </div>
  <div class="nav">
    <button class="btn-back h"></button>
    <button class="btn-next" onclick="go(1)">Empezamos →</button>
  </div>
</div>

<div class="screen" id="s1">
  <div class="sh">
    <div class="sh-chapter">01 · El protagonista</div>
    <h1 class="sh-title">Preséntanos<br><span id="txt-presentamos">al protagonista</span>.</h1>
    <p class="sh-sub">Antes de contar su historia, queremos saber quién es. Su esencia, sus rasgos, lo que lo hace inconfundible.</p>
  </div>
  <div class="perm" id="permBanner">Tu navegador necesita acceso al micrófono. Si prefieres, usa los campos de texto.</div>
  <div class="chapter-badge"><span class="ch-num">CAPÍTULO 0</span><span class="ch-name">Antes de empezar: quién es</span></div>

  <div class="vc" id="vc0">
    <div class="vc-q">¿Cómo describirías <span id="txt-describirías">al protagonista</span> en 3 palabras? ¿Qué <span class="G-lo"></span> hace diferente a cualquier otra persona que conozcas?</div>
    <div class="vc-h">No pienses demasiado. Lo primero que te venga.</div>
    <div class="vc-ctrls">
      <button class="btn-rec" id="rb0" onclick="toggleRec(0)"><span class="rdot"></span> Grabar</button>
      <span class="rtimer" id="rt0">0:00</span>
      <span class="rbadge" id="bd0">Grabado</span>
    </div>
    <audio class="ap" id="ap0"></audio>
    <button class="btn-clr" id="bc0" onclick="clearRec(0)">Volver a grabar</button>
    <div class="or-d"><span>o escribe</span></div>
    <div class="tf" id="tf0"><textarea placeholder="Cuéntalo aquí si prefieres escribir…"></textarea></div>
    <button class="btn-tw" onclick="toggleTF(0)">Prefiero escribir</button>
  </div>

  <div class="vc" id="vc1">
    <div class="vc-q">¿Cómo es <span class="G-name"></span> físicamente? Descríbe<span class="G-lo"></span> como si tuvieras que presentárselo a alguien que nunca <span class="G-lo"></span> ha visto.</div>
    <div class="vc-h">Color de pelo, ojos, si lleva gafas, cómo viste, algún rasgo especial.</div>
    <div class="vc-ctrls">
      <button class="btn-rec" id="rb1" onclick="toggleRec(1)"><span class="rdot"></span> Grabar</button>
      <span class="rtimer" id="rt1">0:00</span>
      <span class="rbadge" id="bd1">Grabado</span>
    </div>
    <audio class="ap" id="ap1"></audio>
    <button class="btn-clr" id="bc1" onclick="clearRec(1)">Volver a grabar</button>
    <div class="or-d"><span>o escribe</span></div>
    <div class="tf" id="tf1"><textarea placeholder="Cuéntalo aquí si prefieres escribir…"></textarea></div>
    <button class="btn-tw" onclick="toggleTF(1)">Prefiero escribir</button>
  </div>

  <div class="vc" id="vc2">
    <div class="vc-q">¿Hay alguna frase, muletilla o gesto que solo <span class="G-el"></span> haría? Algo que <span class="G-lo"></span> delate al instante.</div>
    <div class="vc-h">Ej: "Café y paciencia" · siempre llega tarde · organiza los armarios por colores…</div>
    <div class="vc-ctrls">
      <button class="btn-rec" id="rb2" onclick="toggleRec(2)"><span class="rdot"></span> Grabar</button>
      <span class="rtimer" id="rt2">0:00</span>
      <span class="rbadge" id="bd2">Grabado</span>
    </div>
    <audio class="ap" id="ap2"></audio>
    <button class="btn-clr" id="bc2" onclick="clearRec(2)">Volver a grabar</button>
    <div class="or-d"><span>o escribe</span></div>
    <div class="tf" id="tf2"><textarea placeholder="Cuéntalo aquí si prefieres escribir…"></textarea></div>
    <button class="btn-tw" onclick="toggleTF(2)">Prefiero escribir</button>
  </div>

  <div class="sdiv"><span>Datos rápidos</span></div>
  <div class="two">
    <div class="field"><label>¿Dónde nació / creció?</label><input type="text" id="birthPlace" placeholder="Ej: Barcelona, un pueblo de Jaén…"></div>
    <div class="field"><label>¿A qué se dedica?</label><input type="text" id="job" placeholder="Ej: Emprendedora, médico, maestro…"></div>
  </div>
  <div class="two">
    <div class="field"><label>Deporte o hobby principal</label><input type="text" id="sport" placeholder="Ej: Pádel, cocina, música…"></div>
    <div class="field"><label>Lugares especiales en su vida</label><input type="text" id="places" placeholder="Ej: Formentera, San Francisco…"></div>
  </div>
  <div class="nav">
    <button class="btn-back" onclick="go(0)">← Atrás</button>
    <button class="btn-next" onclick="go(2)">Siguiente →</button>
  </div>
</div>

<div class="screen" id="s2">
  <div class="sh">
    <div class="sh-chapter">02 · La infancia</div>
    <h1 class="sh-title">Cuando <span class="G-name"></span><br>era <span class="G-unna"></span> <span class="G-ninoa"></span>.</h1>
    <p class="sh-sub">¿Cómo era antes de ser quien es hoy?</p>
  </div>
  <div class="chapter-badge"><span class="ch-num">CAPÍTULO 1</span><span class="ch-name">Bebé e infancia</span></div>

  <div class="vc" id="vc3">
    <div class="vc-q">¿Cómo era <span class="G-name"></span> de bebé? ¿Qué contaban sus padres de <span class="G-el"></span> cuando era muy pequeñ<span class="G-oa"></span>?</div>
    <div class="vc-h">Si era tranquil<span class="G-oa"></span> o un terremoto, si ya se veía cómo iba a ser de mayor…</div>
    <div class="vc-ctrls">
      <button class="btn-rec" id="rb3" onclick="toggleRec(3)"><span class="rdot"></span> Grabar</button>
      <span class="rtimer" id="rt3">0:00</span>
      <span class="rbadge" id="bd3">Grabado</span>
    </div>
    <audio class="ap" id="ap3"></audio>
    <button class="btn-clr" id="bc3" onclick="clearRec(3)">Volver a grabar</button>
    <div class="or-d"><span>o escribe</span></div>
    <div class="tf" id="tf3"><textarea placeholder="Cuéntalo aquí si prefieres escribir…"></textarea></div>
    <button class="btn-tw" onclick="toggleTF(3)">Prefiero escribir</button>
  </div>

  <div class="vc" id="vc4">
    <div class="vc-q">¿Cómo era de niñ<span class="G-oa"></span> en casa y en el colegio? Cuéntanos una anécdota concreta.</div>
    <div class="vc-h">Travesuras, miedos, manías, amigos del colegio, lo que más le gustaba hacer.</div>
    <div class="vc-ctrls">
      <button class="btn-rec" id="rb4" onclick="toggleRec(4)"><span class="rdot"></span> Grabar</button>
      <span class="rtimer" id="rt4">0:00</span>
      <span class="rbadge" id="bd4">Grabado</span>
    </div>
    <audio class="ap" id="ap4"></audio>
    <button class="btn-clr" id="bc4" onclick="clearRec(4)">Volver a grabar</button>
    <div class="or-d"><span>o escribe</span></div>
    <div class="tf" id="tf4"><textarea placeholder="Cuéntalo aquí si prefieres escribir…"></textarea></div>
    <button class="btn-tw" onclick="toggleTF(4)">Prefiero escribir</button>
  </div>

  <div class="sdiv"><span>Datos rápidos de la infancia</span></div>
  <div class="two">
    <div class="field"><label>¿Tenía hermanos?</label><input type="text" id="siblings" placeholder="Ej: Un hermano mayor muy diferente"></div>
    <div class="field"><label>¿Tenía mascota?</label><input type="text" id="pets" placeholder="Ej: Un perro negro llamado Lighty"></div>
  </div>
  <div class="field"><label>¿Lugar especial de la infancia?</label><input type="text" id="childhoodPlace" placeholder="Ej: Casa del abuelo en Asturias…"></div>
  <div class="nav">
    <button class="btn-back" onclick="go(1)">← Atrás</button>
    <button class="btn-next" onclick="go(3)">Siguiente →</button>
  </div>
</div>

<div class="screen" id="s3">
  <div class="sh">
    <div class="sh-chapter">03 · La juventud</div>
    <h1 class="sh-title">Cuando <span class="G-name"></span> empezó<br>a volar sol<span class="G-oa"></span>.</h1>
    <p class="sh-sub">La adolescencia, los estudios, las primeras aventuras grandes.</p>
  </div>
  <div class="chapter-badge"><span class="ch-num">CAPÍTULO 2</span><span class="ch-name">Adolescencia y primeras aventuras</span></div>

  <div class="vc" id="vc5">
    <div class="vc-q">¿Cómo era <span class="G-name"></span> de adolescente? ¿Qué le apasionaba, con quién andaba, qué quería ser de mayor?</div>
    <div class="vc-h">La adolescencia tiene los momentos más divertidos y los más intensos.</div>
    <div class="vc-ctrls">
      <button class="btn-rec" id="rb5" onclick="toggleRec(5)"><span class="rdot"></span> Grabar</button>
      <span class="rtimer" id="rt5">0:00</span>
      <span class="rbadge" id="bd5">Grabado</span>
    </div>
    <audio class="ap" id="ap5"></audio>
    <button class="btn-clr" id="bc5" onclick="clearRec(5)">Volver a grabar</button>
    <div class="or-d"><span>o escribe</span></div>
    <div class="tf" id="tf5"><textarea placeholder="Cuéntalo aquí si prefieres escribir…"></textarea></div>
    <button class="btn-tw" onclick="toggleTF(5)">Prefiero escribir</button>
  </div>

  <div class="vc" id="vc6">
    <div class="vc-q">¿Hubo alguna decisión valiente o aventura grande en su juventud? Algo que <span class="G-name"></span> hizo y que sorprendió a todos.</div>
    <div class="vc-h">Irse a estudiar fuera, cambiar de carrera, un viaje sol<span class="G-oa"></span>…</div>
    <div class="vc-ctrls">
      <button class="btn-rec" id="rb6" onclick="toggleRec(6)"><span class="rdot"></span> Grabar</button>
      <span class="rtimer" id="rt6">0:00</span>
      <span class="rbadge" id="bd6">Grabado</span>
    </div>
    <audio class="ap" id="ap6"></audio>
    <button class="btn-clr" id="bc6" onclick="clearRec(6)">Volver a grabar</button>
    <div class="or-d"><span>o escribe</span></div>
    <div class="tf" id="tf6"><textarea placeholder="Cuéntalo aquí si prefieres escribir…"></textarea></div>
    <button class="btn-tw" onclick="toggleTF(6)">Prefiero escribir</button>
  </div>

  <div class="sdiv"><span>Datos rápidos</span></div>
  <div class="field"><label>¿Qué estudió o dónde fue al colegio / universidad?</label><input type="text" id="school" placeholder="Ej: ADE en Madrid, FP de cocina…"></div>
  <div class="field"><label>¿Hubo algún viaje o lugar que le marcó?</label><input type="text" id="travel" placeholder="Ej: Un verano en Londres, Erasmus en Berlín…"></div>
  <div class="nav">
    <button class="btn-back" onclick="go(2)">← Atrás</button>
    <button class="btn-next" onclick="go(4)">Siguiente →</button>
  </div>
</div>

<div class="screen" id="s4">
  <div class="sh">
    <div class="sh-chapter">04 · Amor y familia</div>
    <h1 class="sh-title">Cuando <span class="G-name"></span> encontró<br>su historia.</h1>
    <p class="sh-sub">Cómo conoció a su pareja, cómo llegaron los niños, cómo empezó la familia.</p>
  </div>
  <div class="chapter-badge"><span class="ch-num">CAPÍTULO 3</span><span class="ch-name">El amor y la llegada de la familia</span></div>

  <div class="vc" id="vc7">
    <div class="vc-q">¿Cómo conoció <span class="G-name"></span> a su pareja? Cuéntanos esa historia.</div>
    <div class="vc-h">El primer encuentro, la primera cita, algo gracioso o inesperado que pasó.</div>
    <div class="vc-ctrls">
      <button class="btn-rec" id="rb7" onclick="toggleRec(7)"><span class="rdot"></span> Grabar</button>
      <span class="rtimer" id="rt7">0:00</span>
      <span class="rbadge" id="bd7">Grabado</span>
    </div>
    <audio class="ap" id="ap7"></audio>
    <button class="btn-clr" id="bc7" onclick="clearRec(7)">Volver a grabar</button>
    <div class="or-d"><span>o escribe</span></div>
    <div class="tf" id="tf7"><textarea placeholder="Cuéntalo aquí si prefieres escribir…"></textarea></div>
    <button class="btn-tw" onclick="toggleTF(7)">Prefiero escribir</button>
  </div>

  <div class="vc" id="vc8">
    <div class="vc-q">¿Cómo fue la llegada de los niños a su vida? ¿Cómo reaccionó <span class="G-name"></span>?</div>
    <div class="vc-h">El embarazo o la llegada, el primer día en casa, cómo cambió todo.</div>
    <div class="vc-ctrls">
      <button class="btn-rec" id="rb8" onclick="toggleRec(8)"><span class="rdot"></span> Grabar</button>
      <span class="rtimer" id="rt8">0:00</span>
      <span class="rbadge" id="bd8">Grabado</span>
    </div>
    <audio class="ap" id="ap8"></audio>
    <button class="btn-clr" id="bc8" onclick="clearRec(8)">Volver a grabar</button>
    <div class="or-d"><span>o escribe</span></div>
    <div class="tf" id="tf8"><textarea placeholder="Cuéntalo aquí si prefieres escribir…"></textarea></div>
    <button class="btn-tw" onclick="toggleTF(8)">Prefiero escribir</button>
  </div>

  <div class="nav">
    <button class="btn-back" onclick="go(3)">← Atrás</button>
    <button class="btn-next" onclick="go(5)">Siguiente →</button>
  </div>
</div>

<div class="screen" id="s5">
  <div class="sh">
    <div class="sh-chapter">05 · Con los niños hoy</div>
    <h1 class="sh-title"><span class="G-name"></span> y <span id="childNamesH">los niños</span>.</h1>
    <p class="sh-sub">La relación que existe hoy. Esto es el corazón del libro.</p>
  </div>
  <div class="chapter-badge"><span class="ch-num">CAPÍTULO 4</span><span class="ch-name">El protagonista hoy, con los niños</span></div>

  <div class="vc" id="vc9">
    <div class="vc-q">¿Cómo son los niños que van a leer el libro? Cuéntanos de cada uno: su personalidad, edad, lo que les gusta.</div>
    <div class="vc-h">Si son varios, dinos de cada uno por separado.</div>
    <div class="vc-ctrls">
      <button class="btn-rec" id="rb9" onclick="toggleRec(9)"><span class="rdot"></span> Grabar</button>
      <span class="rtimer" id="rt9">0:00</span>
      <span class="rbadge" id="bd9">Grabado</span>
    </div>
    <audio class="ap" id="ap9"></audio>
    <button class="btn-clr" id="bc9" onclick="clearRec(9)">Volver a grabar</button>
    <div class="or-d"><span>o escribe</span></div>
    <div class="tf" id="tf9"><textarea placeholder="Cuéntalo aquí si prefieres escribir…"></textarea></div>
    <button class="btn-tw" onclick="toggleTF(9)">Prefiero escribir</button>
  </div>

  <div class="vc" id="vc10">
    <div class="vc-q">¿Cuál es el recuerdo más especial o más gracioso entre <span class="G-name"></span> y los niños?</div>
    <div class="vc-h">Puede ser algo tierno, algo surrealista o algo que hace reír a carcajadas.</div>
    <div class="vc-ctrls">
      <button class="btn-rec" id="rb10" onclick="toggleRec(10)"><span class="rdot"></span> Grabar</button>
      <span class="rtimer" id="rt10">0:00</span>
      <span class="rbadge" id="bd10">Grabado</span>
    </div>
    <audio class="ap" id="ap10"></audio>
    <button class="btn-clr" id="bc10" onclick="clearRec(10)">Volver a grabar</button>
    <div class="or-d"><span>o escribe</span></div>
    <div class="tf" id="tf10"><textarea placeholder="Cuéntalo aquí si prefieres escribir…"></textarea></div>
    <button class="btn-tw" onclick="toggleTF(10)">Prefiero escribir</button>
  </div>

  <div class="vc" id="vc11">
    <div class="vc-q">¿Qué hace <span class="G-name"></span> con los niños que nadie más hace? ¿Hay alguna tradición o ritual que sea solo de ellos?</div>
    <div class="vc-h">Las tortitas del domingo, leerles con voces de personajes, el juego secreto…</div>
    <div class="vc-ctrls">
      <button class="btn-rec" id="rb11" onclick="toggleRec(11)"><span class="rdot"></span> Grabar</button>
      <span class="rtimer" id="rt11">0:00</span>
      <span class="rbadge" id="bd11">Grabado</span>
    </div>
    <audio class="ap" id="ap11"></audio>
    <button class="btn-clr" id="bc11" onclick="clearRec(11)">Volver a grabar</button>
    <div class="or-d"><span>o escribe</span></div>
    <div class="tf" id="tf11"><textarea placeholder="Cuéntalo aquí si prefieres escribir…"></textarea></div>
    <button class="btn-tw" onclick="toggleTF(11)">Prefiero escribir</button>
  </div>

  <div class="sdiv"><span>Datos rápidos</span></div>
  <div class="field"><label>Edad de cada niño</label><input type="text" id="childAges" placeholder="Ej: Leo 8 años, Aco 6, Mía 3"></div>
  <div class="field"><label>¿Cómo se llaman entre ellos?</label><input type="text" id="nicknames" placeholder="Ej: Los niños lo llaman 'Abuelo Pepe'"></div>
  <div class="field"><label>¿Hay alguna historia que los niños ya conocen y piden que les cuenten?</label><input type="text" id="knownStory" placeholder="Esa historia que siempre aparece en las cenas familiares…"></div>
  <div class="nav">
    <button class="btn-back" onclick="go(4)">← Atrás</button>
    <button class="btn-next" onclick="go(6)">Siguiente →</button>
  </div>
</div>

<div class="screen" id="s6">
  <div class="sh">
    <div class="sh-chapter">06 · El alma del libro</div>
    <h1 class="sh-title">Las dos preguntas<br>más importantes.</h1>
    <p class="sh-sub">Estas respuestas son el corazón del libro. No hay respuestas correctas.</p>
  </div>
  <div class="chapter-badge"><span class="ch-num">CAPÍTULO 5</span><span class="ch-name">El legado</span></div>

  <div class="vc" id="vc12">
    <div class="vc-q">¿Qué crees que <span class="G-name"></span> querría que los niños supieran de <span class="G-el"></span> cuando sean mayores?</div>
    <div class="vc-h">No lo que diría en voz alta. Lo que está en cada cosa que hace.</div>
    <div class="vc-ctrls">
      <button class="btn-rec" id="rb12" onclick="toggleRec(12)"><span class="rdot"></span> Grabar</button>
      <span class="rtimer" id="rt12">0:00</span>
      <span class="rbadge" id="bd12">Grabado</span>
    </div>
    <audio class="ap" id="ap12"></audio>
    <button class="btn-clr" id="bc12" onclick="clearRec(12)">Volver a grabar</button>
    <div class="or-d"><span>o escribe</span></div>
    <div class="tf" id="tf12"><textarea placeholder="Cuéntalo aquí si prefieres escribir…"></textarea></div>
    <button class="btn-tw" onclick="toggleTF(12)">Prefiero escribir</button>
  </div>

  <div class="vc" id="vc13">
    <div class="vc-q">¿Hay algo más que debamos saber? Anécdota suelta, frase que quieras que aparezca, dedicatoria…</div>
    <div class="vc-h">El campo libre. Sin límite. Todo lo que no encajaba en ninguna pregunta.</div>
    <div class="vc-ctrls">
      <button class="btn-rec" id="rb13" onclick="toggleRec(13)"><span class="rdot"></span> Grabar</button>
      <span class="rtimer" id="rt13">0:00</span>
      <span class="rbadge" id="bd13">Grabado</span>
    </div>
    <audio class="ap" id="ap13"></audio>
    <button class="btn-clr" id="bc13" onclick="clearRec(13)">Volver a grabar</button>
    <div class="or-d"><span>o escribe</span></div>
    <div class="tf" id="tf13"><textarea placeholder="Cuéntalo aquí si prefieres escribir…"></textarea></div>
    <button class="btn-tw" onclick="toggleTF(13)">Prefiero escribir</button>
  </div>

  <div class="sdiv"><span>Producción</span></div>
  <div class="field">
    <label>Tono del libro</label>
    <div class="tone-grid">
      <div class="tone-opt" onclick="selTone(this)"><div class="te">😄</div><div class="tt">Divertido</div><div class="td">Humor y momentos que hacen reír</div></div>
      <div class="tone-opt" onclick="selTone(this)"><div class="te">💛</div><div class="tt">Emotivo</div><div class="td">Cálido, que llegue al corazón</div></div>
      <div class="tone-opt selected" onclick="selTone(this)"><div class="te">✨</div><div class="tt">Equilibrado</div><div class="td">Humor y emoción a partes iguales</div></div>
      <div class="tone-opt" onclick="selTone(this)"><div class="te">🌍</div><div class="tt">Aventurero</div><div class="td">Que inspire a conocer el mundo</div></div>
    </div>
  </div>
  <div class="field" style="margin-top:22px;">
    <label>Fotos de referencia</label>
    <div class="hint">Del protagonista en distintas épocas, de la familia, de lugares. Hasta 15 fotos.</div>
    <div class="uzone" onclick="document.getElementById('fileInput').click()">
      <div class="uzone-icon">📷</div>
      <div class="uzone-txt">Haz clic para añadir fotos</div>
    </div>
    <input type="file" id="fileInput" multiple accept="image/*" onchange="handleFiles(this)">
    <div id="fileList"></div>
  </div>
  <div class="field">
    <label>¿Hay algo que NO deba aparecer?</label>
    <textarea id="noShow" placeholder="Temas sensibles, personas que prefieren no incluir…" style="min-height:65px;"></textarea>
  </div>
  <div class="nav">
    <button class="btn-back" onclick="go(5)">← Atrás</button>
    <button class="btn-next" onclick="go(7)">Revisar todo →</button>
  </div>
</div>

<div class="screen" id="s7">
  <div class="sh">
    <div class="sh-chapter">07 · Revisión</div>
    <h1 class="sh-title">Todo listo<br>para enviar.</h1>
    <p class="sh-sub">Revisa que todo esté correcto. Puedes volver atrás si quieres cambiar algo.</p>
  </div>
  <div class="sb">
    <h3>Datos del pedido</h3>
    <div class="sr"><span class="sk">Protagonista</span><span class="sv" id="rv-prot">—</span></div>
    <div class="sr"><span class="sk">Para</span><span class="sv" id="rv-child">—</span></div>
    <div class="sr"><span class="sk">Tipo</span><span class="sv" id="rv-type">—</span></div>
    <div class="sr"><span class="sk">Encargado por</span><span class="sv" id="rv-ord">—</span></div>
    <div class="sr"><span class="sk">Email</span><span class="sv" id="rv-email">—</span></div>
    <div class="sr"><span class="sk">Tono</span><span class="sv" id="rv-tone">—</span></div>
  </div>
  <div class="sb">
    <h3>Estructura del libro</h3>
    <div id="rv-chapters"></div>
  </div>
  <div class="sb" style="background:var(--coral-l);border-color:var(--coral);">
    <h3 style="color:var(--coral);">¿Qué pasa ahora?</h3>
    <div class="sr"><span class="sk">48 horas</span><span class="sv">Recibes el borrador del texto completo para revisarlo.</span></div>
    <div class="sr"><span class="sk">+ 3-4 días</span><span class="sv">Ilustraciones y maquetación final.</span></div>
    <div class="sr"><span class="sk">7-10 días</span><span class="sv" style="color:var(--coral);font-weight:700;">El libro en tus manos.</span></div>
  </div>
  <div class="nav">
    <button class="btn-back" onclick="go(6)">← Atrás</button>
    <button class="btn-next" onclick="submit()" style="background:var(--navy);padding:15px 36px;font-size:12px;">Enviar historia ♥</button>
  </div>
</div>

<div class="screen" id="sFinal">
  <div class="fin">
    <div class="fin-h">♥</div>
    <h1 class="fin-t">¡Historia recibida!</h1>
    <p class="fin-s">Gracias por confiar en nosotros con algo tan especial. En las próximas <strong>48 horas</strong> recibirás el borrador del libro para que nos des tu visto bueno.</p>
    <div class="fin-box">Un libro único para <strong id="f-child">los niños</strong><br>sobre las aventuras de <strong id="f-prot">el protagonista</strong></div>
  </div>
</div>

</div>

<script>
let cur = 0;
const TOTAL = 7;
let gender = 'f';
let narrator = 'other';

function setNarrator(val, el) {
  narrator = val;
  document.querySelectorAll('#n1,#n2').forEach(function(o) { o.classList.remove('selected'); });
  el.classList.add('selected');
}

const G = {
  el:   ['ella', 'él'],
  lo:   ['la',   'lo'],
  unna: ['una',  'un'],
  ninoa:['niña', 'niño'],
  oa:   ['a',    'o'],
  name: ['ella', 'él'],
};

function g(key) { return G[key][gender === 'f' ? 0 : 1]; }

function nameOrPronoun() {
  const n = document.getElementById('protName')?.value.trim();
  return n || g('name');
}

function updateAll() {
  const nm = nameOrPronoun();
  document.querySelectorAll('.G-name').forEach(function(el) { el.textContent = nm; });
  var artProt = gender === 'f' ? 'a la protagonista' : 'al protagonista';
  var el1 = document.getElementById('txt-presentamos');
  if (el1) el1.textContent = artProt;
  var el2 = document.getElementById('txt-describirías');
  if (el2) el2.textContent = artProt;
  document.querySelectorAll('.G-el').forEach(function(el) { el.textContent = g('el'); });
  document.querySelectorAll('.G-lo').forEach(function(el) { el.textContent = g('lo'); });
  document.querySelectorAll('.G-unna').forEach(function(el) { el.textContent = g('unna'); });
  document.querySelectorAll('.G-ninoa').forEach(function(el) { el.textContent = g('ninoa'); });
  document.querySelectorAll('.G-oa').forEach(function(el) { el.textContent = g('oa'); });
  var cn = document.getElementById('childNames')?.value.trim() || 'los niños';
  var cnh = document.getElementById('childNamesH');
  if (cnh) cnh.textContent = cn;
}

function setGender(g_val, el) {
  gender = g_val;
  document.querySelectorAll('.gender-opt').forEach(function(o) { o.classList.remove('selected'); });
  el.classList.add('selected');
  updateAll();
}

function onNameInput() { updateAll(); }

function go(n) {
  var prevId = cur <= TOTAL ? 's' + cur : 'sFinal';
  var prevEl = document.getElementById(prevId);
  if (prevEl) prevEl.classList.remove('active');
  cur = n;
  var nextId = n <= TOTAL ? 's' + n : 'sFinal';
  var nextEl = document.getElementById(nextId);
  if (nextEl) nextEl.classList.add('active');
  var stepLbl = document.getElementById('stepLbl');
  if (stepLbl) stepLbl.textContent = n < TOTAL ? ('Paso ' + (n + 1) + ' de ' + TOTAL) : '¡Listo!';
  var prog = document.getElementById('prog');
  if (prog) prog.style.width = Math.min((n / TOTAL) * 100, 100) + '%';
  updateAll();
  if (n === TOTAL) buildReview();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

var recorders = {}, audioBlobs = {}, timers = {}, recSecs = {}, transcribedTexts = {};

async function blobToBase64(blob) {
  return new Promise(function(resolve, reject) {
    var reader = new FileReader();
    reader.onloadend = function() {
      var result = reader.result;
      var base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function transcribeAudio(idx, blob) {
  var bd = document.getElementById('bd' + idx);
  if (bd) { bd.textContent = 'Transcribiendo…'; bd.classList.add('show'); }
  try {
    var base64 = await blobToBase64(blob);
    var res = await fetch('/.netlify/functions/transcribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audioBase64: base64, mimeType: blob.type })
    });
    var data = await res.json();
    if (res.ok && data.text) {
      transcribedTexts[idx] = data.text.trim();
      if (bd) bd.textContent = 'Grabado ✓';
    } else {
      if (bd) bd.textContent = 'Grabado (sin transcribir)';
      transcribedTexts[idx] = '';
    }
  } catch (err) {
    if (bd) bd.textContent = 'Grabado (sin transcribir)';
    transcribedTexts[idx] = '';
  }
}

async function toggleRec(idx) {
  var btn = document.getElementById('rb' + idx);
  if (recorders[idx] && recorders[idx].state === 'recording') { recorders[idx].stop(); return; }
  try {
    var stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    var permBanner = document.getElementById('permBanner');
    if (permBanner) permBanner.classList.remove('show');
    var mr = new MediaRecorder(stream);
    recorders[idx] = mr;
    var chunks = [];
    mr.ondataavailable = function(e) { chunks.push(e.data); };
    mr.onstop = function() {
      stream.getTracks().forEach(function(t) { t.stop(); });
      var blob = new Blob(chunks, { type: 'audio/webm' });
      audioBlobs[idx] = blob;
      var url = URL.createObjectURL(blob);
      var a = document.getElementById('ap' + idx);
      a.src = url; a.classList.add('show');
      document.getElementById('bd' + idx).classList.add('show');
      document.getElementById('bc' + idx).classList.add('show');
      document.getElementById('vc' + idx).classList.add('done');
      btn.classList.remove('rec');
      btn.innerHTML = '<span class="rdot"></span> Grabar';
      clearInterval(timers[idx]);
      transcribeAudio(idx, blob);
    };
    mr.start();
    btn.classList.add('rec');
    btn.innerHTML = '<span class="rdot"></span> Detener';
    recSecs[idx] = 0;
    timers[idx] = setInterval(function() {
      recSecs[idx]++;
      document.getElementById('rt' + idx).textContent = fmt(recSecs[idx]);
    }, 1000);
  } catch(e) {
    var pb = document.getElementById('permBanner');
    if (pb) pb.classList.add('show');
    var tf = document.getElementById('tf' + idx);
    if (tf) tf.classList.add('show');
  }
}

function clearRec(idx) {
  try { if (recorders[idx]) recorders[idx].stop(); } catch(e) {}
  audioBlobs[idx] = null;
  transcribedTexts[idx] = '';
  var a = document.getElementById('ap' + idx);
  a.src = ''; a.classList.remove('show');
  var bd = document.getElementById('bd' + idx);
  bd.textContent = 'Grabado';
  bd.classList.remove('show');
  document.getElementById('bc' + idx).classList.remove('show');
  document.getElementById('vc' + idx).classList.remove('done');
  document.getElementById('rt' + idx).textContent = '0:00';
  var btn = document.getElementById('rb' + idx);
  btn.classList.remove('rec');
  btn.innerHTML = '<span class="rdot"></span> Grabar';
  clearInterval(timers[idx]);
}

function toggleTF(idx) {
  var tf = document.getElementById('tf' + idx);
  if (tf) tf.classList.toggle('show');
}

function fmt(s) { return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }

function selTone(el) {
  document.querySelectorAll('.tone-opt').forEach(function(o) { o.classList.remove('selected'); });
  el.classList.add('selected');
}

function handleFiles(input) {
  var list = document.getElementById('fileList');
  list.innerHTML = '';
  Array.from(input.files).slice(0, 15).forEach(function(f) {
    var d = document.createElement('div');
    d.className = 'fi';
    d.textContent = f.name;
    list.appendChild(d);
  });
}

var CHAPTERS = [
  { name: 'Cap. 0 · Quién es', qs: [0, 1, 2] },
  { name: 'Cap. 1 · Infancia', qs: [3, 4] },
  { name: 'Cap. 2 · Juventud', qs: [5, 6] },
  { name: 'Cap. 3 · Amor y familia', qs: [7, 8] },
  { name: 'Cap. 4 · Con los niños hoy', qs: [9, 10, 11] },
  { name: 'Cap. 5 · El legado', qs: [12, 13] },
];

function buildReview() {
  document.getElementById('rv-prot').textContent  = document.getElementById('protName').value || '—';
  document.getElementById('rv-child').textContent = document.getElementById('childNames').value || '—';
  document.getElementById('rv-type').textContent  = document.getElementById('bookType').value || '—';
  document.getElementById('rv-ord').textContent   = document.getElementById('orderer').value || '—';
  document.getElementById('rv-email').textContent = document.getElementById('email').value || '—';
  var tEl = document.querySelector('.tone-opt.selected .tt');
  document.getElementById('rv-tone').textContent  = tEl ? tEl.textContent : 'Equilibrado';
  var c = document.getElementById('rv-chapters');
  c.innerHTML = '';
  CHAPTERS.forEach(function(ch) {
    var answered = ch.qs.filter(function(i) {
      var tf = document.querySelector('#tf' + i + ' textarea');
      return audioBlobs[i] || (tf && tf.value && tf.value.trim());
    }).length;
    var row = document.createElement('div');
    row.className = 'sr';
    row.innerHTML = '<span class="sk" style="text-transform:none;letter-spacing:0;font-size:12px;">' + ch.name + '</span><span class="sv">' + answered + '/' + ch.qs.length + ' respondidas ' + (answered === ch.qs.length ? '✓' : '') + '</span>';
    c.appendChild(row);
  });
}

async function submit() {
  var btn = document.querySelector('.btn-next[onclick="submit()"]');
  if (btn) { btn.disabled = true; btn.textContent = 'Enviando…'; }

  var payload = {
    protagonistName: document.getElementById('protName').value || '',
    childName:       document.getElementById('childNames').value || '',
    gender:          gender === 'f' ? 'mujer' : 'hombre',
    relacion:        document.getElementById('bookType').value || '',
    senderName:      document.getElementById('orderer').value || '',
    senderEmail:     document.getElementById('email').value || '',
    q1_nacimiento:   document.getElementById('birthPlace') ? document.getElementById('birthPlace').value : '',
    q1_apodo:        document.getElementById('job') ? document.getElementById('job').value : '',
    q2_juego:        document.getElementById('sport') ? document.getElementById('sport').value : '',
    q5_lugar:        document.getElementById('places') ? document.getElementById('places').value : '',
    tone:            document.querySelector('.tone-opt.selected .tt') ? document.querySelector('.tone-opt.selected .tt').textContent : 'Equilibrado',
    narrator:        narrator === 'protagonist' ? 'protagonista' : 'otra_persona',
  };

  var fieldMap = {0:'q1_nombre',1:'q2_lugar',2:'q2_recuerdo',3:'q2_recuerdo',4:'q2_juego',5:'q3_sueno',6:'q3_aventura',7:'q4_pareja',8:'q4_hijos',9:'q5_actividad',10:'q5_actividad',11:'q5_lugar',12:'q6_consejo',13:'q6_deseo'};
  for (var i = 0; i <= 13; i++) {
    var tf = document.querySelector('#tf' + i + ' textarea');
    var value = (transcribedTexts[i] && transcribedTexts[i].trim())
      ? transcribedTexts[i].trim()
      : (tf && tf.value && tf.value.trim() ? tf.value.trim() : '');
    if (value) payload[fieldMap[i] || ('q_extra_' + i)] = value;
  }

  try {
    var res = await fetch('https://hook.eu1.make.com/h864auv9w041kwjae8tbijl9ktinkw61', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      document.getElementById('f-child').textContent = document.getElementById('childNames').value || 'los niños';
      document.getElementById('f-prot').textContent  = document.getElementById('protName').value  || 'el protagonista';
      go(TOTAL + 1);
    } else {
      alert('Hubo un error al enviar. Por favor inténtalo de nuevo.');
      if (btn) { btn.disabled = false; btn.textContent = 'Enviar historia ♥'; }
    }
  } catch(err) {
    alert('Error de conexión. Por favor inténtalo de nuevo.');
    if (btn) { btn.disabled = false; btn.textContent = 'Enviar historia ♥'; }
  }
}

document.getElementById('prog').style.width = '0%';
updateAll();
</script>
</body>
</html>
