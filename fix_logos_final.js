const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const baseDir = __dirname;
const logosDir = path.join(baseDir, 'img', 'logos');
const logosClientesDir = path.join(baseDir, 'logos_clientes');

// 1. Clean
if (fs.existsSync(logosDir)) {
    try { fs.rmSync(logosDir, { recursive: true, force: true }); } catch (e) { }
}
if (!fs.existsSync(logosDir)) fs.mkdirSync(logosDir);

// 2. Process
const sourceFiles = fs.readdirSync(logosClientesDir);
const validExtensions = ['.png', '.jpg', '.jpeg'];

const sanitize = (name) => name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-\.]/g, '');

let processedLogos = [];

sourceFiles.forEach(file => {
    const ext = path.extname(file).toLowerCase();
    if (validExtensions.includes(ext)) {
        const nameNoExt = path.basename(file, ext);
        const cleanName = sanitize(nameNoExt);
        const finalFilename = `${cleanName}${ext}`; // Keep original extension if copy
        const destPath = path.join(logosDir, finalFilename);
        const sourcePath = path.join(logosClientesDir, file);

        try {
            // Just Copy and Rename to Lowercase to fix 404s/Linux issues
            fs.copyFileSync(sourcePath, destPath);
            processedLogos.push(finalFilename);
        } catch (e) {
            console.error(`Failed to copy ${file}:`, e);
        }
    }
});

// 3. UASS Handling
// We need to fetch UASS from backup as it's not in logos_clientes
const uassBackupPath = path.join(baseDir, 'uass_save.png');
let uassFile = null;
if (fs.existsSync(uassBackupPath)) {
    const uassDest = path.join(logosDir, 'uass.png');
    fs.copyFileSync(uassBackupPath, uassDest);
    processedLogos.push('uass.png');
    uassFile = 'uass.png';
}

// 4. Order
const uass = uassFile;
// Find fuzzy matches in normalized names
const hltuning = processedLogos.find(f => f.includes('hltuning'));
const motoMorini = processedLogos.find(f => f.includes('morini'));

let generalDefaults = processedLogos.filter(f => f !== uass && f !== hltuning && f !== motoMorini);

let finalOrder = [];

// Pos 1 & 2: Generic
if (generalDefaults.length > 0) finalOrder.push(generalDefaults.shift());
if (generalDefaults.length > 0) finalOrder.push(generalDefaults.shift());

// Pos 3: HL Tuning
if (hltuning) finalOrder.push(hltuning);

// Pos 4: Moto Morini
if (motoMorini) finalOrder.push(motoMorini);

// Pos 5: UASS
if (uass) finalOrder.push(uass);

finalOrder = finalOrder.concat(generalDefaults);

// 5. Generate HTML
let html = '          <div class="ticker-track">\n            <!-- Logos - Batch 1 -->\n';

const generateItem = (filename) => {
    const isUass = filename.includes('uass');
    const className = isUass ? 'logo-item uass-special' : 'logo-item';
    const altName = path.basename(filename, path.extname(filename)).replace(/-/g, ' ').toUpperCase();
    return `            <div class="${className}"><img src="img/logos/${filename}" alt="${altName}" loading="lazy" width="150" height="auto"></div>`;
};

finalOrder.forEach(logo => html += generateItem(logo) + '\n');
html += '\n            <!-- Duplicação para efeito infinito -->\n';
finalOrder.forEach(logo => html += generateItem(logo) + '\n');
html += '          </div>';

fs.writeFileSync(path.join(baseDir, 'logo_wall_final.html'), html, 'utf8');
console.log('Done.');
