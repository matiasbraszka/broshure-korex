// Menú fijo arriba para saltar entre los videos tutoriales del Equipo Korex.
// Se carga justo después de <body>:  <script src="/reproductor/tutoriales.js"></script>
// Para sumar un video nuevo: agregarlo a VIDEOS y poner esa misma línea en su página.
(function () {
  const VIDEOS = [
    { href: '/tutorial-aitech/', nombre: 'Registro AI Tech', dur: '4:59', a: 'linear-gradient(135deg,#0EC8F0,#2D6BFF)', t: '#fff', sombra: 'rgba(14,200,240,.45)' },
    { href: '/tutorial-myfxbook/', nombre: 'MyFXBook Sonic', dur: '5:28', a: 'linear-gradient(135deg,#0EC8F0,#2D6BFF)', t: '#fff', sombra: 'rgba(14,200,240,.45)' },
    { href: '/bixinstalacion/', nombre: 'Tarjeta BIX', dur: '3:04', a: '#cafe5c', t: '#10140a', sombra: 'rgba(202,254,92,.4)' },
  ];
  const css = `
.tm-nav { position: sticky; top: 0; z-index: 30; padding: calc(8px + env(safe-area-inset-top)) 10px 8px;
  background: rgba(4,7,14,.86); -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px); border-bottom: 1px solid rgba(255,255,255,.09); }
.tm-fila { display: grid; grid-template-columns: repeat(${VIDEOS.length}, 1fr); gap: 6px; max-width: 620px; margin: 0 auto; }
.tm-it { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 50px; padding: 6px 4px; border-radius: 12px;
  text-decoration: none; color: #e9edf7; background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.12); text-align: center; line-height: 1.15; }
.tm-it b { font-weight: 800; font-size: 13.5px; letter-spacing: -.1px; }
.tm-it small { font-size: 11px; font-weight: 700; opacity: .65; margin-top: 3px; }
.tm-it.act { border-color: transparent; }
.tm-it.act small { opacity: .85; }
@media (hover: hover) { .tm-it:not(.act):hover { background: rgba(255,255,255,.11); } }
#reproductor { scroll-margin-top: calc(var(--tm-alto, 68px) + 10px); }
@media (max-height: 560px) { .tm-nav { padding-top: calc(5px + env(safe-area-inset-top)); padding-bottom: 5px; }
  .tm-it { min-height: 34px; flex-direction: row; gap: 6px; padding: 4px 8px; } .tm-it small { margin-top: 0; } }`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  const aqui = location.pathname.replace(/\/+$/, '') + '/';
  const nav = document.createElement('nav');
  nav.className = 'tm-nav'; nav.setAttribute('aria-label', 'Videos tutoriales');
  nav.innerHTML = '<div class="tm-fila">' + VIDEOS.map((v) => {
    const act = aqui === v.href;
    const est = act ? ` style="background:${v.a};color:${v.t};box-shadow:0 6px 22px -8px ${v.sombra}"` : '';
    return `<a class="tm-it${act ? ' act' : ''}" href="${v.href}"${act ? ' aria-current="page"' : ''}${est}><b>${v.nombre}</b><small>${act ? '▶ Viendo · ' : ''}${v.dur}</small></a>`;
  }).join('') + '</div>';
  document.body.prepend(nav);
  // El alto real de la barra (cambia con el zoom o la pantalla) lo usan las páginas para que el video entre entero.
  const medir = () => document.documentElement.style.setProperty('--tm-alto', nav.offsetHeight + 'px');
  medir(); addEventListener('resize', medir);
})();
