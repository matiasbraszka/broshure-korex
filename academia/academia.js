/* Academia KOREX — info.metodokorex.com/academia
   Todo el contenido llega de la función `academia` (Supabase) y solo con contraseña.
   Clave de usuario: ve y descarga. Clave de admin: además agrega, edita y borra. */
(function () {
  "use strict";
  var FN = "https://cgdwieoxjoexzlfbxrfc.supabase.co/functions/v1/academia";
  var KEY = "kx-academia-clave";
  var TUS_JS = "https://cdn.jsdelivr.net/npm/tus-js-client@4.1.0/dist/tus.min.js";

  var P = {
    play: '<path d="M8 5.5v13l11-6.5z"/>',
    folder: '<path d="M3.5 7.5a2 2 0 0 1 2-2h4l2 2.2h7a2 2 0 0 1 2 2v7.8a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z"/>',
    file: '<path d="M14 3.5H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5z"/><path d="M14 3.5v5h5"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h8"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    down: '<path d="M12 4v11"/><path d="M7 10l5 5 5-5"/><path d="M5 20h14"/>',
    ext: '<path d="M14 4h6v6"/><path d="M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    back: '<path d="M15 6l-6 6 6 6"/>',
    chev: '<path d="M9 6l6 6-6 6"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    pen: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
    trash: '<path d="M5 7h14M10 7V5h4v2M7 7l1 13h8l1-13"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>',
    up: '<path d="M12 16V5"/><path d="M7 10l5-5 5 5"/><path d="M5 20h14"/>',
    img: '<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="M20.5 16l-5-5-8 8.5"/>',
    vid: '<rect x="3" y="5.5" width="13" height="13" rx="2"/><path d="M16 10l5-3v10l-5-3"/>',
    arr: '<path d="M12 6v12M7 11l5-5 5 5"/>',
    abj: '<path d="M12 6v12M7 13l5 5 5-5"/>'
  };
  function ic(n, extra) { return '<svg class="i' + (extra ? " " + extra : "") + '" viewBox="0 0 24 24" aria-hidden="true">' + P[n] + "</svg>"; }
  function $(s, r) { return (r || document).querySelector(s); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function lsGet() { try { return localStorage.getItem(KEY) || ""; } catch (e) { return ""; } }
  function lsSet(v) { try { v ? localStorage.setItem(KEY, v) : localStorage.removeItem(KEY); } catch (e) {} }

  var S = { clave: "", rol: "", items: [], tab: "videos", carpeta: null, curso: null, filtro: "todo", q: "", abiertos: {} };
  var TABS = [["videos", "Cursos"], ["recursos", "Recursos"], ["guiones", "Guiones"], ["links", "Links"]];
  function admin() { return S.rol === "admin"; }

  /* ---------------- servidor ---------------- */
  function api(accion, extra) {
    var body = Object.assign({ accion: accion, clave: S.clave }, extra || {});
    return fetch(FN, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      .then(function (r) { return r.json().catch(function () { return { ok: false, error: "red" }; }).then(function (j) { j._status = r.status; return j; }); });
  }
  function recargar() {
    return api("datos").then(function (j) {
      if (j._status === 401) { salir(); return; }
      if (!j.ok) { toast("No se pudo actualizar. Prueba de nuevo."); return; }
      S.items = j.items || []; S.rol = j.rol; render();
    });
  }

  /* ---------------- entrada ---------------- */
  function entrar(clave, silencioso) {
    var b = $("#bEntrar"); b.disabled = true; b.textContent = "Entrando…"; $("#err").textContent = "";
    S.clave = clave;
    return api("entrar").then(function (j) {
      b.disabled = false; b.textContent = "Entrar";
      if (!j.ok) {
        S.clave = ""; lsSet("");
        if (!silencioso) $("#err").textContent = j._status === 401 ? "La contraseña no es correcta." : "No se pudo entrar. Revisa tu conexión.";
        $("#login").hidden = false; $("#app").hidden = true;
        return;
      }
      lsSet(clave); S.rol = j.rol; S.items = j.items || [];
      try { var t = sessionStorage.getItem("kx-academia-tab"); if (t) S.tab = t; } catch (e) {}
      $("#login").hidden = true; $("#app").hidden = false; render();
    }).catch(function () { b.disabled = false; b.textContent = "Entrar"; $("#err").textContent = "No se pudo entrar. Revisa tu conexión."; });
  }
  function salir() { S.clave = ""; S.rol = ""; S.items = []; lsSet(""); $("#app").hidden = true; $("#login").hidden = false; $("#clave").value = ""; }
  $("#fLogin").addEventListener("submit", function (e) { e.preventDefault(); var v = $("#clave").value.trim(); if (v) entrar(v); });
  $("#bSalir").addEventListener("click", salir);

  /* ---------------- datos ---------------- */
  function de(seccion) { return S.items.filter(function (x) { return x.seccion === seccion; }); }
  function hay(x) {
    if (!S.q) return true;
    var t = [x.titulo, x.descripcion, x.texto, x.grupo, x.url].join(" ").toLowerCase();
    return t.indexOf(S.q) > -1;
  }
  function hijos(id) { return S.items.filter(function (x) { return x.seccion === "archivo" && x.padre === id; }); }
  function porId(id) { for (var i = 0; i < S.items.length; i++) if (S.items[i].id === id) return S.items[i]; return null; }
  function grupos(lista) {
    var orden = [], m = {};
    lista.forEach(function (x) { var g = x.grupo || "Otros"; if (!m[g]) { m[g] = []; orden.push(g); } m[g].push(x); });
    return orden.map(function (g) { return [g, m[g]]; });
  }
  function abs(u) { return /^\//.test(u || "") ? location.origin + u : u; }
  function corta(u) { return String(u || "").replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, ""); }

  /* ---------------- pantalla ---------------- */
  function render() {
    $("#badge").hidden = !admin();
    var cuenta = { videos: cursos().length, recursos: de("carpeta").length, guiones: de("guion").length, links: de("link").length };
    $("#tabs").innerHTML = TABS.map(function (t) {
      return '<button class="tab' + (S.tab === t[0] ? " on" : "") + '" role="tab" data-tab="' + t[0] + '">' + t[1] + " <em>" + cuenta[t[0]] + "</em></button>";
    }).join("");
    var h = "";
    if (S.tab === "videos") h = S.curso && lecciones(S.curso).length ? vCurso(S.curso) : vVideos();
    else if (S.tab === "recursos") h = S.carpeta && porId(S.carpeta) ? vCarpeta(porId(S.carpeta)) : vCarpetas();
    else if (S.tab === "guiones") h = vGuiones();
    else h = vLinks();
    $("#main").innerHTML = h;
    var q = $("#q");
    if (q && document.activeElement !== q && S.q) { q.value = S.q; }
  }
  function buscador(ph) {
    return '<div class="bar"><label class="search">' + ic("search") + '<input id="q" type="search" placeholder="' + ph + '" value="' + esc(S.q) + '" autocomplete="off" aria-label="Buscar"></label></div>';
  }

  // Cursos = videos agrupados por "grupo". El orden de los cursos lo da su primer video.
  function cursoDe(v) { return v.grupo || "General"; }
  function cursos() { return grupos(de("video").map(function (v) { return Object.assign({}, v, { grupo: cursoDe(v) }); })).map(function (g) { return g[0]; }); }
  function lecciones(nombre) { return de("video").filter(function (v) { return cursoDe(v) === nombre; }); }
  function poster(v, extra) { return '<div class="poster"' + (v && v.miniatura ? ' style="background-image:url(\'' + esc(v.miniatura) + '\'),linear-gradient(140deg,#0a1730,#18306a)"' : "") + ">" + (extra || "") + "</div>"; }
  function nVideos(n) { return n + (n === 1 ? " video" : " videos"); }

  function vVideos() {
    var cs = cursos().filter(function (c) { return !S.q || c.toLowerCase().indexOf(S.q) > -1 || lecciones(c).some(hay); });
    var h = '<div class="h2"><h2>Cursos</h2></div><p class="intro">Elige un curso y mira sus videos en orden.</p>' + buscador("Buscar cursos o videos");
    h += '<div class="gv">';
    cs.forEach(function (c) {
      var ls = lecciones(c);
      h += '<button class="vcard ccard" type="button" data-curso="' + esc(c) + '">' + poster(ls[0], '<span class="cnt">' + ic("vid") + nVideos(ls.length) + "</span>") +
        '<div class="vbody"><b>' + esc(c) + "</b><span>" + ls.map(function (v, i) { return (i + 1) + ". " + esc(v.titulo); }).slice(0, 3).join("<br>") + (ls.length > 3 ? "<br>…" : "") + "</span></div></button>";
    });
    if (admin()) h += '<button class="addcard" data-nuevo="video" type="button"><span class="plus">' + ic("plus") + "</span>Nuevo curso o video</button>";
    h += "</div>";
    if (!cs.length && !admin()) h += '<div class="empty">' + (S.q ? "No hay cursos con esa búsqueda." : "Todavía no hay cursos.") + "</div>";
    return h;
  }

  function vCurso(c) {
    var ls = lecciones(c);
    var h = '<button class="back" data-volver type="button">' + ic("back") + "Cursos</button>" +
      '<div class="h2"><h2>' + esc(c) + "</h2>" + (admin() ? '<button class="btn sec" data-renombrar type="button">' + ic("pen") + "Renombrar curso</button>" : "") + "</div>" +
      '<p class="intro">' + nVideos(ls.length) + ". Míralos en orden.</p>";
    h += '<ol class="lecs">';
    ls.forEach(function (v, i) {
      h += '<li class="lec"><button class="lec-b" type="button" data-ver="' + esc(v.id) + '">' + '<span class="lec-n">' + (i + 1) + "</span>" +
        poster(v, '<span class="play">' + ic("play") + "</span>") +
        '<span class="lec-t"><b>' + esc(v.titulo) + "</b>" + (v.descripcion ? "<span>" + esc(v.descripcion) + "</span>" : "") + "</span></button>" +
        (admin() ? '<div class="lec-a">' +
          (i > 0 ? '<button class="mini ico" data-mover="' + esc(v.id) + '" data-dir="-1" title="Subir">' + ic("arr") + "</button>" : "") +
          (i < ls.length - 1 ? '<button class="mini ico" data-mover="' + esc(v.id) + '" data-dir="1" title="Bajar">' + ic("abj") + "</button>" : "") +
          '<button class="mini ico" data-editar="' + esc(v.id) + '" title="Editar">' + ic("pen") + '</button><button class="mini ico" data-borrar="' + esc(v.id) + '" title="Borrar">' + ic("trash") + "</button></div>" : "") +
        "</li>";
    });
    h += "</ol>";
    if (admin()) h += '<button class="addcard addrow" data-nuevo="video" type="button"><span class="plus">' + ic("plus") + "</span>Agregar video a este curso</button>";
    return h;
  }

  // Reordena dentro del curso: renumera todo el curso (10, 20, 30…) a partir de su primer orden.
  function mover(id, dir) {
    var v = porId(id); if (!v) return;
    var ls = lecciones(cursoDe(v)), i = ls.indexOf(v), j = i + dir;
    if (j < 0 || j >= ls.length) return;
    var base = Math.min.apply(null, ls.map(function (x) { return x.orden || 0; }));
    ls.splice(i, 1); ls.splice(j, 0, v);
    var cambios = [];
    ls.forEach(function (x, k) { var o = base + k * 10; if (x.orden !== o) { x.orden = o; cambios.push({ id: x.id, titulo: x.titulo, orden: o }); } });
    S.items.sort(function (a, b) { return (a.orden || 0) - (b.orden || 0); });
    render();
    Promise.all(cambios.map(function (it) { return api("guardar", { item: it }); })).then(function (rs) {
      if (rs.some(function (r) { return !r.ok; })) { toast("No se pudo guardar el orden."); recargar(); }
    });
  }

  function renombrar(c) {
    dlg("Renombrar curso", campo("fCurso", "Nombre del curso", c), '<button class="btn sec" data-dcerrar2 type="button">Cancelar</button><button class="btn" id="fOk" type="button">Guardar</button>');
    $("[data-dcerrar2]").onclick = cerrar;
    $("#fOk").onclick = function () {
      var n = val("fCurso"); if (!n) { toast("Falta el nombre."); return; }
      if (n === c) { cerrar(); return; }
      this.disabled = true;
      Promise.all(lecciones(c).map(function (v) { return api("guardar", { item: { id: v.id, titulo: v.titulo, grupo: n } }); })).then(function () {
        cerrar(); S.curso = n; toast("Curso renombrado"); return recargar();
      });
    };
  }

  function vCarpetas() {
    var l = de("carpeta").filter(function (c) { return hay(c) || hijos(c.id).some(hay); });
    var h = '<div class="h2"><h2>Recursos</h2></div><p class="intro">Imágenes y videos para descargar y compartir.</p>' + buscador("Buscar carpetas o archivos");
    if (S.q) {
      var arch = de("archivo").filter(hay);
      if (arch.length) return h + '<p class="h3">' + arch.length + " archivos</p>" + grillaArchivos(arch);
    }
    h += '<div class="gf">';
    l.forEach(function (c) {
      var hs = hijos(c.id), ni = hs.filter(function (x) { return x.tipo === "image"; }).length, nv = hs.filter(function (x) { return x.tipo === "video"; }).length, no = hs.length - ni - nv;
      var partes = []; if (ni) partes.push(ni + (ni === 1 ? " imagen" : " imágenes")); if (nv) partes.push(nv + (nv === 1 ? " video" : " videos")); if (no) partes.push(no + (no === 1 ? " archivo" : " archivos"));
      h += '<div class="fcard"><button type="button" data-abrir="' + esc(c.id) + '" style="display:flex;align-items:center;gap:14px;flex:1;min-width:0;text-align:left">' +
        '<span class="fic">' + ic("folder") + '</span><span class="ft"><b>' + esc(c.titulo) + "</b><span>" + (partes.join(" · ") || "Vacía") + "</span></span></button>" +
        (admin() ? '<div class="corner"><button class="mini ico" data-editar="' + esc(c.id) + '" title="Renombrar">' + ic("pen") + '</button><button class="mini ico del" data-borrar="' + esc(c.id) + '" title="Borrar carpeta">' + ic("trash") + "</button></div>" : "") +
        "</div>";
    });
    if (admin()) h += '<button class="addcard" style="min-height:82px" data-nuevo="carpeta" type="button"><span class="plus">' + ic("plus") + "</span>Nueva carpeta</button>";
    h += "</div>";
    if (!l.length && !admin()) h += '<div class="empty">No hay carpetas con esa búsqueda.</div>';
    return h;
  }

  function vCarpeta(c) {
    var hs = hijos(c.id);
    var tipos = [["todo", "Todo"], ["image", "Imágenes"], ["video", "Videos"], ["otro", "Otros"]].filter(function (t) {
      return t[0] === "todo" || hs.some(function (x) { return t[0] === "otro" ? (x.tipo !== "image" && x.tipo !== "video") : x.tipo === t[0]; });
    });
    if (!tipos.some(function (t) { return t[0] === S.filtro; })) S.filtro = "todo";
    var l = hs.filter(function (x) { return S.filtro === "todo" || (S.filtro === "otro" ? (x.tipo !== "image" && x.tipo !== "video") : x.tipo === S.filtro); });
    var h = '<button class="back" data-volver type="button">' + ic("back") + "Recursos</button>" +
      '<div class="h2"><h2>' + esc(c.titulo) + "</h2>" + (admin() ? '<button class="btn" data-subir="' + esc(c.id) + '" type="button">' + ic("up") + "Subir archivos</button>" : "") + "</div>" +
      (c.descripcion ? '<p class="intro">' + esc(c.descripcion) + "</p>" : "") +
      (admin() && c.en_vivo ? '<p class="intro" style="color:var(--warn-text)">Esta carpeta muestra en vivo los anuncios editados del panel. Lo que borres aquí solo se oculta en la Academia.</p>' : "");
    if (tipos.length > 2) h += '<div class="chips">' + tipos.map(function (t) { return '<button class="chip' + (S.filtro === t[0] ? " on" : "") + '" data-filtro="' + t[0] + '" type="button">' + t[1] + "</button>"; }).join("") + "</div>";
    h += l.length ? grillaArchivos(l) : '<div class="empty">' + (admin() ? "Carpeta vacía. Usa «Subir archivos»." : "Esta carpeta todavía está vacía.") + "</div>";
    return h;
  }
  function grillaArchivos(l) {
    return '<div class="gm">' + l.map(function (x) {
      var fondo = x.miniatura ? ' style="background-image:url(\'' + esc(x.miniatura) + '\')"' : "";
      var fmt = x.tipo === "video" ? "VIDEO" : x.tipo === "image" ? "" : (x.tipo === "pdf" ? "PDF" : "ARCHIVO");
      return '<div class="tile"><button type="button" data-ver="' + esc(x.id) + '" style="display:block;text-align:left"><div class="thumb"' + fondo + ">" +
        (!x.miniatura ? ic(x.tipo === "video" ? "vid" : x.tipo === "image" ? "img" : "file", "big") : "") +
        (fmt ? '<span class="fmt">' + fmt + "</span>" : "") + (x.tipo === "video" ? '<span class="pl">' + ic("play") + "</span>" : "") + "</div></button>" +
        '<div class="tmeta"><b title="' + esc(x.titulo) + '">' + esc(x.titulo) + "</b>" +
        (x.descargable !== false && (x.descarga || x.url) ? '<button class="mini ico" data-bajar="' + esc(x.id) + '" title="Descargar" type="button">' + ic("down") + "</button>" : "") +
        (admin() ? '<button class="mini ico del" data-borrar="' + esc(x.id) + '" title="' + (x.panel ? "Ocultar de la Academia" : "Borrar") + '" type="button">' + ic("trash") + "</button>" : "") +
        "</div></div>";
    }).join("") + "</div>";
  }

  function vGuiones() {
    var l = de("guion").filter(hay);
    var h = '<div class="h2"><h2>Guiones</h2>' + (admin() ? '<button class="btn" data-nuevo="guion" type="button">' + ic("plus") + "Nuevo guion</button>" : "") + '</div><p class="intro">Toca «Copiar» y pégalo en WhatsApp. Cambia lo que está entre [corchetes].</p>' + buscador("Buscar en los guiones");
    var gs = grupos(l);
    if (!gs.length) return h + '<div class="empty">' + (S.q ? "No hay guiones con esa búsqueda." : "Todavía no hay guiones.") + "</div>";
    h += '<div class="gg">';
    gs.forEach(function (g, i) {
      var open = S.q || S.abiertos[g[0]] || (S.abiertos[g[0]] === undefined && i === 0);
      h += '<section class="grp' + (open ? " open" : "") + '"><button class="grp-h" data-grupo="' + esc(g[0]) + '" type="button">' + ic("chev", "chev") + esc(g[0]) + "<em>" + g[1].length + '</em></button><div class="grp-b">';
      g[1].forEach(function (x) {
        h += '<article class="gcard"><div class="gcard-h"><b>' + esc(x.titulo) + "</b>" +
          (admin() ? '<button class="mini ico" data-editar="' + esc(x.id) + '" title="Editar" type="button">' + ic("pen") + '</button><button class="mini ico del" data-borrar="' + esc(x.id) + '" title="Borrar" type="button">' + ic("trash") + "</button>" : "") +
          '<button class="mini btn-copy" data-copiar="' + esc(x.id) + '" type="button">' + ic("copy") + "Copiar</button></div>" +
          '<p class="gtxt">' + esc(x.texto) + "</p></article>";
      });
      h += "</div></section>";
    });
    return h + "</div>";
  }

  function vLinks() {
    var l = de("link").filter(hay);
    var h = '<div class="h2"><h2>Links</h2>' + (admin() ? '<button class="btn" data-nuevo="link" type="button">' + ic("plus") + "Nuevo link</button>" : "") + "</div>" + buscador("Buscar links");
    var gs = grupos(l);
    if (!gs.length) return h + '<div class="empty">' + (S.q ? "No hay links con esa búsqueda." : "Todavía no hay links.") + "</div>";
    gs.forEach(function (g) {
      h += '<section class="lgrp"><div class="lgrp-h">' + esc(g[0]) + "</div>";
      g[1].forEach(function (x) {
        h += '<div class="lrow"><span class="lic">' + ic("link") + '</span><div class="lt"><b>' + esc(x.titulo) + "</b>" + (x.descripcion ? "<span>" + esc(x.descripcion) + "</span>" : "") + "<code>" + esc(corta(x.url)) + "</code></div>" +
          '<div class="la"><a class="mini" href="' + esc(x.url) + '" target="_blank" rel="noopener">' + ic("ext") + 'Abrir</a><button class="mini" data-copiar="' + esc(x.id) + '" type="button">' + ic("copy") + "Copiar</button>" +
          (admin() ? '<button class="mini ico" data-editar="' + esc(x.id) + '" title="Editar" type="button">' + ic("pen") + '</button><button class="mini ico del" data-borrar="' + esc(x.id) + '" title="Borrar" type="button">' + ic("trash") + "</button>" : "") +
          "</div></div>";
      });
      h += "</section>";
    });
    return h;
  }

  /* ---------------- eventos ---------------- */
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-tab],[data-abrir],[data-volver],[data-filtro],[data-ver],[data-bajar],[data-copiar],[data-grupo],[data-nuevo],[data-editar],[data-borrar],[data-subir],[data-curso],[data-mover],[data-renombrar]");
    if (!t || !$("#app").contains(t)) return;
    var d = t.dataset;
    if (d.curso) { S.curso = d.curso; S.q = ""; render(); window.scrollTo(0, 0); }
    else if (d.mover) mover(d.mover, +d.dir);
    else if ("renombrar" in d) renombrar(S.curso);
    else if (d.tab) { S.tab = d.tab; S.carpeta = null; S.curso = null; S.q = ""; try { sessionStorage.setItem("kx-academia-tab", d.tab); } catch (x) {} render(); window.scrollTo(0, 0); }
    else if (d.abrir) { S.carpeta = d.abrir; S.filtro = "todo"; S.q = ""; render(); window.scrollTo(0, 0); }
    else if ("volver" in d) { S.carpeta = null; S.curso = null; render(); }
    else if (d.filtro) { S.filtro = d.filtro; render(); }
    else if (d.ver) ver(porId(d.ver));
    else if (d.bajar) bajar(porId(d.bajar), t);
    else if (d.copiar) copiar(porId(d.copiar), t);
    else if (d.grupo) { var sec = t.parentNode; var abierto = !sec.classList.contains("open"); sec.classList.toggle("open", abierto); S.abiertos[d.grupo] = abierto; }
    else if (d.nuevo) formulario(d.nuevo, null);
    else if (d.editar) { var it = porId(d.editar); if (it) formulario(it.seccion, it); }
    else if (d.borrar) borrar(porId(d.borrar));
    else if (d.subir) subirArchivos(porId(d.subir));
  });
  document.addEventListener("input", function (e) {
    if (e.target.id !== "q") return;
    S.q = e.target.value.trim().toLowerCase();
    var pos = e.target.selectionStart; render();
    var q = $("#q"); if (q) { q.focus(); try { q.setSelectionRange(pos, pos); } catch (x) {} }
  });

  /* ---------------- ver, descargar, copiar ---------------- */
  function cerrar() { $("#layer").innerHTML = ""; document.body.style.overflow = ""; }
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && $("#layer").innerHTML) cerrar(); });

  function esMp4(u) { return /\.(mp4|webm|mov)(\?|$)/i.test(u || ""); }
  function embed(u) {
    u = String(u || "");
    var y = u.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([\w-]{6,})/);
    if (y) return "https://www.youtube-nocookie.com/embed/" + y[1] + "?autoplay=1&rel=0";
    var v = u.match(/vimeo\.com\/(\d+)/);
    if (v) return "https://player.vimeo.com/video/" + v[1] + "?autoplay=1";
    var lo = u.match(/loom\.com\/(?:share|embed)\/([a-f0-9]{16,})/i);
    if (lo) return "https://www.loom.com/embed/" + lo[1] + "?autoplay=1&hide_owner=true&hide_share=true&hideEmbedTopBar=true";
    if (/iframe\.mediadelivery\.net\/(embed|play)\//.test(u)) return u.replace("/play/", "/embed/") + (u.indexOf("?") > -1 ? "&" : "?") + "autoplay=true&preload=true&responsive=true";
    return u;
  }
  function ver(x) {
    if (!x) return;
    var cuerpo = "", pie = "";
    var u = x.url || "";
    if (x.seccion === "video" || x.tipo === "video") {
      if (esMp4(u)) cuerpo = '<video src="' + esc(u) + '" controls autoplay playsinline ' + (x.descargable === false ? 'controlslist="nodownload" disablepictureinpicture oncontextmenu="return false"' : "") + "></video>";
      else cuerpo = '<div class="frame' + (x.vertical ? " v9" : "") + '"><iframe src="' + esc(embed(u)) + '" allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowfullscreen></iframe></div>';
    } else if (x.tipo === "image") {
      cuerpo = '<img src="' + esc(x.url) + '" alt="' + esc(x.titulo) + '">';
    } else {
      cuerpo = '<div style="color:#fff;text-align:center;display:grid;gap:14px;justify-items:center">' + ic("file", "big") + '<a class="btn sec" href="' + esc(u) + '" target="_blank" rel="noopener">' + ic("ext") + "Abrir el archivo</a></div>";
    }
    if (x.seccion === "archivo" && x.descargable !== false && (x.descarga || x.url)) pie = '<div class="vw-f"><button class="btn" data-vbajar type="button">' + ic("down") + "Descargar</button></div>";
    var ls = x.seccion === "video" ? lecciones(cursoDe(x)) : [], pos = ls.indexOf(x);
    if (ls.length > 1) pie = '<div class="vw-f vw-nav"><button class="btn sec" data-vir="' + (pos - 1) + '" type="button"' + (pos > 0 ? "" : " disabled") + ">" + ic("back") + 'Anterior</button><span class="vw-pos">Video ' + (pos + 1) + " de " + ls.length + '</span><button class="btn" data-vir="' + (pos + 1) + '" type="button"' + (pos < ls.length - 1 ? "" : " disabled") + ">Siguiente" + ic("chev") + "</button></div>";
    $("#layer").innerHTML = '<div class="viewer" role="dialog" aria-modal="true" aria-label="' + esc(x.titulo) + '"><div class="vw-h"><b>' + esc(x.titulo) + '</b><button class="mini ico" data-vcerrar type="button" aria-label="Cerrar">' + ic("x") + '</button></div><div class="vw-b">' + cuerpo + "</div>" +
      (x.seccion === "video" && x.descripcion ? '<p class="vw-desc">' + esc(x.descripcion) + "</p>" : "") + pie + "</div>";
    document.body.style.overflow = "hidden";
    $("[data-vcerrar]").onclick = cerrar;
    var b = $("[data-vbajar]"); if (b) b.onclick = function () { bajar(x, b); };
    [].forEach.call(document.querySelectorAll("[data-vir]"), function (n) { n.onclick = function () { var y = ls[+n.dataset.vir]; if (y) ver(y); }; });
    var vw = $(".viewer"); vw.addEventListener("click", function (e) { if (e.target === vw || e.target.classList.contains("vw-b")) cerrar(); });
  }

  var MIME_EXT = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif", "video/mp4": "mp4", "video/quicktime": "mov", "application/pdf": "pdf" };
  function nombreArchivo(x, ct) {
    var base = String(x.titulo || "archivo").replace(/[\\/:*?"<>|]+/g, "").trim() || "archivo";
    var m = String(x.descarga || x.url || "").split("?")[0].match(/\.([a-z0-9]{2,4})$/i);
    var ext = m ? m[1] : (MIME_EXT[(ct || x.mime || "").split(";")[0]] || (x.tipo === "video" ? "mp4" : x.tipo === "image" ? "jpg" : ""));
    return /\.[a-z0-9]{2,4}$/i.test(base) || !ext ? base : base + "." + ext;
  }
  function bajar(x, btn) {
    if (!x) return;
    var u = abs(x.descarga || x.url);
    if (!u) return;
    if (btn) btn.disabled = true;
    toast(x.tipo === "video" ? "Descargando el video… puede tardar unos segundos." : "Descargando…");
    fetch(u).then(function (r) {
      if (!r.ok) throw new Error(r.status);
      var ct = r.headers.get("content-type") || "";
      return r.blob().then(function (b) {
        var a = document.createElement("a");
        a.href = URL.createObjectURL(b); a.download = nombreArchivo(x, ct);
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 30000);
        toast("Listo: revisa tus descargas.");
      });
    }).catch(function () { window.open(u, "_blank", "noopener"); })
      .then(function () { if (btn) btn.disabled = false; });
  }
  function copiar(x, btn) {
    if (!x) return;
    var txt = x.seccion === "link" ? x.url : x.texto;
    var ok = function () {
      if (btn) { var h = btn.innerHTML; btn.classList.add("done"); btn.innerHTML = ic("check") + "Copiado"; setTimeout(function () { btn.classList.remove("done"); btn.innerHTML = h; }, 1600); }
      toast("Copiado");
    };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(txt).then(ok, function () { viejo(txt); ok(); });
    else { viejo(txt); ok(); }
  }
  function viejo(t) { var a = document.createElement("textarea"); a.value = t; a.style.position = "fixed"; a.style.opacity = "0"; document.body.appendChild(a); a.select(); try { document.execCommand("copy"); } catch (e) {} a.remove(); }

  var tt;
  function toast(m) {
    var el = $(".toast"); if (!el) { el = document.createElement("div"); el.className = "toast"; el.setAttribute("role", "status"); document.body.appendChild(el); }
    el.textContent = m; clearTimeout(tt); tt = setTimeout(function () { el.remove(); }, 2600);
  }

  /* ---------------- admin: formularios ---------------- */
  var NOMBRES = { video: "video", carpeta: "carpeta", link: "link", guion: "guion" };
  function dlg(titulo, cuerpo, pie) {
    $("#layer").innerHTML = '<div class="scrim"><div class="dlg" role="dialog" aria-modal="true" aria-label="' + esc(titulo) + '"><div class="dlg-h"><b>' + esc(titulo) + '</b><button class="mini ico" data-dcerrar type="button" aria-label="Cerrar">' + ic("x") + '</button></div><div class="dlg-b">' + cuerpo + '</div><div class="dlg-f">' + pie + "</div></div></div>";
    document.body.style.overflow = "hidden";
    $("[data-dcerrar]").onclick = cerrar;
    // Los primeros 500 ms se ignoran los toques fuera (un doble toque la cerraba al instante).
    var abierto = Date.now(), sc = $(".scrim");
    sc.addEventListener("mousedown", function (e) { if (e.target === sc && Date.now() - abierto > 500) cerrar(); });
  }
  function campo(id, label, valor, extra) {
    extra = extra || {};
    var inp = extra.area ? '<textarea class="inp" id="' + id + '">' + esc(valor) + "</textarea>"
      : '<input class="inp" id="' + id + '" value="' + esc(valor) + '"' + (extra.lista ? ' list="' + id + 'L"' : "") + (extra.ph ? ' placeholder="' + esc(extra.ph) + '"' : "") + ' autocomplete="off">';
    var dl = extra.lista ? '<datalist id="' + id + 'L">' + extra.lista.map(function (g) { return '<option value="' + esc(g) + '">'; }).join("") + "</datalist>" : "";
    return '<label class="fld"><span>' + label + "</span>" + inp + dl + (extra.ayuda ? "<small>" + extra.ayuda + "</small>" : "") + "</label>";
  }
  // "loom.com/share/…" o "www.youtube.com/…" pegado sin https:// también vale.
  function conHttps(u) { u = String(u || "").trim(); return u && !/^https?:\/\//i.test(u) && /^[\w-]+(\.[\w-]+)+\//.test(u) ? "https://" + u : u; }
  function val(id) { var el = $("#" + id); return el ? el.value.trim() : ""; }
  function gruposDe(sec) { var s = {}; de(sec).forEach(function (x) { if (x.grupo) s[x.grupo] = 1; }); return Object.keys(s); }

  function formulario(sec, it) {
    var nuevo = !it; it = it || {};
    var c = "";
    if (sec === "guion") c = campo("fGrupo", "Grupo", it.grupo || (S.q ? "" : ""), { lista: gruposDe("guion"), ph: "Ej.: Objeciones", ayuda: "Elige uno existente o escribe uno nuevo." }) + campo("fTitulo", "Título", it.titulo) + campo("fTexto", "Texto del guion", it.texto, { area: 1 });
    else if (sec === "link") c = campo("fGrupo", "Grupo", it.grupo, { lista: gruposDe("link"), ph: "Ej.: Tarjeta BIX" }) + campo("fTitulo", "Título", it.titulo) + campo("fDesc", "Descripción (opcional)", it.descripcion) + campo("fUrl", "Link", it.url, { ph: "https://…" });
    else if (sec === "carpeta") c = campo("fTitulo", "Nombre de la carpeta", it.titulo) + campo("fDesc", "Descripción (opcional)", it.descripcion);
    else if (sec === "video") {
      c = campo("fCurso", "Curso", nuevo ? (S.curso || "") : cursoDe(it), { lista: cursos(), ph: "Ej.: Primeros pasos", ayuda: "Elige un curso existente o escribe uno nuevo para crearlo." }) +
        campo("fTitulo", "Título del video", it.titulo) + campo("fDesc", "Descripción (opcional)", it.descripcion);
      if (nuevo) c += '<div class="opt" id="fModo"><button type="button" class="on" data-m="archivo">Subir un video</button><button type="button" data-m="link">Pegar un link</button></div>' +
        '<div id="mArchivo"><div class="drop" id="fDrop">' + ic("up") + '<b>Elige el video</b><small>MP4 o MOV. Se ve en la Academia y no se puede descargar.</small><input type="file" id="fFile" accept="video/*"></div></div>' +
        '<div id="mLink" hidden>' + campo("fUrl", "Link del video", "", { ph: "YouTube, Vimeo, Bunny o .mp4" }) + "</div>" +
        '<div class="prog" id="fProg"></div>';
      else c += campo("fUrl", "Link del video", it.url) + campo("fMini", "Imagen de portada (opcional)", it.miniatura, { ph: "https://…" });
    }
    dlg((nuevo ? "Nuevo " : "Editar ") + NOMBRES[sec], c, '<button class="btn sec" data-dcerrar2 type="button">Cancelar</button><button class="btn" id="fOk" type="button">' + (nuevo ? "Guardar" : "Guardar cambios") + "</button>");
    $("[data-dcerrar2]").onclick = cerrar;
    var modo = "archivo";
    var mBtns = $("#fModo");
    if (mBtns) mBtns.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      modo = b.dataset.m; [].forEach.call(mBtns.children, function (x) { x.classList.toggle("on", x === b); });
      $("#mArchivo").hidden = modo !== "archivo"; $("#mLink").hidden = modo !== "link";
    });
    var fFile = $("#fFile");
    if (fFile) fFile.addEventListener("change", function () { var f = fFile.files[0]; if (f) { $("#fDrop b").textContent = f.name; if (!val("fTitulo")) $("#fTitulo").value = f.name.replace(/\.[^.]+$/, ""); } });
    var t0 = $("#fTitulo"); if (t0) setTimeout(function () { t0.focus(); }, 50);

    $("#fOk").onclick = function () {
      var ok = $("#fOk");
      var item = { seccion: sec, titulo: val("fTitulo") };
      if (it.id) item.id = it.id;
      if (!item.titulo) { toast("Falta el título."); return; }
      if (sec === "guion") { item.grupo = val("fGrupo") || "Otros"; item.texto = $("#fTexto").value; if (!item.texto.trim()) { toast("Falta el texto."); return; } }
      if (sec === "link") { item.grupo = val("fGrupo") || "Otros"; item.descripcion = val("fDesc"); item.url = conHttps(val("fUrl")); if (!/^https?:\/\//.test(item.url)) { toast("El link tiene que empezar con https://"); return; } }
      if (sec === "carpeta") item.descripcion = val("fDesc");
      if (sec === "video") {
        item.grupo = val("fCurso"); if (!item.grupo) { toast("Falta el curso."); return; }
        item.descripcion = val("fDesc"); item.descargable = false;
        if (!nuevo) { item.url = conHttps(val("fUrl")); item.miniatura = val("fMini"); }
      }
      if (nuevo && !item.id) item.orden = 1000 + de(sec).length * 10;
      ok.disabled = true; ok.textContent = "Guardando…";
      var paso = Promise.resolve(item);
      if (sec === "video" && nuevo) {
        if (modo === "link") {
          item.url = conHttps(val("fUrl"));
          if (!/^https?:\/\//.test(item.url)) { ok.disabled = false; ok.textContent = "Guardar"; toast("Pega un link que empiece con https://"); return; }
        } else {
          var f = fFile && fFile.files[0];
          if (!f) { ok.disabled = false; ok.textContent = "Guardar"; toast("Elige el video."); return; }
          ok.textContent = "Subiendo…";
          paso = subirUno(f, item.titulo, $("#fProg")).then(function (r) { Object.assign(item, { url: r.url, miniatura: r.miniatura, bunny_id: r.bunny_id }); return item; });
        }
      }
      paso.then(function (item) { return api("guardar", { item: item }); }).then(function (j) {
        if (!j.ok) throw new Error(j.error || "error");
        cerrar(); toast("Guardado"); return recargar();
      }).catch(function (e) { ok.disabled = false; ok.textContent = "Guardar"; toast("No se pudo guardar (" + (e.message || e) + ")."); });
    };
  }

  // Confirmación propia (no window.confirm): un toque doble o un Enter de más en el
  // cartel del navegador volvía a disparar el botón y borraba también el elemento siguiente.
  var borrando = false;
  function borrar(x) {
    if (!x || borrando || $("#layer").innerHTML) return;
    if (document.activeElement) document.activeElement.blur();
    var msg = x.panel ? "Se oculta de la Academia, pero sigue estando en el panel." :
      x.seccion === "carpeta" ? (x.en_vivo ? "Los anuncios siguen estando en el panel." : "Se borra también todo lo que tiene adentro.") :
      "Esto no se puede deshacer.";
    dlg((x.panel ? "¿Ocultar «" : "¿Borrar «") + x.titulo + "»?", "<p style=\"margin:0;color:var(--text-2)\">" + esc(msg) + "</p>",
      '<button class="btn sec" data-dcerrar2 type="button">Cancelar</button><button class="btn del" id="bBorrar" type="button">' + (x.panel ? "Ocultar" : "Borrar") + "</button>");
    $("[data-dcerrar2]").onclick = cerrar;
    $("#bBorrar").onclick = function () {
      if (borrando) return;
      borrando = true; this.disabled = true; this.textContent = "Borrando…";
      api("borrar", { id: x.id }).then(function (j) {
        cerrar();
        if (!j.ok) { toast("No se pudo borrar."); return; }
        S.items = S.items.filter(function (y) { return y.id !== x.id && y.padre !== x.id; });
        if (x.seccion === "carpeta") S.carpeta = null;
        render(); toast(x.panel ? "Oculto" : "Borrado");
        return recargar();
      }).catch(function () { cerrar(); toast("No se pudo borrar."); })
        .then(function () { setTimeout(function () { borrando = false; }, 400); });
    };
  }

  /* ---------------- admin: subir archivos ---------------- */
  function cargarTus() {
    if (window.tus) return Promise.resolve(window.tus);
    return new Promise(function (ok, mal) { var s = document.createElement("script"); s.src = TUS_JS; s.onload = function () { ok(window.tus); }; s.onerror = mal; document.head.appendChild(s); });
  }
  function filaProg(cont, nombre) {
    var d = document.createElement("div"); d.className = "prow";
    d.innerHTML = "<span><b>" + esc(nombre) + "</b><em>0 %</em></span><div class=\"pbar\"><i></i></div>";
    cont.appendChild(d);
    return { pct: function (p) { d.querySelector("i").style.width = p + "%"; d.querySelector("em").textContent = p + " %"; },
      fin: function (bien, txt) { d.querySelector(".pbar").classList.add(bien ? "ok" : "mal"); d.querySelector("i").style.width = "100%"; d.querySelector("em").textContent = txt; } };
  }
  // Sube un archivo y devuelve dónde quedó. Videos → Bunny (TUS); el resto → Storage.
  function subirUno(f, titulo, cont) {
    var fila = filaProg(cont, f.name);
    var esVideo = /^video\//.test(f.type) || /\.(mp4|mov|m4v|webm)$/i.test(f.name);
    if (esVideo) {
      return Promise.all([api("subir_video", { titulo: titulo }), cargarTus()]).then(function (r) {
        var b = r[0];
        if (!b.ok) throw new Error(b.error || "bunny");
        return new Promise(function (ok, mal) {
          var up = new window.tus.Upload(f, {
            endpoint: b.tus, retryDelays: [0, 3000, 6000, 12000, 20000], chunkSize: 50 * 1024 * 1024,
            headers: { AuthorizationSignature: b.signature, AuthorizationExpire: String(b.expiration), VideoId: b.videoId, LibraryId: String(b.libraryId) },
            metadata: { filetype: f.type || "video/mp4", title: titulo },
            onError: function (e) { fila.fin(false, "Error"); mal(e); },
            onProgress: function (a, t) { fila.pct(Math.floor(a * 100 / t)); },
            onSuccess: function () { fila.fin(true, "Listo"); ok({ url: b.url, miniatura: b.miniatura, descarga: b.descarga, bunny_id: b.videoId, tipo: "video" }); }
          });
          up.start();
        });
      });
    }
    return api("subir_archivo", { nombre: f.name }).then(function (r) {
      if (!r.ok) throw new Error(r.error || "storage");
      return new Promise(function (ok, mal) {
        var x = new XMLHttpRequest();
        x.open("PUT", r.subir);
        x.setRequestHeader("Content-Type", f.type || "application/octet-stream");
        x.setRequestHeader("x-upsert", "false");
        x.upload.onprogress = function (e) { if (e.lengthComputable) fila.pct(Math.floor(e.loaded * 100 / e.total)); };
        x.onload = function () { if (x.status >= 200 && x.status < 300) { fila.fin(true, "Listo"); ok({ url: r.url, descarga: r.url, tipo: /^image\//.test(f.type) ? "image" : /pdf/.test(f.type) ? "pdf" : "otro", miniatura: /^image\//.test(f.type) ? r.url : null }); } else { fila.fin(false, "Error"); mal(new Error("subida " + x.status)); } };
        x.onerror = function () { fila.fin(false, "Error"); mal(new Error("red")); };
        x.send(f);
      });
    });
  }
  function subirArchivos(c) {
    if (!c) return;
    dlg("Subir a «" + c.titulo + "»", '<div class="drop" id="uDrop">' + ic("up") + '<b>Elige o arrastra los archivos</b><small>Imágenes, videos o PDF. Se pueden elegir varios.</small><input type="file" id="uFiles" multiple accept="image/*,video/*,application/pdf"></div><div class="prog" id="uProg"></div>',
      '<button class="btn sec" data-dcerrar2 type="button">Cerrar</button>');
    $("[data-dcerrar2]").onclick = function () { cerrar(); recargar(); };
    var drop = $("#uDrop"), inp = $("#uFiles");
    ["dragenter", "dragover"].forEach(function (ev) { drop.addEventListener(ev, function () { drop.classList.add("over"); }); });
    ["dragleave", "drop"].forEach(function (ev) { drop.addEventListener(ev, function () { drop.classList.remove("over"); }); });
    inp.addEventListener("change", function () {
      var fs = [].slice.call(inp.files); if (!fs.length) return;
      var cont = $("#uProg"), base = hijos(c.id).length;
      var cadena = Promise.resolve(), bien = 0;
      fs.forEach(function (f, i) {
        cadena = cadena.then(function () {
          var titulo = f.name.replace(/\.[^.]+$/, "");
          return subirUno(f, titulo, cont).then(function (r) {
            return api("guardar", { item: { seccion: "archivo", padre: c.id, titulo: titulo, url: r.url, descarga: r.descarga, miniatura: r.miniatura, tipo: r.tipo, bunny_id: r.bunny_id || null, orden: (base + i) * 10 } });
          }).then(function (j) { if (j.ok) bien++; }).catch(function () {});
        });
      });
      cadena.then(function () { toast(bien + " de " + fs.length + " subidos"); recargar(); });
      inp.value = "";
    });
  }

  /* ---------------- arranque ---------------- */
  var guardada = lsGet();
  if (guardada) { $("#login").hidden = true; entrar(guardada, true); }
})();
