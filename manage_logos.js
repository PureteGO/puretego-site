const fs = require('fs');
const path = require('path');

const baseDir = __dirname;
const logosClientesDir = path.join(baseDir, 'logos_clientes');
const targetDir = path.join(baseDir, 'img', 'logos');
const uassSource = path.join(targetDir, 'uass.png');
const uassBackup = path.join(baseDir, 'uass_save.png');

// 1. Backup UASS
if (fs.existsSync(uassSource)) {
    fs.copyFileSync(uassSource, uassBackup);
    console.log('UASS backed up');
} else {
    console.log('UASS not found to backup');
}

// 2. Clean Target Directory
if (fs.existsSync(targetDir)) {
    fs.rmSync(targetDir, { recursive: true, force: true });
}
fs.mkdirSync(targetDir);

// 3. Restore UASS
if (fs.existsSync(uassBackup)) {
    fs.copyFileSync(uassBackup, path.join(targetDir, 'uass.png'));
    console.log('UASS restored');
}

// 4. Copy new logos
const files = fs.readdirSync(logosClientesDir);
const validExtensions = ['.png', '.jpg', '.jpeg', '.webp'];
const copiedFiles = [];

files.forEach(file => {
    const ext = path.extname(file).toLowerCase();
    if (validExtensions.includes(ext)) {
        fs.copyFileSync(path.join(logosClientesDir, file), path.join(targetDir, file));
        copiedFiles.push(file);
    }
});

console.log(`Copied ${copiedFiles.length} new logos.`);

// 5. Generate HTML
// Logic: 
// UASS (uass.png) -> 3rd/4th position.
// HL Tuning (hltuning.png) -> Keep if exists.

let logoList = [];

// Helper to find file in copiedFiles ignoring case or extension slightly? No, exact match from readdir.
// copierFiles contains filenames.

// Identify specific logos
const uassLogo = 'uass.png';
const hlLogo = copiedFiles.find(f => f.toLowerCase().includes('hltuning'));

// Remove specials from general pool
let generalLogos = copiedFiles.filter(f => f !== uassLogo && f !== hlLogo);

// Construct final list
// 1. Generic
if (generalLogos.length > 0) logoList.push(generalLogos.shift());
// 2. Generic
if (generalLogos.length > 0) logoList.push(generalLogos.shift());
// 3. HL Tuning
if (hlLogo) logoList.push(hlLogo);
// 4. UASS
if (fs.existsSync(path.join(targetDir, uassLogo))) logoList.push(uassLogo);

// Add remainders
logoList = logoList.concat(generalLogos);

// Generate HTML string
let html = '            <!-- Logos - Lote 1 -->\n';
const generateDiv = (filename) => {
    const name = path.basename(filename, path.extname(filename)).replace(/-/g, ' ').replace(/_/g, ' ');
    const isUass = filename.toLowerCase().includes('uass');
    const className = isUass ? 'logo-item uass-special' : 'logo-item';
    return `            <div class="${className}"><img src="img/logos/${filename}" alt="${name}" loading="lazy" width="150" height="auto"></div>`;
};

logoList.forEach(logo => html += generateDiv(logo) + '\n');

// Duplicate for infinite scroll
html += '\n            <!-- Duplicação para efeito infinito -->\n';
logoList.forEach(logo => html += generateDiv(logo) + '\n');

fs.writeFileSync(path.join(baseDir, 'logo_wall_snippet.html'), html, 'utf8');
console.log('HTML snippet generated.');
