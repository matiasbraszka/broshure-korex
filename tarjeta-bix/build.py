# Arma index.html juntando _template.html + slides/NN.html (en orden) + _intro.html (pantalla de espera).
# Uso: python -I build.py
# Cada slides/NN.html tiene: un <style> opcional (CSS con prefijo #sNN) y UNA <section class="slide" id="sNN">.
# Marcadores que reemplaza:
#   <!--TARJETA-->  <!--TARJETA chip-->   tarjeta BIX en vector (con chip = física)
#   <!--DECO-->                           isotipo BIX grande en línea, de fondo (posición con CSS de la slide)
#   {{ic:nombre}}                         ícono de línea (lista ICONOS)
# A todas menos la portada les agrega el pie «KOREX by BIX CARD · Partner independiente» + número.
import os, re, sys

here = os.path.dirname(os.path.abspath(__file__))
rd = lambda *p: open(os.path.join(here, *p), encoding='utf-8').read()
ISO = re.search(r' d="([^"]+)"', rd('img', 'isotipo-bix-verde.svg')).group(1)
LOGO = re.search(r' d="([^"]+)"', rd('img', 'logo-bix-negro.svg')).group(1)

ICONOS = {
    'wallet': '<path d="M19 7V5.5A2.5 2.5 0 0 0 16.5 3h-11A2.5 2.5 0 0 0 3 5.5v13A2.5 2.5 0 0 0 5.5 21h11a2.5 2.5 0 0 0 2.5-2.5V17"/><path d="M21 8h-5a3 3 0 0 0 0 6h5z"/><path d="M16.5 11h.01"/>',
    'card': '<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 10h19M6.5 15h4"/>',
    'phone': '<rect x="6" y="2.5" width="12" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
    'shield': '<path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z"/><path d="m9 12 2 2 4-4"/>',
    'key': '<circle cx="7.5" cy="15.5" r="4"/><path d="m10.5 12.5 9-9M16 7l2.5 2.5M14 9l2 2"/>',
    'lock': '<rect x="4.5" y="10.5" width="15" height="10.5" rx="2"/><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"/>',
    'cube': '<path d="M12 2.5 3 7.5v9l9 5 9-5v-9z"/><path d="M12 12v9.5M12 12 3 7.5M12 12l9-4.5"/>',
    'server': '<rect x="3" y="3.5" width="18" height="7" rx="1.5"/><rect x="3" y="13.5" width="18" height="7" rx="1.5"/><path d="M7 7h.01M7 17h.01"/>',
    'badge': '<circle cx="12" cy="9" r="6"/><path d="M8.5 14 7 21.5l5-3 5 3-1.5-7.5"/>',
    'audit': '<circle cx="11" cy="11" r="7"/><path d="m20.5 20.5-4.5-4.5M8 11l2 2 4-4"/>',
    'phonecheck': '<rect x="5" y="2.5" width="14" height="19" rx="2.5"/><path d="m9 12 2 2 4-4"/>',
    'eye': '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    'store': '<path d="M3.5 9.5 5 4h14l1.5 5.5M3.5 9.5h17M4.5 9.5V20h15V9.5M9.5 20v-5h5v5"/>',
    'cart': '<circle cx="9" cy="20" r="1.2"/><circle cx="17.5" cy="20" r="1.2"/><path d="M2.5 3.5h3l2.4 11.5h10.6L21 7H6.4"/>',
    'plane': '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3.5s-2.5 0-4 1.5L13.5 8.5 5.3 6.7c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
    'nfc': '<path d="M8.5 8.5a5 5 0 0 1 0 7M12 6a8.5 8.5 0 0 1 0 12M15.5 3.5a12 12 0 0 1 0 17M5 11a1.5 1.5 0 0 1 0 2"/>',
    'download': '<path d="M12 3.5v12M7 10.5l5 5 5-5M4 20.5h16"/>',
    'up': '<path d="M12 19V5M5.5 11.5 12 5l6.5 6.5"/>',
    'arrow': '<path d="M5 12h14M13 6l6 6-6 6"/>',
    'snow': '<path d="M12 2v20M3.3 7l17.4 10M20.7 7 3.3 17M9.5 3.5 12 6l2.5-2.5M9.5 20.5 12 18l2.5 2.5"/>',
    'sliders': '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
    'dots': '<rect x="3" y="6" width="18" height="12" rx="2.5"/><path d="M7.5 12h.01M12 12h.01M16.5 12h.01"/>',
    'back': '<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
    'layers': '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
    'globe': '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    'headset': '<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="2.5" y="13.5" width="4" height="6" rx="1.5"/><rect x="17.5" y="13.5" width="4" height="6" rx="1.5"/><path d="M19.5 19.5c0 1.5-2 2.5-5 2.5"/>',
    'users': '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17" cy="9" r="2.5"/><path d="M16.5 14a5 5 0 0 1 5 5"/>',
    'id': '<rect x="2.5" y="4.5" width="19" height="15" rx="2"/><circle cx="8.5" cy="11" r="2.3"/><path d="M5 16.5a3.8 3.8 0 0 1 7 0M14.5 9.5h4M14.5 13h4"/>',
    'home': '<path d="M3.5 11 12 4l8.5 7M5.5 9.5V20h13V9.5"/>',
    'camera': '<path d="M4 8h3l1.5-2.5h7L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
    'mail': '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6.5 8.5 6.5 8.5-6.5"/>',
    'qr': '<rect x="3.5" y="3.5" width="6" height="6" rx="1"/><rect x="14.5" y="3.5" width="6" height="6" rx="1"/><rect x="3.5" y="14.5" width="6" height="6" rx="1"/><path d="M14.5 14.5h2v2h-2zM18.5 18.5h2v2h-2zM18.5 14.5h2M14.5 20.5h2"/>',
    'link': '<path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1"/>',
    'check': '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    'x': '<path d="M6 6l12 12M18 6 6 18"/>',
    'alert': '<path d="M12 3.5 2.5 20h19z"/><path d="M12 10v4.5M12 17.2h.01"/>',
    'zap': '<path d="M13 2.5 4 14h7l-1 7.5L19 10h-7z"/>',
    'clock': '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    'coin': '<circle cx="12" cy="12" r="9"/><path d="M14.8 9.2c-.5-1-1.6-1.6-2.8-1.6-1.6 0-2.8.9-2.8 2.1 0 2.9 5.6 1.6 5.6 4.5 0 1.2-1.2 2.2-2.8 2.2-1.3 0-2.4-.6-2.9-1.7M12 6v1.6M12 16.4V18"/>',
    'bank': '<path d="M3 9.5 12 4l9 5.5M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20.5h18"/>',
    'gift': '<rect x="3.5" y="8.5" width="17" height="4" rx="1"/><path d="M5 12.5v8h14v-8M12 8.5v12M12 8.5S10.5 4 8 4.5 7 8.5 12 8.5zM12 8.5s1.5-4.5 4-4 1 4-4 4z"/>',
    'swap': '<path d="M7 4 3.5 7.5 7 11M3.5 7.5h13M17 13l3.5 3.5L17 20M20.5 16.5h-13"/>',
    'star': '<path d="M12 3l2.4 5.6 6.1.5-4.6 4 1.4 6-5.3-3.2-5.3 3.2 1.4-6-4.6-4 6.1-.5z"/>',
    'red': '<circle cx="12" cy="5" r="2.5"/><circle cx="5" cy="18.5" r="2.5"/><circle cx="19" cy="18.5" r="2.5"/><path d="M12 7.5v4M12 11.5 6.5 16.5M12 11.5l5.5 5"/>',
    'percent': '<path d="M19 5 5 19"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/>',
    'refresh': '<path d="M20 11a8 8 0 0 0-14.7-4.3L3.5 9"/><path d="M3.5 4v5h5"/><path d="M4 13a8 8 0 0 0 14.7 4.3l1.8-2.3"/><path d="M20.5 20v-5h-5"/>',
    'bed': '<path d="M3 19V6M3 15h18v4M3 11h6a3 3 0 0 1 3 3v1M12 11h6a3 3 0 0 1 3 3v1"/>',
    'help': '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.3a2.6 2.6 0 0 1 5 .9c0 1.8-2.5 2.2-2.5 3.8M12 17h.01"/>',
}

def icono(m):
    n = m.group(1)
    if n not in ICONOS:
        sys.exit(f'ícono desconocido: {n}')
    return f'<svg class="i" viewBox="0 0 24 24" aria-hidden="true">{ICONOS[n]}</svg>'

k = 0
def tarjeta(m):
    global k
    k += 1
    chip = m.group(1) == ' chip'
    extra = ('<rect x="56" y="196" width="104" height="80" rx="14" fill="#E9D99A"/>'
             '<path d="M56 236h104M108 196v80M82 196v24M134 252v24" stroke="#B5A262" stroke-width="3" fill="none"/>'
             '<path transform="translate(186 214)" d="M0 8a14 14 0 0 1 0 28M10 2a22 22 0 0 1 0 40M20-4a30 30 0 0 1 0 52" '
             'stroke="#020202" stroke-width="4" fill="none" stroke-linecap="round" opacity=".75"/>') if chip else ''
    return f'''<svg viewBox="0 0 856 540" role="img" aria-label="Tarjeta Visa de BIX"><defs>
<linearGradient id="tf{k}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#DBFF80"/><stop offset=".55" stop-color="#CAFE5C"/><stop offset="1" stop-color="#B6EC3E"/></linearGradient>
<pattern id="tp{k}" width="46" height="46" patternUnits="userSpaceOnUse"><path transform="translate(4 4) scale(1.27)" d="{ISO}" fill="#4D6900"/></pattern>
<radialGradient id="tg{k}" cx=".5" cy=".45" r=".72"><stop offset=".5" stop-color="#000"/><stop offset=".78" stop-color="#3a3a3a"/><stop offset="1" stop-color="#b0b0b0"/></radialGradient>
<mask id="tm{k}"><rect width="856" height="540" fill="url(#tg{k})"/></mask>
<linearGradient id="tb{k}" x1="0" y1="0" x2="1" y2="0"><stop offset=".3" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".75"/><stop offset=".7" stop-color="#fff" stop-opacity="0"/></linearGradient>
<clipPath id="tc{k}"><rect width="856" height="540" rx="36"/></clipPath></defs>
<g clip-path="url(#tc{k})"><rect width="856" height="540" fill="url(#tf{k})"/><rect width="856" height="540" fill="url(#tp{k})" mask="url(#tm{k})"/>
<g transform="rotate(18 428 270)"><rect class="brillo" x="-100" y="-300" width="700" height="1140" fill="url(#tb{k})"/></g></g>
<path transform="translate(52 48) scale(2.05)" d="{LOGO}" fill="#020202" fill-rule="evenodd"/>{extra}
<text x="56" y="482" font-family="Geist Mono,monospace" font-weight="600" font-size="34" letter-spacing="3" fill="#020202">•  0216</text>
<text x="800" y="486" text-anchor="end" font-family="Montserrat,Arial,sans-serif" font-style="italic" font-weight="900" font-size="78" letter-spacing="-1" fill="#020202">VISA</text>
</svg>'''

DECO = f'<svg class="deco" viewBox="0 0 30 30" aria-hidden="true"><path d="{ISO}"/></svg>'

files = sorted(f for f in os.listdir(os.path.join(here, 'slides')) if re.fullmatch(r'\d\d\.html', f))
TOTAL = len(files)
css, html = [], []
for i, f in enumerate(files, 1):
    src = rd('slides', f)
    for m in re.finditer(r'<style>(.*?)</style>', src, re.S):
        css.append(f'/* ── slide {f[:2]} ── */\n' + m.group(1).strip())
    sec = re.search(r'<section\b.*</section>', src, re.S)
    if not sec:
        sys.exit(f'slides/{f}: falta <section>')
    s = sec.group(0)
    s = re.sub(r'<!--TARJETA( chip)?-->', tarjeta, s)
    s = s.replace('<!--DECO-->', DECO)
    s = re.sub(r'\{\{ic:([\w-]+)\}\}', icono, s)
    if i > 1:
        pie = (f'<div class="foot"><span><b>KOREX by BIX CARD</b> · Partner independiente</span>'
               f'<span class="r"><img src="img/logo-bix-blanco.svg" alt="BIX">{i:02d} / {TOTAL:02d}</span></div>')
        s = s[:s.rfind('</section>')] + pie + '</section>'
    html.append(s)

intro = rd('_intro.html')
def part(tag):
    return re.search(rf'<!--{tag}-->(.*?)<!--/{tag}-->', intro, re.S).group(1)
out = rd('_template.html').replace('/*__SLIDE_CSS__*/', '\n\n'.join(css)).replace('<!--__SLIDES__-->', '\n\n'.join(html) + '\n' + part('INTRO_HTML'))
out = out.replace('</head>', part('INTRO_STYLE') + '</head>', 1)
out = out[:out.rfind('</body>')] + part('INTRO_SCRIPT') + out[out.rfind('</body>'):]
open(os.path.join(here, 'index.html'), 'w', encoding='utf-8').write(out)
faltan = [u for u in set(re.findall(r'img/([\w.-]+)', out)) if not os.path.exists(os.path.join(here, 'img', u))]
print('index.html ok:', TOTAL, 'slides ·', len(out) // 1024, 'KB · imágenes que faltan:', faltan or 'ninguna')
