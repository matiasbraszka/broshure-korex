# Arma index.html juntando _template.html + slides/NN.html (en orden).
# Cada slides/NN.html tiene: un <style> opcional (CSS con prefijo #sNN) y UNA <section class="slide" id="sNN">.
# Si falta una slide, pone la imagen original como relleno para que la numeración no se corra.
import os, re, sys

here = os.path.dirname(os.path.abspath(__file__))
tpl = open(os.path.join(here, '_template.html'), encoding='utf-8').read()
css, html = [], []
for n in range(1, 25):
    f = os.path.join(here, 'slides', f'{n:02d}.html')
    if os.path.exists(f):
        src = open(f, encoding='utf-8').read()
        for m in re.finditer(r'<style>(.*?)</style>', src, re.S):
            css.append(f'/* ── slide {n:02d} ── */\n' + m.group(1).strip())
        sec = re.search(r'<section\b.*</section>', src, re.S)
        if not sec:
            sys.exit(f'slides/{n:02d}.html: falta <section>')
        html.append(sec.group(0))
    else:
        html.append(f'<section class="slide" id="s{n:02d}"><img src="s/{n:02d}.webp" alt="" style="width:100%;height:100%"></section>')
out = tpl.replace('/*__SLIDE_CSS__*/', '\n\n'.join(css)).replace('<!--__SLIDES__-->', '\n\n'.join(html))
open(os.path.join(here, 'index.html'), 'w', encoding='utf-8').write(out)
print('index.html ok:', sum(os.path.exists(os.path.join(here, 'slides', f'{n:02d}.html')) for n in range(1, 25)), 'slides en código')
