# Arma index.html juntando _template.html + slides/NN.html (en orden).
# Cada slides/NN.html tiene: un <style> opcional (CSS con prefijo #sNN) y UNA <section class="slide" id="sNN">.
# Si falta una slide, pone la imagen original como relleno para que la numeración no se corra.
import os, re, sys

here = os.path.dirname(os.path.abspath(__file__))
tpl = open(os.path.join(here, '_template.html'), encoding='utf-8').read()
css, html = [], []
# Versión TARJETA BIX (copia de la v3): apertura → PARTE 1 la tarjeta (b01–b08) → PARTE 2 negocio (b09–b11 + Método Korex).
ORDER = ['02','01','n03',
         'p1','07','b02','b03','b04','b06','est','b07','b08',
         'p2','b09','sim','03','05','04','20','21','22','23','24','nx']
# Tarjeta en vector e íconos: se toman de la presentación tarjeta-bix (misma fuente, sin copiar código).
_tb = os.path.join(here, '..', 'tarjeta-bix', 'build.py')
_src = open(_tb, encoding='utf-8').read()
BIX = {'__file__': _tb}
exec(_src[:_src.index('files = sorted')], BIX)
def marcas(t):
    t = re.sub(r'<!--TARJETA( chip)?-->', BIX['tarjeta'], t)
    return re.sub(r'\{\{ic:([a-z]+)\}\}', BIX['icono'], t)
for k, n in enumerate(ORDER, 1):
    f = os.path.join(here, 'slides', f'{n}.html')
    if os.path.exists(f):
        src = marcas(open(f, encoding='utf-8').read())
        for m in re.finditer(r'<style>(.*?)</style>', src, re.S):
            css.append(f'/* ── slide {k} ({n}) ── */\n' + m.group(1).strip())
        sec = re.search(r'<section\b.*</section>', src, re.S)
        if not sec:
            sys.exit(f'slides/{n}.html: falta <section>')
        html.append(re.sub(r'(class="pg-a">)\d+', lambda m: m.group(1) + str(k), sec.group(0)))  # numeración según el orden nuevo
    else:
        sys.exit(f'falta slides/{n}.html')
# Pantalla de espera (_intro.html): estilo en <head>, HTML dentro del escenario, script al final
intro = open(os.path.join(here, '_intro.html'), encoding='utf-8').read()
def part(tag):
    return re.search(rf'<!--{tag}-->(.*?)<!--/{tag}-->', intro, re.S).group(1)
out = tpl.replace('/*__SLIDE_CSS__*/', '\n\n'.join(css)).replace('<!--__SLIDES__-->', '\n\n'.join(html) + '\n' + part('INTRO_HTML'))
out = out.replace('</head>', part('INTRO_STYLE') + '</head>', 1)
out = out[:out.rfind('</body>')] + part('INTRO_SCRIPT') + out[out.rfind('</body>'):]
open(os.path.join(here, 'index.html'), 'w', encoding='utf-8').write(out)
print('index.html ok:', len(ORDER), 'slides')
