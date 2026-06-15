#!/usr/bin/env python3
"""Regenerate variant-*.html from index.html (style/title/fonts/switcher patches)."""
import re
base=open('index.html').read()
FONTS={
 'night':"https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600&family=Archivo+Black&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap",
 'atelier':"https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Lora:ital,wght@0,400;0,500;1,400&family=Inter:wght@400;500;600&display=swap",
 'fieldday':"https://fonts.googleapis.com/css2?family=Archivo+Black&family=Space+Grotesk:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&family=Newsreader:ital,opsz,wght@1,6..72,400..600&display=swap",
 'omea':"https://api.fontshare.com/v2/css?f[]=switzer@300,400,500,600,301,401&display=swap",
}
TITLES={'night':'Night Issue','atelier':'Atelier Edition','fieldday':'Field Day','omea':'Omea Edition'}
NAMES=[('index.html','Original'),('variant-night.html','Night'),('variant-atelier.html','Atelier'),('variant-fieldday.html','Field Day'),('variant-omea.html','Omea')]
oldfont=re.search(r'<link href="https://fonts\.googleapis\.com/css2\?[^"]*"', base).group(0)
CUR=' class="is-current"'
for key in FONTS:
    s=base
    s=s.replace('<title>Health Is a Team Sport — An Editorial Thesis</title>',
                '<title>Health Is a Team Sport — '+TITLES[key]+'</title>')
    s=s.replace(oldfont, '<link href="'+FONTS[key]+'"')
    s=s.replace('href="css/style.css"', 'href="css/variant-'+key+'.css"')
    s=s.replace('href="https://healthisateamsport.com/"', 'href="https://healthisateamsport.com/variant-'+key+'.html"')
    s=s.replace('content="https://healthisateamsport.com/"', 'content="https://healthisateamsport.com/variant-'+key+'.html"')
    links=[]
    for f,n in NAMES:
        cur = CUR if f=='variant-'+key+'.html' else ''
        links.append('<a href="'+f+'"'+cur+'>'+n+'</a>')
    nav='<nav class="vswitch" aria-label="Style variants">'+''.join(links)+'</nav>\n</body>'
    s=s.replace('</body>', nav)
    open('variant-'+key+'.html','w').write(s)
    print('built variant-'+key+'.html')
