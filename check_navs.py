import os
import re

files_to_check = [
    "index.html",
    "nosotros.html",
    "contacto.html",
    "servicios/geomarketing.html",
    "servicios/perfil-empresarial.html",
    "servicios/marketing-digital.html",
    "servicios/creacion-sitios.html",
    "servicios/hospedaje-web.html",
    "blog/index.html"
]

out_lines = []
out_lines.append("CHECKING EXACT MENU LISTS:")
for filename in files_to_check:
    filepath = os.path.join(r"c:\ProAG\PureteGO_Site", filename)
    if not os.path.exists(filepath):
        out_lines.append(f"File not found: {filename}")
        continue
    with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()
    
    # Extract nav-list block
    nav_list_match = re.search(r'<ul class="nav-list">.*?</ul>', content, re.DOTALL)
    if nav_list_match:
        out_lines.append(f"\n==================== {filename} ==================== (len: {len(nav_list_match.group(0))})")
        out_lines.append(nav_list_match.group(0).strip())
    else:
        out_lines.append(f"\n==================== {filename} ====================")
        out_lines.append("NO NAV LIST FOUND")

with open("nav_output.txt", "w", encoding="utf-8") as f_out:
    f_out.write("\n".join(out_lines))
print("Done writing to nav_output.txt")
