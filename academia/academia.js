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
    cal: '<rect x="4" y="5.5" width="16" height="14.5" rx="2"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>',
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
  function de(seccion) { return S.items.filter(function (x) { return x.seccion === seccion && !esEntreno(x); }); }

  /* ---------------- entrenamiento en vivo ----------------
     Fila de academia_items: seccion link, grupo "__entrenamiento"; url = Zoom, descarga = .ics en Storage.
     Días y hora fijos acá: lunes, miércoles y viernes de 19:00 a 20:00, hora de España.  */
  var ENT = { dias: [1, 3, 5], hora: 19, min: 0, dur: 60, tz: "Europe/Madrid", rrule: "RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR", titulo: "Entrenamiento privado Korex" };
  var DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  function esEntreno(x) { return x.grupo === "__entrenamiento"; }
  function entreno() { return S.items.filter(esEntreno)[0] || null; }
  // Partes de fecha/hora de un instante en una zona horaria.
  function partes(ms, tz) {
    var o = {};
    new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", weekday: "short" })
      .formatToParts(new Date(ms)).forEach(function (p) { o[p.type] = p.value; });
    return { y: +o.year, m: +o.month, d: +o.day, h: +o.hour, mi: +o.minute, wd: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(o.weekday) };
  }
  // Instante (ms) de y-m-d hh:mm en la zona tz.
  function instante(y, m, d, h, mi, tz) {
    var guess = Date.UTC(y, m - 1, d, h, mi), p = partes(guess, tz);
    var off = Date.UTC(p.y, p.m - 1, p.d, p.h, p.mi) - guess;
    return guess - off;
  }
  // Próxima sesión que todavía no terminó: { ini, fin, vivo }.
  function proxima(ahora) {
    var hoy = partes(ahora, ENT.tz);
    for (var k = 0; k < 9; k++) {
      var base = new Date(Date.UTC(hoy.y, hoy.m - 1, hoy.d + k));
      if (ENT.dias.indexOf(base.getUTCDay()) < 0) continue;
      var ini = instante(base.getUTCFullYear(), base.getUTCMonth() + 1, base.getUTCDate(), ENT.hora, ENT.min, ENT.tz), fin = ini + ENT.dur * 60000;
      if (fin > ahora) return { ini: ini, fin: fin, vivo: ahora >= ini };
    }
    return null;
  }
  function horaLocal(ms) { return new Intl.DateTimeFormat("es", { hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(ms)); }
  function zonaUsuario() { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch (e) { return ""; } }
  function estadoEntreno() {
    var ahora = Date.now(), s = proxima(ahora);
    if (!s) return { txt: "", vivo: false };
    if (s.vivo) return { txt: "En vivo ahora · termina a las " + horaLocal(s.fin), vivo: true };
    var a = partes(ahora, zonaUsuario() || ENT.tz), b = partes(s.ini, zonaUsuario() || ENT.tz);
    var dif = Math.round((Date.UTC(b.y, b.m - 1, b.d) - Date.UTC(a.y, a.m - 1, a.d)) / 864e5);
    var dia = dif === 0 ? "Hoy" : DIAS[b.wd].charAt(0).toUpperCase() + DIAS[b.wd].slice(1);
    var falta = s.ini - ahora, extra = falta < 3600000 ? " · empieza en " + Math.max(1, Math.ceil(falta / 60000)) + " min" : "";
    var enEspana = new Intl.DateTimeFormat("es", { timeZone: ENT.tz, hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(s.ini));
    var tuHora = horaLocal(s.ini) !== enEspana ? " (tu hora)" : "";
    return { txt: "Próximo: " + dia + " a las " + horaLocal(s.ini) + tuHora + extra, vivo: false };
  }
  function vEntreno() {
    var e = entreno();
    if (!e) return admin() ? '<button class="addcard addrow" data-entreno-edit type="button"><span class="plus">' + ic("plus") + "</span>Configurar el entrenamiento en vivo</button>" : "";
    var st = estadoEntreno();
    return '<section class="ent' + (st.vivo ? " vivo" : "") + '">' +
      '<div class="ent-i">' + ic("vid") + "</div>" +
      '<div class="ent-t"><span class="ent-lab">Entrenamiento en vivo</span>' +
      "<b>Lunes, miércoles y viernes · 19:00 España</b>" +
      '<span class="ent-sub"><span id="entEstado">' + (st.vivo ? '<i class="dot"></i>' : "") + esc(st.txt) + "</span></span></div>" +
      '<div class="ent-a"><a class="btn" href="' + esc(e.url) + '" target="_blank" rel="noopener">' + ic("vid") + "Entrar al Zoom</a>" +
      '<button class="btn sec" data-entreno-cal type="button">' + ic("cal") + "Agregar al calendario</button>" +
      (admin() ? '<button class="mini ico" data-entreno-edit title="Cambiar link de Zoom" type="button">' + ic("pen") + "</button>" : "") + "</div></section>";
  }
  setInterval(function () { var el = $("#entEstado"); if (!el) return; var st = estadoEntreno(); el.innerHTML = (st.vivo ? '<i class="dot"></i>' : "") + esc(st.txt); var c = el.closest(".ent"); if (c) c.classList.toggle("vivo", st.vivo); }, 30000);

  function fechaCal(ms, tz) { var p = partes(ms, tz); function z(n) { return (n < 10 ? "0" : "") + n; } return p.y + z(p.m) + z(p.d) + "T" + z(p.h) + z(p.mi) + "00"; }
  function googleCal(e) {
    var s = proxima(Date.now());
    return "https://calendar.google.com/calendar/render?action=TEMPLATE&text=" + encodeURIComponent(ENT.titulo) +
      "&dates=" + fechaCal(s.ini, ENT.tz) + "/" + fechaCal(s.fin, ENT.tz) + "&ctz=" + encodeURIComponent(ENT.tz) +
      "&recur=" + encodeURIComponent(ENT.rrule) + "&location=" + encodeURIComponent(e.url) +
      "&details=" + encodeURIComponent("Entra por Zoom: " + e.url + "\n\nRecursos: https://info.metodokorex.com/academia");
  }
  function icsTexto(url) {
    var s = proxima(Date.now()), ahora = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
    function esc2(t) { return String(t).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n"); }
    return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Metodo Korex//Academia//ES", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
      "BEGIN:VTIMEZONE", "TZID:Europe/Madrid",
      "BEGIN:DAYLIGHT", "TZOFFSETFROM:+0100", "TZOFFSETTO:+0200", "TZNAME:CEST", "DTSTART:19700329T020000", "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU", "END:DAYLIGHT",
      "BEGIN:STANDARD", "TZOFFSETFROM:+0200", "TZOFFSETTO:+0100", "TZNAME:CET", "DTSTART:19701025T030000", "RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU", "END:STANDARD",
      "END:VTIMEZONE",
      "BEGIN:VEVENT", "UID:entrenamiento-korex@metodokorex.com", "DTSTAMP:" + ahora,
      "DTSTART;TZID=Europe/Madrid:" + fechaCal(s.ini, ENT.tz), "DTEND;TZID=Europe/Madrid:" + fechaCal(s.fin, ENT.tz), ENT.rrule,
      "SUMMARY:" + esc2(ENT.titulo), "LOCATION:" + esc2(url), "URL:" + url,
      "DESCRIPTION:" + esc2("Entra por Zoom: " + url + "\n\nRecursos: https://info.metodokorex.com/academia"),
      "BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:" + esc2(ENT.titulo), "TRIGGER:-PT15M", "END:VALARM",
      "END:VEVENT", "END:VCALENDAR"].map(function (l) { // líneas de máx. 75 caracteres (RFC 5545)
        var o = []; while (l.length > 74) { o.push(l.slice(0, 74)); l = " " + l.slice(74); } o.push(l); return o.join("\r\n");
      }).join("\r\n") + "\r\n";
  }
  function calendario() {
    var e = entreno(); if (!e) return;
    var ics = e.descarga || "";
    dlg("Agregar al calendario",
      '<p class="cal-intro">Se agrega una sola vez y queda <b>todos los lunes, miércoles y viernes a las 19:00 (España)</b>, con un aviso 15 minutos antes. Tu calendario lo pasa solo a tu hora.</p>' +
      '<div class="cal-opts">' +
      '<a class="cal-op" href="' + esc(googleCal(e)) + '" target="_blank" rel="noopener"><span class="cal-ic g">G</span><span><b>Google Calendar</b><small>Android, Gmail o la compu</small></span>' + ic("chev") + "</a>" +
      '<a class="cal-op" ' + (ics ? 'href="' + esc(ics) + '"' : 'href="#" data-ics-local') + '><span class="cal-ic a">' + ic("cal") + '</span><span><b>iPhone, Mac u Outlook</b><small>Se abre el calendario y tocas «Agregar»</small></span>' + ic("chev") + "</a>" +
      "</div>",
      '<button class="btn sec" data-dcerrar2 type="button">Cerrar</button>');
    $("[data-dcerrar2]").onclick = cerrar;
    var loc = $("[data-ics-local]");
    if (loc) loc.onclick = function (ev) {
      ev.preventDefault();
      var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([icsTexto(e.url)], { type: "text/calendar" })); a.download = "entrenamiento-korex.ics";
      document.body.appendChild(a); a.click(); a.remove();
    };
  }
  // Admin: guarda el link de Zoom y regenera el .ics (archivo nuevo en Storage).
  function editarEntreno() {
    var e = entreno() || {};
    dlg("Entrenamiento en vivo", campo("fZoom", "Link de Zoom", e.url, { ph: "https://us06web.zoom.us/j/…", ayuda: "Lunes, miércoles y viernes de 19:00 a 20:00 (España). Para cambiar días u horario, pídelo." }),
      '<button class="btn sec" data-dcerrar2 type="button">Cancelar</button><button class="btn" id="fOk" type="button">Guardar</button>');
    $("[data-dcerrar2]").onclick = cerrar;
    $("#fOk").onclick = function () {
      var url = conHttps(val("fZoom")), ok = this;
      if (!/^https:\/\/[^\s]+$/.test(url)) { toast("Pega el link de Zoom completo."); return; }
      ok.disabled = true; ok.textContent = "Guardando…";
      api("subir_archivo", { nombre: "entrenamiento-korex.ics" }).then(function (r) {
        if (!r.ok) throw new Error(r.error || "subida");
        return fetch(r.subir, { method: "PUT", headers: { "Content-Type": "text/calendar; charset=utf-8", "x-upsert": "false" }, body: icsTexto(url) }).then(function (x) {
          if (!x.ok) throw new Error("ics " + x.status);
          var item = { titulo: "Entrenamiento en vivo", url: url, descarga: r.url, grupo: "__entrenamiento", descripcion: "Lunes, miércoles y viernes · 19:00 a 20:00 (España)" };
          if (e.id) item.id = e.id; else { item.seccion = "link"; item.orden = 0; }
          return api("guardar", { item: item });
        });
      }).then(function (j) { if (!j.ok) throw new Error(j.error || "guardar"); cerrar(); toast("Guardado"); return recargar(); })
        .catch(function (er) { ok.disabled = false; ok.textContent = "Guardar"; toast("No se pudo guardar (" + (er.message || er) + ")."); });
    };
  }
  function hay(x) {
    if (!S.q) return true;
    var t = [x.titulo, x.descripcion, plantilla(x) ? "" : x.texto, x.grupo, x.url].join(" ").toLowerCase();
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
    var arriba = !(S.tab === "videos" && S.curso) && !(S.tab === "recursos" && S.carpeta);
    $("#main").innerHTML = (arriba ? vEntreno() : "") + h;
    pintarMinis();
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
  // Portadas diseñadas por curso (archivos en /academia/portadas/). Sin portada → imagen del primer video que tenga.
  var PORTADAS = { "Usa la plataforma Korex": "/academia/portadas/usa-la-plataforma-korex.jpg?v=2" };
  function portada(c) { var ls = lecciones(c); return { miniatura: PORTADAS[c] || (ls.filter(function (v) { return v.miniatura; })[0] || {}).miniatura }; }
  function poster(v, extra) { return '<div class="poster"' + (v && v.miniatura ? ' style="background-image:url(\'' + esc(v.miniatura) + '\'),linear-gradient(140deg,#0a1730,#18306a)"' : "") + ">" + (extra || "") + "</div>"; }
  function nVideos(n) { return n + (n === 1 ? " video" : " videos"); }

  function vVideos() {
    var cs = cursos().filter(function (c) { return !S.q || c.toLowerCase().indexOf(S.q) > -1 || lecciones(c).some(hay); });
    var h = '<div class="h2"><h2>Cursos</h2></div><p class="intro">Elige un curso y mira sus videos en orden.</p>' + buscador("Buscar cursos o videos");
    h += '<div class="gv">';
    cs.forEach(function (c) {
      var ls = lecciones(c);
      h += '<button class="vcard ccard" type="button" data-curso="' + esc(c) + '">' + poster(portada(c),'<span class="cnt">' + ic("vid") + nVideos(ls.length) + "</span>") +
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
      '<div class="h2"><h2>' + esc(c) + "</h2>" + (admin() ? flechasGrupo("video", c) + '<button class="btn sec" data-renombrar type="button">' + ic("pen") + "Renombrar curso</button>" : "") + "</div>" +
      '<p class="intro">' + nVideos(ls.length) + ". Míralos en orden.</p>";
    h += '<ol class="lecs">';
    ls.forEach(function (v, i) {
      h += '<li class="lec"><button class="lec-b" type="button" data-ver="' + esc(v.id) + '">' + '<span class="lec-n">' + (i + 1) + "</span>" +
        poster(v, '<span class="play">' + ic("play") + "</span>") +
        '<span class="lec-t"><b>' + esc(v.titulo) + "</b>" + (v.descripcion ? "<span>" + esc(String(v.descripcion).split("\n")[0]) + "</span>" : "") + "</span></button>" +
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

  /* ---------------- ordenar (admin) ----------------
     Videos, links y guiones: el orden de los grupos lo da su primer elemento.
     Al mover, se renumera la sección entera: grupo 1 → 1000, 1010…; grupo 2 → 2000…  */
  function claveG(x) { return x.seccion === "video" ? cursoDe(x) : (x.grupo || "Otros"); }
  function gruposSec(sec) {
    var m = {}, o = [];
    de(sec).forEach(function (x) { var g = claveG(x); if (!m[g]) { m[g] = []; o.push(g); } m[g].push(x); });
    return o.map(function (g) { return [g, m[g]]; });
  }
  function renumerar(gs) {
    var cambios = [];
    gs.forEach(function (g, gi) { g[1].forEach(function (x, ii) { var o = (gi + 1) * 1000 + ii * 10; if (x.orden !== o) { x.orden = o; cambios.push({ id: x.id, titulo: x.titulo, orden: o }); } }); });
    S.items.sort(function (a, b) { return (a.orden || 0) - (b.orden || 0); });
    render();
    Promise.all(cambios.map(function (it) { return api("guardar", { item: it }); })).then(function (rs) {
      if (rs.some(function (r) { return !r.ok; })) { toast("No se pudo guardar el orden."); recargar(); }
    }, function () { toast("No se pudo guardar el orden."); recargar(); });
  }
  function mover(id, dir) {
    var v = porId(id); if (!v) return;
    var gs = gruposSec(v.seccion), g = gs.filter(function (x) { return x[0] === claveG(v); })[0];
    var ls = g[1], i = ls.indexOf(v), j = i + dir;
    if (j < 0 || j >= ls.length) return;
    ls.splice(i, 1); ls.splice(j, 0, v);
    renumerar(gs);
  }
  function moverGrupo(sec, nombre, dir) {
    var gs = gruposSec(sec), i = -1;
    gs.forEach(function (g, k) { if (g[0] === nombre) i = k; });
    var j = i + dir; if (i < 0 || j < 0 || j >= gs.length) return;
    var g = gs.splice(i, 1)[0]; gs.splice(j, 0, g);
    renumerar(gs);
  }
  // Flechas: item (data-mover) o grupo (data-mgrupo). Ocultas mientras se busca.
  function flechas(attr, i, n, extra) {
    if (!admin() || S.q || n < 2) return "";
    return (i > 0 ? '<button class="mini ico" ' + attr + ' data-dir="-1" ' + (extra || "") + ' title="Subir" type="button">' + ic("arr") + "</button>" : "") +
      (i < n - 1 ? '<button class="mini ico" ' + attr + ' data-dir="1" ' + (extra || "") + ' title="Bajar" type="button">' + ic("abj") + "</button>" : "");
  }
  function flechasGrupo(sec, nombre) {
    var gs = gruposSec(sec), i = -1; gs.forEach(function (g, k) { if (g[0] === nombre) i = k; });
    var f = flechas('data-mgrupo="' + esc(nombre) + '"', i, gs.length, 'data-sec="' + sec + '"');
    return f ? '<span class="gmove" title="Mover grupo">' + f + "</span>" : "";
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
      var pl = plantilla(x);
      var fondo = x.miniatura && !pl ? ' style="background-image:url(\'' + esc(x.miniatura) + '\')"' : "";
      var fmt = x.tipo === "video" ? "VIDEO" : x.tipo === "image" ? "" : (x.tipo === "pdf" ? "PDF" : "ARCHIVO");
      return '<div class="tile"><button type="button" data-ver="' + esc(x.id) + '" style="display:block;text-align:left"><div class="thumb"' + fondo + (pl ? ' data-pl="' + esc(x.id) + '"' : "") + ">" +
        (!x.miniatura ? ic(x.tipo === "video" ? "vid" : x.tipo === "image" ? "img" : "file", "big") : "") +
        (pl ? '<span class="fmt fl-b">' + ic("cal") + "Fecha al día</span>" : fmt ? '<span class="fmt">' + fmt + "</span>" : "") + (x.tipo === "video" ? '<span class="pl">' + ic("play") + "</span>" : "") + "</div></button>" +
        '<div class="tmeta"><b title="' + esc(x.titulo) + '">' + esc(x.titulo) + "</b>" +
        (admin() && x.tipo === "image" && !x.panel ? '<button class="mini ico" data-flyer="' + esc(x.id) + '" title="Fecha automática" type="button">' + ic("cal") + "</button>" : "") +
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
      h += '<section class="grp' + (open ? " open" : "") + '"><div class="grp-top"><button class="grp-h" data-grupo="' + esc(g[0]) + '" type="button">' + ic("chev", "chev") + esc(g[0]) + "<em>" + g[1].length + "</em></button>" + flechasGrupo("guion", g[0]) + '</div><div class="grp-b">';
      g[1].forEach(function (x, xi) {
        h += '<article class="gcard"><div class="gcard-h"><b>' + esc(x.titulo) + "</b>" + flechas('data-mover="' + esc(x.id) + '"', xi, g[1].length) +
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
      h += '<section class="lgrp"><div class="lgrp-h"><span class="lgrp-t"><i>' + ic("link") + "</i><b>" + esc(g[0]) + "</b><em>" + g[1].length + "</em></span>" + flechasGrupo("link", g[0]) +
        (admin() && !S.q ? '<button class="mini ico" data-nuevo="link" data-en="' + esc(g[0]) + '" title="Agregar link a este grupo" type="button">' + ic("plus") + "</button>" : "") + "</div>";
      g[1].forEach(function (x, xi) {
        h += '<div class="lrow"><span class="lic">' + ic("link") + '</span><div class="lt"><b>' + esc(x.titulo) + "</b>" + (x.descripcion ? "<span>" + esc(x.descripcion) + "</span>" : "") + "<code>" + esc(corta(x.url)) + "</code></div>" +
          '<div class="la"><a class="mini" href="' + esc(x.url) + '" target="_blank" rel="noopener">' + ic("ext") + 'Abrir</a><button class="mini" data-copiar="' + esc(x.id) + '" type="button">' + ic("copy") + "Copiar</button>" +
          flechas('data-mover="' + esc(x.id) + '"', xi, g[1].length) +
          (admin() ? '<button class="mini ico" data-editar="' + esc(x.id) + '" title="Editar" type="button">' + ic("pen") + '</button><button class="mini ico del" data-borrar="' + esc(x.id) + '" title="Borrar" type="button">' + ic("trash") + "</button>" : "") +
          "</div></div>";
      });
      h += "</section>";
    });
    return h;
  }

  /* ---------------- flyers con fecha automática ----------------
     Un flyer puede tener zonas (JSON en `texto`) donde se escribe la fecha al verlo o
     descargarlo. Se arma en el navegador con un canvas: el servidor no hace nada extra. */
  var MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  var MES3 = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  var DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  var DCOD = { lu: 1, ma: 2, mi: 3, ju: 4, vi: 5, sa: 6, "do": 0 };
  var FUENTES = ["Plus Jakarta Sans", "Inter", "Montserrat", "Poppins", "Sora", "Manrope", "Archivo"];
  var FICHAS = [["{rango}", "Semana"], ["{lu}", "Lu"], ["{ma}", "Ma"], ["{mi}", "Mi"], ["{ju}", "Ju"], ["{vi}", "Vi"], ["{sa}", "Sá"], ["{do}", "Do"], ["{fecha}", "Fecha"], ["{dia}", "Día"], ["{hoy}", "Hoy o día"], ["{num}", "Nº del día"]];
  var RX_SEM = /\{(rango|lu|ma|mi|ju|vi|sa|do)\}/, RX_DIA = /\{(fecha|dia|hoy|num)\}/;
  function plantilla(x) {
    if (!x || x.tipo !== "image" || x.panel || String(x.texto || "").charAt(0) !== "{") return null;
    try { var p = JSON.parse(x.texto); return p && p.cajas && p.cajas.length ? p : null; } catch (e) { return null; }
  }
  function usa(p, rx) { return p.cajas.some(function (b) { return rx.test(b.t || ""); }); }
  function hoy0() { var d = new Date(); d.setHours(12, 0, 0, 0); return d; }
  function sumar(d, n) { var r = new Date(d); r.setDate(r.getDate() + n); return r; }
  function lunesDe(d) { var w = d.getDay(); return sumar(d, w === 0 ? -6 : 1 - w); }
  // Sábado y domingo ya cuenta la semana que viene.
  function semanaBase() { var h = hoy0(), w = h.getDay(); return lunesDe(w === 6 || w === 0 ? sumar(h, 2) : h); }
  function diasEntre(a, b) { return Math.round((b - a) / 864e5); }
  function rangoTxt(l) {
    var v = sumar(l, 4);
    return "del " + l.getDate() + (l.getMonth() !== v.getMonth() ? " de " + MESES[l.getMonth()] : "") + " al " + v.getDate() + " de " + MESES[v.getMonth()];
  }
  function textoCaja(b, f) {
    var s = String(b.t || "").replace(/\{(\w+)\}/g, function (m, k) {
      if (k === "rango") return rangoTxt(f.lunes);
      if (DCOD.hasOwnProperty(k)) return String(sumar(f.lunes, (DCOD[k] + 6) % 7).getDate());
      if (k === "fecha") return f.dia.getDate() + " de " + MESES[f.dia.getMonth()];
      if (k === "dia") return DIAS[f.dia.getDay()];
      if (k === "num") return String(f.dia.getDate());
      if (k === "hoy") { var n = diasEntre(hoy0(), f.dia); return n === 0 ? "hoy" : DIAS[f.dia.getDay()]; }
      return m;
    });
    return b.may === "may" ? s.toUpperCase() : b.may === "tal" ? s : s.charAt(0).toUpperCase() + s.slice(1);
  }
  var IMGS = {}, FONTS = {}, SMP = {}, MINIS = {};
  function cargarImg(u) {
    u = abs(u);
    if (!IMGS[u]) IMGS[u] = new Promise(function (ok, no) {
      var im = new Image(); im.crossOrigin = "anonymous";
      im.onload = function () { ok(im); }; im.onerror = function () { delete IMGS[u]; no(new Error("imagen")); };
      im.src = u;
    });
    return IMGS[u];
  }
  function cargarFuentes(p) {
    return Promise.all(p.cajas.map(function (b) {
      var f = b.fuente || FUENTES[0];
      if (!FONTS[f]) FONTS[f] = new Promise(function (ok) {
        var l = document.createElement("link"); l.rel = "stylesheet";
        l.href = "https://fonts.googleapis.com/css2?family=" + f.replace(/ /g, "+") + ":wght@400;500;600;700;800&display=swap";
        l.onload = l.onerror = function () { ok(); }; document.head.appendChild(l);
      });
      return FONTS[f].then(function () { return document.fonts ? document.fonts.load((b.peso || 800) + " 50px '" + f + "'").catch(function () {}) : null; });
    }));
  }
  function medir(c, s, sp) { if (!sp) return c.measureText(s).width; var t = 0; for (var i = 0; i < s.length; i++) t += c.measureText(s[i]).width; return t + sp * (s.length - 1); }
  function escribir(c, s, x, y, sp) { if (!sp) { c.fillText(s, x, y); return; } for (var i = 0; i < s.length; i++) { c.fillText(s[i], x, y); x += c.measureText(s[i]).width + sp; } }
  function margen(h) { return { x: h * 0.1, y: h * 0.16 }; }
  // La zona va de la parte de arriba de las mayúsculas a la base de las letras.
  function dibujar(cv, im, p, f, ancho) {
    var k = ancho ? Math.min(1, ancho / im.naturalWidth) : 1;
    cv.width = Math.round(im.naturalWidth * k); cv.height = Math.round(im.naturalHeight * k);
    var c = cv.getContext("2d"), W = cv.width, H = cv.height;
    c.drawImage(im, 0, 0, W, H);
    p.cajas.forEach(function (b) {
      var x = b.x * W, y = b.y * H, w = b.w * W, h = b.h * H;
      if (w < 3 || h < 3) return;
      var m = margen(h);
      if (b.tapar && b.tapar !== "auto") c.fillStyle = b.tapar;
      else if (b.tapar === "auto" && b.fondo) { var g0 = c.createLinearGradient(x - m.x, 0, x + w + m.x, 0); g0.addColorStop(0, b.fondo[0]); g0.addColorStop(1, b.fondo[1]); c.fillStyle = g0; }
      if (b.tapar && (b.tapar !== "auto" || b.fondo)) c.fillRect(x - m.x, y - m.y, w + 2 * m.x, h + 2 * m.y);
      var s = textoCaja(b, f); if (!s) return;
      var fam = "'" + (b.fuente || FUENTES[0]) + "', sans-serif", peso = b.peso || 800, esp = +b.esp || 0;
      c.font = peso + " 100px " + fam;
      var cap = c.measureText("H").actualBoundingBoxAscent || 72;
      var size = h / cap * 100 * (+b.tam || 100) / 100;
      c.font = peso + " " + size + "px " + fam;
      var tw = medir(c, s, esp * size);
      if (tw > w) { size = size * w / tw; c.font = peso + " " + size + "px " + fam; tw = medir(c, s, esp * size); }
      var al = b.al || "c", tx = al === "i" ? x : al === "d" ? x + w - tw : x + (w - tw) / 2;
      c.textAlign = "left"; c.textBaseline = "alphabetic";
      if (b.color2) { var g = c.createLinearGradient(tx, 0, tx + tw, 0); g.addColorStop(0, b.color || "#ffffff"); g.addColorStop(1, b.color2); c.fillStyle = g; }
      else c.fillStyle = b.color || "#ffffff";
      escribir(c, s, tx, y + h, esp * size);
    });
  }
  function hex(v) { return "#" + v.map(function (n) { return (n < 16 ? "0" : "") + n.toString(16); }).join(""); }
  // Colores del fondo a la izquierda y a la derecha de la zona (mediana), para taparla con un degradado.
  function muestrear(im, b) {
    try {
      var W = im.naturalWidth, H = im.naturalHeight, c = SMP[im.src];
      if (!c) { c = document.createElement("canvas"); c.width = W; c.height = H; c.getContext("2d").drawImage(im, 0, 0); SMP[im.src] = c; }
      var m = margen(b.h * H), y0 = Math.max(0, Math.round(b.y * H - m.y)), y1 = Math.min(H - 1, Math.round((b.y + b.h) * H + m.y));
      var col = function (xx) {
        xx = Math.min(W - 1, Math.max(0, Math.round(xx)));
        var d = c.getContext("2d").getImageData(xx, y0, 1, y1 - y0 + 1).data, r = [], g = [], bl = [];
        for (var i = 0; i < d.length; i += 4) { r.push(d[i]); g.push(d[i + 1]); bl.push(d[i + 2]); }
        var med = function (a) { a.sort(function (p, q) { return p - q; }); return a[a.length >> 1]; };
        return hex([med(r), med(g), med(bl)]);
      };
      return [col(b.x * W - m.x - 3), col((b.x + b.w) * W + m.x + 3)];
    } catch (e) { return null; }
  }
  function pintarMinis() {
    var f = { lunes: semanaBase(), dia: hoy0() };
    [].forEach.call(document.querySelectorAll("[data-pl]"), function (el) {
      var x = porId(el.dataset.pl), p = plantilla(x); if (!p) return;
      var k = x.id + "|" + x.texto + "|" + f.lunes.toDateString() + f.dia.toDateString();
      var poner = function () { [].forEach.call(document.querySelectorAll('[data-pl="' + x.id + '"]'), function (n) { n.style.backgroundImage = "url('" + MINIS[k] + "')"; }); };
      if (MINIS[k]) { poner(); return; }
      Promise.all([cargarImg(x.url), cargarFuentes(p)]).then(function (r) {
        var cv = document.createElement("canvas"); dibujar(cv, r[0], p, f, 480);
        MINIS[k] = cv.toDataURL("image/jpeg", 0.85); poner();
      }).catch(function () {});
    });
  }
  function cuandoTxt(p, f) { return usa(p, RX_SEM) ? rangoTxt(f.lunes) : f.dia.getDate() + " de " + MESES[f.dia.getMonth()]; }
  function verFlyer(x, p) {
    var f = { lunes: semanaBase(), dia: hoy0() }, l0 = semanaBase(), h0 = hoy0(), blob = null, cv;
    var ops = "";
    if (usa(p, RX_SEM)) ops += '<div class="chips fl-ch" data-q="sem">' + [0, 7, 14].map(function (n) {
      var l = sumar(l0, n), v = sumar(l, 4), rel = diasEntre(lunesDe(h0), l) / 7;
      var et = rel === 0 ? "Esta semana" : rel === 1 ? "Próxima semana" : "En " + rel + " semanas";
      var sub = l.getMonth() === v.getMonth() ? l.getDate() + "–" + v.getDate() + " " + MES3[v.getMonth()] : l.getDate() + " " + MES3[l.getMonth()] + " – " + v.getDate() + " " + MES3[v.getMonth()];
      return '<button class="chip' + (n ? "" : " on") + '" data-v="' + n + '" type="button">' + et + "<small>" + sub + "</small></button>";
    }).join("") + "</div>";
    if (usa(p, RX_DIA)) ops += '<div class="chips fl-ch" data-q="dia">' + [0, 1, 2, 3, 4, 5, 6].map(function (n) {
      var d = sumar(h0, n), et = n === 0 ? "Hoy" : DIAS[d.getDay()].charAt(0).toUpperCase() + DIAS[d.getDay()].slice(1, 3);
      return '<button class="chip' + (n ? "" : " on") + '" data-v="' + n + '" type="button">' + et + "<small>" + d.getDate() + " " + MES3[d.getMonth()] + "</small></button>";
    }).join("") + "</div>";
    $("#layer").innerHTML = '<div class="viewer fl-v" role="dialog" aria-modal="true" aria-label="' + esc(x.titulo) + '"><div class="vw-h"><b>' + esc(x.titulo) + '</b><button class="mini ico" data-vcerrar type="button" aria-label="Cerrar">' + ic("x") + '</button></div>' +
      '<div class="vw-b"><canvas class="flc"></canvas></div><div class="vw-f fl-f">' + ops +
      '<button class="btn" data-vbajar type="button" disabled>' + ic("down") + "Descargar</button></div></div>";
    document.body.style.overflow = "hidden";
    cv = $(".flc");
    var bt = $("[data-vbajar]");
    function pintar() {
      blob = null; bt.disabled = true;
      Promise.all([cargarImg(x.url), cargarFuentes(p)]).then(function (r) {
        dibujar(cv, r[0], p, f);
        try { cv.toBlob(function (b) { blob = b; bt.disabled = !b; }, "image/jpeg", 0.92); } catch (e) { toast("No se pudo armar la imagen."); }
      }).catch(function () { toast("No se pudo cargar el flyer."); });
    }
    pintar();
    [].forEach.call(document.querySelectorAll(".fl-ch"), function (g) {
      g.addEventListener("click", function (e) {
        var b = e.target.closest("[data-v]"); if (!b) return;
        [].forEach.call(g.children, function (n) { n.classList.toggle("on", n === b); });
        if (g.dataset.q === "sem") f.lunes = sumar(l0, +b.dataset.v); else f.dia = sumar(h0, +b.dataset.v);
        pintar();
      });
    });
    bt.onclick = function () {
      if (!blob) return;
      var nombre = String(x.titulo || "flyer").replace(/[\\/:*?"<>|@]+/g, "").trim() + " - " + cuandoTxt(p, f) + ".jpg";
      var bajarlo = function () {
        var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = nombre;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 30000);
        toast("Listo: revisa tus descargas.");
      };
      // En el celular se abre el menú para guardarlo en Fotos o mandarlo directo por WhatsApp.
      var file = null;
      try { file = new File([blob], nombre, { type: "image/jpeg" }); } catch (e) {}
      if (file && navigator.canShare && navigator.canShare({ files: [file] }) && matchMedia("(pointer:coarse)").matches) {
        navigator.share({ files: [file] }).catch(function (e) { if (!e || e.name !== "AbortError") bajarlo(); });
      } else bajarlo();
    };
    $("[data-vcerrar]").onclick = cerrar;
    var vw = $(".viewer"); vw.addEventListener("click", function (e) { if (e.target === vw || e.target.classList.contains("vw-b")) cerrar(); });
  }

  function editarFlyer(x) {
    var antes = plantilla(x), p = JSON.parse(JSON.stringify(antes || { cajas: [] })), sel = p.cajas.length ? 0 : -1, im = null, drag = null, raf = 0;
    var f = { lunes: semanaBase(), dia: hoy0() };
    dlg("Fecha automática", '<div class="fle-g"><div><p class="fle-ay">Arrastra sobre la imagen para marcar dónde va la fecha: justo encima del texto, desde arriba de las letras hasta la base.</p><div class="fle" id="flE"><canvas id="flC"></canvas><div id="flB"></div></div></div><div id="flF"></div></div>',
      (antes ? '<button class="btn sec" id="flQuitar" type="button">Quitar fecha automática</button>' : "") + '<button class="btn sec" data-dcerrar2 type="button">Cancelar</button><button class="btn" id="fOk" type="button">Guardar</button>');
    $(".dlg").classList.add("dlg-xl");
    $("[data-dcerrar2]").onclick = cerrar;
    var E = $("#flE"), C = $("#flC");
    function redibujar() { raf = 0; if (im) dibujar(C, im, p, f, 1100); }
    function pedir() { if (!raf) raf = requestAnimationFrame(redibujar); }
    function zonas() {
      $("#flB").innerHTML = p.cajas.map(function (b, i) {
        return '<div class="flz' + (i === sel ? " on" : "") + '" data-z="' + i + '" style="left:' + b.x * 100 + "%;top:" + b.y * 100 + "%;width:" + b.w * 100 + "%;height:" + b.h * 100 + '%"><span>' + (i + 1) + "</span>" + (i === sel ? '<i data-h="1"></i>' : "") + "</div>";
      }).join("");
    }
    function op(id, lista, v) { return '<select class="inp sel" id="' + id + '">' + lista.map(function (o) { return '<option value="' + esc(o[0]) + '"' + (String(o[0]) === String(v) ? " selected" : "") + ">" + esc(o[1]) + "</option>"; }).join("") + "</select>"; }
    function campos() {
      var b = p.cajas[sel];
      if (!b) { $("#flF").innerHTML = '<div class="fle-vacio">' + ic("cal", "big") + "<b>" + (p.cajas.length ? "Toca una zona para editarla" : "Todavía no hay zonas") + "</b><small>Arrastra sobre el flyer, encima de la fecha que quieres cambiar. Puedes marcar varias: el rango de la semana y el número de cada día.</small></div>"; return; }
      var tp = b.tapar === "" ? "" : (!b.tapar || b.tapar === "auto") ? "auto" : "fijo";
      $("#flF").innerHTML =
        '<div class="fle-zn"><span>Zona ' + (sel + 1) + " de " + p.cajas.length + '</span><button class="mini del" id="flDel" type="button">' + ic("trash") + "Borrar zona</button></div>" +
        '<label class="fld"><span>Qué se escribe</span><input class="inp" id="flT" value="' + esc(b.t) + '" autocomplete="off"><small id="flEj"></small></label>' +
        '<div class="fl-toks">' + FICHAS.map(function (t) { return '<button type="button" class="chip" data-tok="' + t[0] + '">' + t[1] + "</button>"; }).join("") + "</div>" +
        '<small class="fle-ay">Semana = «del 16 al 20 de noviembre» (lunes a viernes) · Lu…Do = el número de ese día · Fecha = «12 de noviembre» · Día = «jueves» · Hoy o día = «hoy» o el nombre del día.</small>' +
        '<div class="fle-2">' +
        '<label class="fld"><span>Letras</span>' + op("flMay", [["may", "TODO MAYÚSCULAS"], ["ini", "Primera mayúscula"], ["tal", "Tal cual"]], b.may || "ini") + "</label>" +
        '<label class="fld"><span>Alineación</span>' + op("flAl", [["i", "Izquierda"], ["c", "Centro"], ["d", "Derecha"]], b.al || "c") + "</label>" +
        '<label class="fld"><span>Fuente</span>' + op("flFu", FUENTES.map(function (n) { return [n, n]; }), b.fuente || FUENTES[0]) + "</label>" +
        '<label class="fld"><span>Grosor</span>' + op("flPe", [[400, "Normal"], [500, "Medio"], [600, "Semi negrita"], [700, "Negrita"], [800, "Extra negrita"]], b.peso || 800) + "</label>" +
        '<label class="fld"><span>Espacio entre letras</span>' + op("flEs", [[0, "Normal"], [0.04, "Poco"], [0.1, "Medio"], [0.16, "Amplio"], [0.25, "Muy amplio"]], b.esp || 0) + "</label>" +
        '<label class="fld"><span>Tamaño</span>' + op("flTa", [[80, "80 %"], [90, "90 %"], [95, "95 %"], [100, "Justo a la zona"], [105, "105 %"], [110, "110 %"], [120, "120 %"]], b.tam || 100) + "</label>" +
        '<label class="fld"><span>Color</span><input type="color" class="inp col" id="flCo" value="' + esc(b.color || "#ffffff") + '"></label>' +
        '<label class="fld"><span>Degradado</span><span class="fl-row"><input type="checkbox" id="flG"' + (b.color2 ? " checked" : "") + '><input type="color" class="inp col" id="flC2" value="' + esc(b.color2 || "#8fd3ff") + '"></span></label>' +
        "</div>" +
        '<label class="fld"><span>Tapar la fecha vieja</span>' + op("flTp", [["auto", "Sí, con el color del fondo"], ["fijo", "Sí, con un color que elijo"], ["", "No (la imagen ya viene sin fecha)"]], tp) +
        '<input type="color" class="inp col" id="flTc"' + (tp === "fijo" ? "" : " hidden") + ' value="' + esc(tp === "fijo" ? b.tapar : (b.fondo || ["#000000"])[0]) + '"></label>';
      ejemplo();
    }
    function ejemplo() { var b = p.cajas[sel], e = $("#flEj"); if (b && e) e.textContent = "Esta semana se ve: «" + textoCaja(b, f) + "»"; }
    function leer() {
      var b = p.cajas[sel]; if (!b) return;
      b.t = $("#flT").value; b.may = $("#flMay").value; b.al = $("#flAl").value; b.fuente = $("#flFu").value; b.peso = +$("#flPe").value;
      b.esp = +$("#flEs").value; b.tam = +$("#flTa").value; b.color = $("#flCo").value; b.color2 = $("#flG").checked ? $("#flC2").value : "";
      var tp = $("#flTp").value; $("#flTc").hidden = tp !== "fijo";
      if (tp === "auto") { b.tapar = "auto"; if (!b.fondo) b.fondo = muestrear(im, b); } else b.tapar = tp === "fijo" ? $("#flTc").value : "";
      ejemplo();
      cargarFuentes(p).then(pedir);
    }
    var cursor = function (e) { if (e.target.id === "flT") { e.target.dataset.c = e.target.selectionStart; e.target.dataset.f = e.target.selectionEnd; } };
    ["keyup", "mouseup", "input"].forEach(function (ev) { $("#flF").addEventListener(ev, cursor); });
    $("#flF").addEventListener("input", leer);
    $("#flF").addEventListener("change", leer);
    $("#flF").addEventListener("click", function (e) {
      var t = e.target.closest("[data-tok],#flDel"); if (!t) return;
      if (t.id === "flDel") { p.cajas.splice(sel, 1); sel = p.cajas.length ? Math.min(sel, p.cajas.length - 1) : -1; zonas(); campos(); pedir(); return; }
      // Va donde quedó el cursor; si nunca se tocó el campo, al final.
      var inp = $("#flT"), a = inp.dataset.c ? +inp.dataset.c : inp.value.length, z = inp.dataset.f ? +inp.dataset.f : a;
      inp.value = inp.value.slice(0, a) + t.dataset.tok + inp.value.slice(z); inp.focus();
      try { inp.setSelectionRange(a + t.dataset.tok.length, a + t.dataset.tok.length); } catch (x2) {}
      leer();
    });
    function pos(e) { var r = C.getBoundingClientRect(); return { x: Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)), y: Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)) }; }
    E.addEventListener("pointerdown", function (e) {
      if (!im) return;
      var q = pos(e), z = e.target.closest("[data-z]");
      if (e.target.dataset && e.target.dataset.h && p.cajas[sel]) drag = { m: "r", b: p.cajas[sel] };
      else if (z) { sel = +z.dataset.z; var b = p.cajas[sel]; drag = { m: "m", b: b, dx: q.x - b.x, dy: q.y - b.y }; campos(); }
      else {
        var ult = p.cajas[p.cajas.length - 1] || {};
        var nb = { x: q.x, y: q.y, w: 0, h: 0, t: p.cajas.length ? "" : "{rango}", may: ult.may || "may", al: ult.al || "c", fuente: ult.fuente || FUENTES[0], peso: ult.peso || 800, esp: ult.esp || 0, tam: 100, color: ult.color || "#ffffff", color2: "", tapar: "auto" };
        p.cajas.push(nb); sel = p.cajas.length - 1; drag = { m: "n", b: nb, ox: q.x, oy: q.y };
      }
      try { E.setPointerCapture(e.pointerId); } catch (x2) {}
      e.preventDefault(); zonas();
    });
    E.addEventListener("pointermove", function (e) {
      if (!drag) return; var q = pos(e), b = drag.b;
      if (drag.m === "n") { b.x = Math.min(q.x, drag.ox); b.y = Math.min(q.y, drag.oy); b.w = Math.abs(q.x - drag.ox); b.h = Math.abs(q.y - drag.oy); }
      else if (drag.m === "m") { b.x = Math.min(1 - b.w, Math.max(0, q.x - drag.dx)); b.y = Math.min(1 - b.h, Math.max(0, q.y - drag.dy)); }
      else { b.w = Math.max(0.01, q.x - b.x); b.h = Math.max(0.005, q.y - b.y); }
      b.fondo = null; zonas(); pedir();
    });
    function fin() {
      if (!drag) return; var b = drag.b, nuevo = drag.m === "n"; drag = null;
      if (nuevo && (b.w < 0.01 || b.h < 0.005)) { p.cajas.pop(); sel = -1; }
      else if (b.tapar === "auto") b.fondo = muestrear(im, b);
      zonas(); campos(); pedir();
    }
    E.addEventListener("pointerup", fin); E.addEventListener("pointercancel", fin);
    zonas(); campos();
    Promise.all([cargarImg(x.url), cargarFuentes(p)]).then(function (r) { im = r[0]; redibujar(); }).catch(function () { toast("No se pudo cargar la imagen."); });

    function guardar(texto, btn) {
      btn.disabled = true; btn.textContent = "Guardando…";
      api("guardar", { item: { id: x.id, seccion: "archivo", titulo: x.titulo, texto: texto } }).then(function (j) {
        if (!j.ok) throw new Error(j.error || "error");
        cerrar(); toast("Guardado"); return recargar();
      }).catch(function (e) { btn.disabled = false; btn.textContent = "Guardar"; toast("No se pudo guardar (" + (e.message || e) + ")."); });
    }
    $("#fOk").onclick = function () {
      if (!p.cajas.length) { toast(antes ? "Para quitarla usa «Quitar fecha automática»." : "Marca al menos una zona."); return; }
      if (p.cajas.some(function (b) { return !String(b.t || "").trim(); })) { toast("A una zona le falta qué se escribe."); return; }
      var r4 = function (n) { return Math.round(n * 1e4) / 1e4; };
      p.cajas.forEach(function (b) { b.x = r4(b.x); b.y = r4(b.y); b.w = r4(b.w); b.h = r4(b.h); if (b.tapar === "auto" && !b.fondo && im) b.fondo = muestrear(im, b); });
      guardar(JSON.stringify(p), $("#fOk"));
    };
    var q0 = $("#flQuitar"); if (q0) q0.onclick = function () { guardar("", q0); };
  }

  /* ---------------- eventos ---------------- */
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-tab],[data-abrir],[data-volver],[data-filtro],[data-ver],[data-bajar],[data-copiar],[data-grupo],[data-nuevo],[data-editar],[data-borrar],[data-subir],[data-curso],[data-mover],[data-mgrupo],[data-renombrar],[data-entreno-cal],[data-entreno-edit],[data-flyer]");
    if (!t || !$("#app").contains(t)) return;
    var d = t.dataset;
    if ("entrenoCal" in d) { calendario(); return; }
    if ("entrenoEdit" in d) { editarEntreno(); return; }
    if (d.curso) { S.curso = d.curso; S.q = ""; render(); window.scrollTo(0, 0); }
    else if (d.mover) mover(d.mover, +d.dir);
    else if (d.mgrupo) moverGrupo(d.sec, d.mgrupo, +d.dir);
    else if ("renombrar" in d) renombrar(S.curso);
    else if (d.tab) { S.tab = d.tab; S.carpeta = null; S.curso = null; S.q = ""; try { sessionStorage.setItem("kx-academia-tab", d.tab); } catch (x) {} render(); window.scrollTo(0, 0); }
    else if (d.abrir) { S.carpeta = d.abrir; S.filtro = "todo"; S.q = ""; render(); window.scrollTo(0, 0); }
    else if ("volver" in d) { S.carpeta = null; S.curso = null; render(); }
    else if (d.filtro) { S.filtro = d.filtro; render(); }
    else if (d.ver) ver(porId(d.ver));
    else if (d.flyer) editarFlyer(porId(d.flyer));
    else if (d.bajar) { var xb = porId(d.bajar); if (plantilla(xb)) ver(xb); else bajar(xb, t); }
    else if (d.copiar) copiar(porId(d.copiar), t);
    else if (d.grupo) { var sec = t.closest(".grp"); var abierto = !sec.classList.contains("open"); sec.classList.toggle("open", abierto); S.abiertos[d.grupo] = abierto; }
    else if (d.nuevo) { S.nuevoGrupo = d.en || ""; formulario(d.nuevo, null); }
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
  // Texto con saltos de línea y links que se pueden tocar (se escapa primero).
  function rico(t) {
    return esc(t).replace(/(https?:\/\/[^\s<]+?)([.,;:!?)]*)(?=\s|$|<)/g, function (m, u, cola) {
      return '<a href="' + u + '" target="_blank" rel="noopener">' + u.replace(/^https?:\/\/(www\.)?/, "") + "</a>" + cola;
    }).replace(/\n/g, "<br>");
  }
  function ver(x) {
    if (!x) return;
    var pl = plantilla(x); if (pl) { verFlyer(x, pl); return; }
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
    var conDesc = x.seccion === "video" && x.descripcion;
    $("#layer").innerHTML = '<div class="viewer' + (conDesc ? " cd" : "") + '" role="dialog" aria-modal="true" aria-label="' + esc(x.titulo) + '"><div class="vw-h"><b>' + esc(x.titulo) + '</b><button class="mini ico" data-vcerrar type="button" aria-label="Cerrar">' + ic("x") + '</button></div><div class="vw-b">' + cuerpo + "</div>" +
      (conDesc ? pie + '<div class="vw-desc">' + rico(x.descripcion) + "</div>" : pie) + "</div>";
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
  // Desplegable de grupo/curso: elige uno existente o «Crear … nuevo» (muestra un campo de texto).
  // El valor final queda siempre en el input #id, así val(id) sirve igual.
  function campoGrupo(id, label, valor, lista, cosa) {
    valor = valor || "";
    var existe = lista.indexOf(valor) > -1, crear = !lista.length || (valor && !existe);
    var opts = (lista.length ? '<option value="" disabled' + (!valor ? " selected" : "") + ">Elige un " + cosa + "…</option>" : "") +
      lista.map(function (g) { return '<option value="' + esc(g) + '"' + (g === valor ? " selected" : "") + ">" + esc(g) + "</option>"; }).join("") +
      '<option value="__nuevo"' + (crear ? " selected" : "") + ">+ Crear " + cosa + " nuevo</option>";
    return '<label class="fld"><span>' + label + '</span><div class="sel"><select class="inp" data-gsel="' + id + '">' + opts + "</select></div>" +
      '<input class="inp" id="' + id + '" value="' + esc(valor) + '" placeholder="Nombre del ' + cosa + ' nuevo" autocomplete="off"' + (crear ? "" : " hidden") + "></label>";
  }
  function activarGrupos() {
    [].forEach.call(document.querySelectorAll("[data-gsel]"), function (s) {
      var inp = $("#" + s.dataset.gsel);
      s.addEventListener("change", function () {
        if (s.value === "__nuevo") { inp.hidden = false; inp.value = ""; inp.focus(); } else { inp.hidden = true; inp.value = s.value; }
      });
    });
  }
  // Orden de un elemento nuevo (o que cambia de grupo): al final de SU grupo; grupo nuevo → al final de todo.
  function ordenNuevo(sec, item) {
    var k = claveG(item), g = gruposSec(sec).filter(function (x) { return x[0] === k; })[0];
    var otros = g ? g[1].filter(function (x) { return x.id !== item.id; }) : [];
    if (otros.length) return Math.max.apply(null, otros.map(function (x) { return x.orden || 0; })) + 10;
    var mx = Math.max.apply(null, de(sec).map(function (x) { return x.orden || 0; }).concat([0]));
    return (Math.floor(mx / 1000) + 1) * 1000;
  }
  function val(id) { var el = $("#" + id); return el ? el.value.trim() : ""; }
  function gruposDe(sec) { var s = {}; de(sec).forEach(function (x) { if (x.grupo) s[x.grupo] = 1; }); return Object.keys(s); }

  function formulario(sec, it) {
    var nuevo = !it; it = it || {};
    var c = "";
    if (sec === "guion") c = campoGrupo("fGrupo", "Grupo", it.grupo, gruposSec("guion").map(function (g) { return g[0]; }), "grupo") + campo("fTitulo", "Título", it.titulo) + campo("fTexto", "Texto del guion", it.texto, { area: 1 });
    else if (sec === "link") c = campoGrupo("fGrupo", "Grupo", it.grupo || S.nuevoGrupo, gruposSec("link").map(function (g) { return g[0]; }), "grupo") + campo("fTitulo", "Título", it.titulo) + campo("fDesc", "Descripción (opcional)", it.descripcion) + campo("fUrl", "Link", it.url, { ph: "https://…" });
    else if (sec === "carpeta") c = campo("fTitulo", "Nombre de la carpeta", it.titulo) + campo("fDesc", "Descripción (opcional)", it.descripcion);
    else if (sec === "video") {
      c = campoGrupo("fCurso", "Curso", nuevo ? (S.curso || "") : cursoDe(it), cursos(), "curso") +
        campo("fTitulo", "Título del video", it.titulo) + campo("fDesc", "Descripción (opcional)", it.descripcion, { area: 1, ayuda: "Se ve debajo del video al abrirlo. Pega links a recursos o páginas: quedan para tocar. La primera línea sale también en la lista del curso." });
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
    activarGrupos(); S.nuevoGrupo = "";
    var t0 = $("#fTitulo"); if (t0) setTimeout(function () { t0.focus(); }, 50);

    $("#fOk").onclick = function () {
      var ok = $("#fOk");
      var item = { seccion: sec, titulo: val("fTitulo") };
      if (it.id) item.id = it.id;
      if (!item.titulo) { toast("Falta el título."); return; }
      if (sec === "guion") { item.grupo = val("fGrupo"); if (!item.grupo) { toast("Elige un grupo."); return; } item.texto = $("#fTexto").value; if (!item.texto.trim()) { toast("Falta el texto."); return; } }
      if (sec === "link") { item.grupo = val("fGrupo"); if (!item.grupo) { toast("Elige un grupo."); return; } item.descripcion = val("fDesc"); item.url = conHttps(val("fUrl")); if (!/^https?:\/\//.test(item.url)) { toast("El link tiene que empezar con https://"); return; } }
      if (sec === "carpeta") item.descripcion = val("fDesc");
      if (sec === "video") {
        item.grupo = val("fCurso"); if (!item.grupo) { toast("Elige un curso."); return; }
        item.descripcion = val("fDesc"); item.descargable = false;
        if (!nuevo) { item.url = conHttps(val("fUrl")); item.miniatura = val("fMini"); }
      }
      item.seccion = sec;
      if (nuevo || ("grupo" in item && claveG(it) !== claveG(item))) item.orden = ordenNuevo(sec, item);
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
