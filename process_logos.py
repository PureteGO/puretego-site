import os
import shutil
import subprocess

# Paths
base_dir = r"g:\Otros ordenadores\Meu laptop\Documents\WorkBench\Purete)Online\WorkBench\SiteNovoPureteGO"
logos_clientes_dir = os.path.join(base_dir, "logos_clientes")
target_dir = os.path.join(base_dir, "img", "logos")
uass_path = os.path.join(target_dir, "uass.png")
temp_uass = os.path.join(base_dir, "uass_temp.png")

# 1. Backup UASS
if os.path.exists(uass_path):
    shutil.copy(uass_path, temp_uass)
    print("✓ UASS logo backed up.")
else:
    print("⚠ Warning: UASS logo not found in img/logos!")

# 2. Clean img/logos
if os.path.exists(target_dir):
    shutil.rmtree(target_dir)
    os.makedirs(target_dir)
    print("✓ img/logos cleaned.")

# 3. Restore UASS
if os.path.exists(temp_uass):
    shutil.copy(temp_uass, uass_path)
    # Convert UASS to WebP
    subprocess.run(["npx", "-y", "sharp-cli", "-i", uass_path, "-o", os.path.join(target_dir, "uass.webp"), "--resize", "200"], shell=True)
    os.remove(temp_uass) # Cleanup temp
    print("✓ UASS logo restored and optimized.")

# 4. Process new logos
new_logos = [f for f in os.listdir(logos_clientes_dir) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]

processed_logos = []

for logo in new_logos:
    input_path = os.path.join(logos_clientes_dir, logo)
    filename_no_ext = os.path.splitext(logo)[0]
    output_filename = f"{filename_no_ext}.webp"
    output_path = os.path.join(target_dir, output_filename)
    
    # Resize and convert to WebP (Max width 200px to keep it light)
    print(f"Processing {logo}...")
    subprocess.run(["npx", "-y", "sharp-cli", "-i", input_path, "-o", output_path, "--resize", "200"], shell=True)
    
    if os.path.exists(output_path):
        processed_logos.append(output_filename)

# 5. Organize for HTML
# We need UASS in 3rd or 4th position.
# We need to ensure HL Tuning is present.
# 'hltuning.webp' should be in processed_logos if it was in logos_clientes (it was: hltuning.png)

final_list = []

# Find HL Tuning and remove from list to place explicitly if needed, or just let it be.
# Valid names seen: 'hltuning.png' -> 'hltuning.webp'
hl_logo = 'hltuning.webp'
uass_logo = 'uass.webp'

# Remove special ones from the pool to place them manually
if hl_logo in processed_logos:
    processed_logos.remove(hl_logo)
if uass_logo in processed_logos:
    processed_logos.remove(uass_logo) # Should not happen as UASS was processed separately, but good check

# Construct the list
# Pos 1: Random generic
if processed_logos: final_list.append(processed_logos.pop(0))
# Pos 2: Random generic
if processed_logos: final_list.append(processed_logos.pop(0))
# Pos 3: HL Tuning (User asked to keep it, good place for it)
final_list.append(hl_logo)
# Pos 4: UASS (User asked for 3rd or 4th position)
final_list.append(uass_logo)

# Apps the rest
final_list.extend(processed_logos)

# 6. Generate HTML
html_content = '            <!-- Logos - Lote 1 -->\n'
for logo in final_list:
    name = os.path.splitext(logo)[0].replace('-', ' ').title()
    if logo == 'uass.webp':
        html_content += f'            <div class="logo-item uass-special"><img src="img/logos/{logo}" alt="{name}" loading="lazy" width="150" height="auto"></div>\n'
    else:
        html_content += f'            <div class="logo-item"><img src="img/logos/{logo}" alt="{name}" loading="lazy" width="150" height="auto"></div>\n'

html_content += '\n            <!-- Duplicação para efeito infinito -->\n'
for logo in final_list:
    name = os.path.splitext(logo)[0].replace('-', ' ').title()
    if logo == 'uass.webp':
        html_content += f'            <div class="logo-item uass-special"><img src="img/logos/{logo}" alt="{name}" loading="lazy" width="150" height="auto"></div>\n'
    else:
        html_content += f'            <div class="logo-item"><img src="img/logos/{logo}" alt="{name}" loading="lazy" width="150" height="auto"></div>\n'

# Save HTML snippet to file for reading
with open("logo_wall_snippet.html", "w", encoding="utf-8") as f:
    f.write(html_content)

print("✓ HTML snippet generated in logo_wall_snippet.html")
