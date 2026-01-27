import os

# List of files to update
files = [
    r"g:\Otros ordenadores\Meu laptop\Documents\WorkBench\Purete)Online\WorkBench\SiteNovoPureteGO\nosotros.html",
    r"g:\Otros ordenadores\Meu laptop\Documents\WorkBench\Purete)Online\WorkBench\SiteNovoPureteGO\blog\index.html",
    r"g:\Otros ordenadores\Meu laptop\Documents\WorkBench\Purete)Online\WorkBench\SiteNovoPureteGO\servicios\geomarketing.html",
    r"g:\Otros ordenadores\Meu laptop\Documents\WorkBench\Purete)Online\WorkBench\SiteNovoPureteGO\servicios\creacion-sitios.html",
    r"g:\Otros ordenadores\Meu laptop\Documents\WorkBench\Purete)Online\WorkBench\SiteNovoPureteGO\servicios\perfil-empresarial.html",
    r"g:\Otros ordenadores\Meu laptop\Documents\WorkBench\Purete)Online\WorkBench\SiteNovoPureteGO\servicios\marketing-digital.html"
]

for file_path in files:
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Replace all references
        content = content.replace('planes-hosting.html', 'hospedaje-web.html')
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✓ Updated: {os.path.basename(file_path)}")
    except Exception as e:
        print(f"✗ Error updating {os.path.basename(file_path)}: {e}")

print("\n✅ All files updated successfully!")
