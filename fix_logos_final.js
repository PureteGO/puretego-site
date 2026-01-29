const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const baseDir = __dirname;
const logosDir = path.join(baseDir, 'img', 'logos');
const logosClientesDir = path.join(baseDir, 'logos_clientes');

console.log(`Working in: ${baseDir}`);

// 1. Clean
if (fs.existsSync(logosDir)) {
    try { fs.rmSync(logosDir, { recursive: true, force: true }); } catch (e) { }
}
if (!fs.existsSync(logosDir)) fs.mkdirSync(logosDir);

// 2. Process Files
const sourceFiles = fs.readdirSync(logosClientesDir);
const validExtensions = ['.png', '.jpg', '.jpeg'];

const sanitize = (name) => name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-\.]/g, '');

let processedLogos = [];

sourceFiles.forEach(file => {
    // SKIP old logo
    if (file === 'carnescampo9.png') return;

    const ext = path.extname(file).toLowerCase();
    if (validExtensions.includes(ext)) {
        const nameNoExt = path.basename(file, ext);
        const cleanName = sanitize(nameNoExt);
        const finalFilename = `${cleanName}${ext}`;
        const destPath = path.join(logosDir, finalFilename);
        const sourcePath = path.join(logosClientesDir, file);

        try {
            fs.copyFileSync(sourcePath, destPath);
            processedLogos.push(finalFilename);
        } catch (e) {
            console.error(`Failed to copy ${file}:`, e);
        }
    }
});

// 3. UASS Handling
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
// Fuzzy match since we lowercased everything
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

console.log(`Total Unique Logos: ${finalOrder.length}`);

// 5. Generate HTML (3 Loops: Original + Copy 1 + Copy 2)
let html = '          <div class="ticker-track">\n';
const generateItem = (filename) => {
    const isUass = filename.includes('uass');
    const className = isUass ? 'logo-item uass-special' : 'logo-item';
    const altName = path.basename(filename, path.extname(filename)).replace(/-/g, ' ').toUpperCase();
    return `            <div class="${className}"><img src="img/logos/${filename}" alt="${altName}" loading="lazy" width="150" height="auto"></div>`;
};

// Loop 1
html += '            <!-- Logos - Batch 1 -->\n';
finalOrder.forEach(logo => html += generateItem(logo) + '\n');
// Loop 2
html += '\n            <!-- Logos - Batch 2 -->\n';
finalOrder.forEach(logo => html += generateItem(logo) + '\n');
// Loop 3
html += '\n            <!-- Logos - Batch 3 -->\n';
finalOrder.forEach(logo => html += generateItem(logo) + '\n');

html += '          </div>';

fs.writeFileSync(path.join(baseDir, 'logo_wall_final.html'), html, 'utf8');

// 6. Update index.html
const indexHtmlPath = path.join(baseDir, 'index.html');
let indexContent = fs.readFileSync(indexHtmlPath, 'utf8');

// Robust line-based search
const lines = indexContent.split(/\r?\n/);
let startLineIdx = -1;
let endLineIdx = -1;

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('class="ticker-track"')) {
        startLineIdx = i;
    }
    // We want the closing div of ticker-track
    if (startLineIdx !== -1 && i > startLineIdx) {
        const line = lines[i].trim();
        // The closing div of ticker-track is inside logo-ticker
        // We look for </div> followed by another </div> (closing logo-ticker)
        if (line === '</div>' && lines[i + 1] && lines[i + 1].trim() === '</div>') {
            endLineIdx = i;
            break;
        }
    }
}

if (startLineIdx !== -1 && endLineIdx !== -1) {
    console.log(`Found content at lines ${startLineIdx + 1}-${endLineIdx + 1}`);
    const pre = lines.slice(0, startLineIdx).join('\n');
    const post = lines.slice(endLineIdx + 1).join('\n');
    const newContent = pre + '\n' + html + '\n' + post;
    fs.writeFileSync(indexHtmlPath, newContent, 'utf8');
    console.log('index.html updated successfully.');
} else {
    console.error(`Block finding failed. Start: ${startLineIdx}, End: ${endLineIdx}`);
}

console.log('Done.');
