import os
import re

articles_dir = r"c:\ProAG\PureteGO_Site\blog\articulos"
articles = [f for f in os.listdir(articles_dir) if f.endswith(".html")]

print(f"Checking nav in {len(articles)} blog articles:")

for article in articles:
    filepath = os.path.join(articles_dir, article)
    with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()
        
    nav_match = re.search(r'<nav class="nav">.*?</nav>', content, re.DOTALL)
    if not nav_match:
        print(f"  - {article}: NO NAV FOUND")
        continue
        
    # Check if the links in dropdown have the correct relative path (../../servicios/...)
    nav_text = nav_match.group(0)
    links = re.findall(r'href="([^"]+)"', nav_text)
    
    # We expect:
    # Inicio: ../../index.html
    # Servicios dropdown links: ../../servicios/...
    # Nosotros: ../../nosotros.html
    # Blog: ../index.html
    # Contacto: ../../contacto.html
    
    expected_links = [
        "../../index.html",
        "../../index.html#servicios",
        "../../servicios/geomarketing.html",
        "../../servicios/perfil-empresarial.html",
        "../../servicios/marketing-digital.html",
        "../../servicios/creacion-sitios.html",
        "../../servicios/hospedaje-web.html",
        "../../nosotros.html",
        "../index.html",
        "../../contacto.html"
    ]
    
    missing_or_incorrect = []
    for el in expected_links:
        if el not in links:
            missing_or_incorrect.append(el)
            
    if missing_or_incorrect:
        print(f"  - {article}: missing or incorrect links:")
        for m in missing_or_incorrect:
            print(f"    * Expected: {m}")
        print("    * Found links in nav:")
        for l in links:
            print(f"      - {l}")
    else:
        # print(f"  - {article}: OK")
        pass
print("Done checking articles nav.")
