// Reproductor de video de Korex.
//   const p = KorexPlayer(contenedor, { src, poster, capitulos: [{ t: 13.7, titulo: 'Crea tu cuenta', n: '1' }], clave: 'aitech' });
//   p.ir(segundos)  — salta a ese momento y reproduce.
// Sin controles nativos (no hay botón ni menú de descarga), sin clic derecho, sin "guardar video" al mantener apretado,
// sin imagen en imagen. Velocidad, pantalla completa, capítulos y "seguir donde quedaste".
(function () {
  const ICO = {
    play: '<svg viewBox="0 0 24 24"><path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5z"/></svg>',
    pausa: '<svg viewBox="0 0 24 24"><rect x="6" y="4.5" width="4.2" height="15" rx="1"/><rect x="13.8" y="4.5" width="4.2" height="15" rx="1"/></svg>',
    atras: '<svg viewBox="0 0 24 24"><path d="M12 5V2L7 6l5 4V7a6 6 0 1 1-6 6H4a8 8 0 1 0 8-8z"/><text x="12" y="16.5" font-size="7" text-anchor="middle" font-weight="800" font-family="system-ui">10</text></svg>',
    adelante: '<svg viewBox="0 0 24 24"><path d="M12 5V2l5 4-5 4V7a6 6 0 1 0 6 6h2a8 8 0 1 1-8-8z"/><text x="12" y="16.5" font-size="7" text-anchor="middle" font-weight="800" font-family="system-ui">10</text></svg>',
    lista: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="2.4" rx="1.2"/><rect x="3" y="10.8" width="18" height="2.4" rx="1.2"/><rect x="3" y="16.6" width="12" height="2.4" rx="1.2"/></svg>',
    pantalla: '<svg viewBox="0 0 24 24"><path d="M4 9V4h5v2H6v3H4zm11-5h5v5h-2V6h-3V4zM4 15h2v3h3v2H4v-5zm14 3v-3h2v5h-5v-2h3z"/></svg>',
  };
  const VELS = [1, 1.25, 1.5, 1.75, 2];
  const mmss = (s) => { s = Math.max(0, Math.floor(s || 0)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };

  window.KorexPlayer = function (raiz, o) {
    const caps = (o.capitulos || []).slice().sort((a, b) => a.t - b.t);
    raiz.classList.add('kp');
    if (o.ratio) raiz.style.setProperty('--kp-ratio', o.ratio);
    if (o.poster) raiz.style.setProperty('--kp-poster', `url("${new URL(o.poster, location.href).href}")`);
    raiz.classList.add('espera');
    raiz.innerHTML = `
      <video playsinline webkit-playsinline preload="metadata" disablepictureinpicture disableremoteplayback controlslist="nodownload noplaybackrate noremoteplayback nofullscreen"></video>
      <div class="kp-toque"></div>
      <div class="kp-cap"></div>
      <div class="kp-aviso"></div>
      <div class="kp-ui">
        <div class="kp-barra"><div class="kp-pista"><div class="kp-carga"></div><div class="kp-hecho"></div>${caps.map(() => '<i class="kp-marca"></i>').join('')}<div class="kp-bola"></div></div></div>
        <div class="kp-fila">
          <button class="kp-b" data-a="play" aria-label="Reproducir o pausar">${ICO.play}</button>
          <button class="kp-b" data-a="atras" aria-label="Atrás 10 segundos">${ICO.atras}</button>
          <button class="kp-b" data-a="adelante" aria-label="Adelante 10 segundos">${ICO.adelante}</button>
          <span class="kp-tiempo">0:00 / 0:00</span><span class="kp-esp"></span>
          <button class="kp-b vel" data-a="vel" aria-label="Velocidad">1x</button>
          ${caps.length ? `<button class="kp-b" data-a="lista" aria-label="Capítulos">${ICO.lista}</button>` : ''}
          <button class="kp-b" data-a="pantalla" aria-label="Pantalla completa">${ICO.pantalla}</button>
        </div>
      </div>
      <div class="kp-lista"><h3>Ir a…</h3>${caps.map((c, i) => `<button data-i="${i}"><span class="n">${c.n ?? i + 1}</span>${c.titulo}<span class="t">${mmss(c.t)}</span></button>`).join('')}</div>
      <button class="kp-inicio" aria-label="Ver el video con sonido"><span class="kp-play"><svg viewBox="0 0 24 24"><path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5z"/></svg></span>
        <span class="kp-leyenda">${o.leyenda || 'Toca para ver con sonido'}</span></button>`;
    const $ = (s) => raiz.querySelector(s), v = $('video');
    // la dirección del archivo se arma recién acá (no queda en el HTML)
    v.src = o.src;
    if (o.poster) v.poster = o.poster;
    raiz.addEventListener('contextmenu', (e) => e.preventDefault());
    raiz.addEventListener('dragstart', (e) => e.preventDefault());

    let ocultarT = 0, vel = 1, iniciado = false;
    const clave = 'kp-pos-' + (o.clave || o.src);
    const mostrar = () => { raiz.classList.remove('oculta'); clearTimeout(ocultarT); if (!v.paused) ocultarT = setTimeout(() => raiz.classList.add('oculta'), 2800); };
    const aviso = (txt) => { const a = $('.kp-aviso'); a.textContent = txt; a.classList.add('ver'); clearTimeout(a._t); a._t = setTimeout(() => a.classList.remove('ver'), 700); };
    const capActual = () => { let k = -1; caps.forEach((c, i) => { if (v.currentTime >= c.t - .3) k = i; }); return k; };
    const lanzar = () => { if (!iniciado) { iniciado = true; $('.kp-inicio').remove(); raiz.classList.remove('espera'); } v.play().catch(() => {}); };
    const api = {
      ir(t) { v.currentTime = Math.max(0, t); lanzar(); mostrar(); },
      video: v,
    };
    $('.kp-inicio').addEventListener('click', () => {
      let pos = 0; try { pos = +localStorage.getItem(clave) || 0; } catch (e) {}
      if (pos > 8 && pos < (v.duration || 1e9) - 8) v.currentTime = pos;
      lanzar(); mostrar();
    });
    $('.kp-toque').addEventListener('click', () => {
      if (!iniciado) return;
      if (raiz.classList.contains('oculta')) { mostrar(); return; }
      v.paused ? v.play() : v.pause(); mostrar();
    });
    // doble toque a los lados: ±10 s
    let ultimo = 0;
    $('.kp-toque').addEventListener('pointerup', (e) => {
      const ahora = Date.now(), r = raiz.getBoundingClientRect(), x = (e.clientX - r.left) / r.width;
      if (ahora - ultimo < 300 && (x < .33 || x > .67)) { v.currentTime += x < .5 ? -10 : 10; aviso(x < .5 ? '« 10 s' : '10 s »'); }
      ultimo = ahora;
    });
    raiz.querySelector('.kp-fila').addEventListener('click', (e) => {
      const b = e.target.closest('[data-a]'); if (!b) return; const a = b.dataset.a;
      if (a === 'play') v.paused ? lanzar() : v.pause();
      if (a === 'atras') v.currentTime -= 10;
      if (a === 'adelante') v.currentTime += 10;
      if (a === 'vel') { vel = VELS[(VELS.indexOf(vel) + 1) % VELS.length]; v.playbackRate = vel; b.textContent = vel + 'x'; aviso('Velocidad ' + vel + 'x'); }
      if (a === 'lista') $('.kp-lista').classList.add('abierta');
      if (a === 'pantalla') pantalla();
      mostrar();
    });
    $('.kp-lista').addEventListener('click', (e) => {
      const b = e.target.closest('[data-i]'); $('.kp-lista').classList.remove('abierta');
      if (b) api.ir(caps[+b.dataset.i].t);
    });
    function pantalla() {
      const d = document;
      if (d.fullscreenElement || d.webkitFullscreenElement) { (d.exitFullscreen || d.webkitExitFullscreen).call(d); return; }
      const pedir = raiz.requestFullscreen || raiz.webkitRequestFullscreen;
      if (pedir) {
        Promise.resolve(pedir.call(raiz)).then(() => { if (o.horizontal && screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(() => {}); }).catch(() => {});
      } else if (v.webkitEnterFullscreen) v.webkitEnterFullscreen();   // iPhone: pantalla completa del sistema
    }
    // barra de progreso (arrastre con dedo o mouse)
    const barra = $('.kp-barra');
    const buscar = (e) => { const r = $('.kp-pista').getBoundingClientRect(); const x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)); if (v.duration) v.currentTime = x * v.duration; };
    barra.addEventListener('pointerdown', (e) => { barra.setPointerCapture(e.pointerId); buscar(e); mostrar();
      const mover = (ev) => buscar(ev), soltar = () => { barra.removeEventListener('pointermove', mover); barra.removeEventListener('pointerup', soltar); };
      barra.addEventListener('pointermove', mover); barra.addEventListener('pointerup', soltar); });
    v.addEventListener('loadedmetadata', () => {
      raiz.querySelectorAll('.kp-marca').forEach((m, i) => { m.style.left = (caps[i].t / v.duration * 100) + '%'; });
    });
    let guardarT = 0;
    const pintar = () => {
      const d = v.duration || 1, p = v.currentTime / d * 100;
      $('.kp-hecho').style.width = p + '%'; $('.kp-bola').style.left = p + '%';
      try { if (v.buffered.length) $('.kp-carga').style.width = (v.buffered.end(v.buffered.length - 1) / d * 100) + '%'; } catch (e) {}
      $('.kp-tiempo').textContent = `${mmss(v.currentTime)} / ${mmss(v.duration)}`;
      const k = capActual();
      $('.kp-cap').innerHTML = k >= 0 ? `<b>${caps[k].n ?? k + 1}</b>${caps[k].titulo}` : (o.titulo || '');
      raiz.querySelectorAll('.kp-lista button').forEach((b, i) => b.classList.toggle('act', i === k));
      if (o.alCambiar) o.alCambiar(k);
      if (Date.now() - guardarT > 2000) { guardarT = Date.now(); try { localStorage.setItem(clave, v.ended ? 0 : v.currentTime); } catch (e) {} }
    };
    v.addEventListener('timeupdate', pintar);
    v.addEventListener('play', () => { $('.kp-b[data-a=play]').innerHTML = ICO.pausa; mostrar(); });
    v.addEventListener('pause', () => { $('.kp-b[data-a=play]').innerHTML = ICO.play; mostrar(); });
    v.addEventListener('ended', () => { try { localStorage.setItem(clave, 0); } catch (e) {} if (o.alTerminar) o.alTerminar(); });
    raiz.tabIndex = 0;
    raiz.addEventListener('keydown', (e) => {
      if (!iniciado) return;
      if (e.key === ' ' || e.key === 'k') { e.preventDefault(); v.paused ? v.play() : v.pause(); }
      if (e.key === 'ArrowRight') v.currentTime += 5; if (e.key === 'ArrowLeft') v.currentTime -= 5; if (e.key === 'f') pantalla();
      mostrar();
    });
    return api;
  };
})();
