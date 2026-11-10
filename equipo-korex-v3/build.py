# Arma index.html juntando _template.html + slides/NN.html (en orden).
# Cada slides/NN.html tiene: un <style> opcional (CSS con prefijo #sNN) y UNA <section class="slide" id="sNN">.
# Si falta una slide, pone la imagen original como relleno para que la numeración no se corra.
import os, re, sys

here = os.path.dirname(os.path.abspath(__file__))
tpl = open(os.path.join(here, '_template.html'), encoding='utf-8').read()
css, html = [], []
# Versión 2: orden nuevo de 29 slides (pantalla de espera aparte). Nombres = archivos en slides/ (los 'n..' son nuevas).
# Versión 3: dos partes. Apertura → PARTE 1 inversión (solo AITech y copy trading) → PARTE 2 negocio (IB + Método Korex).
ORDER = ['02','01','n03',
         'p1','06','09','11','12','13','ct','14','15','rt','07','10','n23',
         'p2','03','05','04','08','16','17','18','19','20','21','22','23','nx','n29']
for k, n in enumerate(ORDER, 1):
    f = os.path.join(here, 'slides', f'{n}.html')
    if os.path.exists(f):
        src = open(f, encoding='utf-8').read()
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
