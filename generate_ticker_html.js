const fs = require('fs');
const path = require('path');

const baseDir = __dirname;
const logosDir = path.join(baseDir, 'img', 'logos');

// Same map as robust script to ensure match
const renameMap = {
    'logohorizontal.png': 'tecnocor.png',
    'logo_sancristobal420pcombrillo.png': 'san-cristobal.png',
    'carnescampo92.png': 'carnes-campo.png',
    'soundpro.png': 'soundpro.png'
};

const validExtensions = ['.png', '.jpg', '.jpeg'];

if (!fs.existsSync(logosDir)) {
    console.error('Logos dir not found!');
    process.exit(1);
}

// Get files from DIRECTORY to be 100% sure what is there
const files = fs.readdirSync(logosDir);
let validFiles = files.filter(f => validExtensions.includes(path.extname(f).toLowerCase()));

// Remove backups or hidden
validFiles = validFiles.filter(f => !f.startsWith('.') && f !== 'uass_save.png');

// Sort/Order Logic
// UASS, HLTuning, MotoMorini
const uass = validFiles.find(f => f.includes('uass'));
const hltuning = validFiles.find(f => f.includes('hltuning'));
const motoMorini = validFiles.find(f => f.includes('morini'));

let general = validFiles.filter(f => f !== uass && f !== hltuning && f !== motoMorini);

let order = [];
if (general.length > 0) order.push(general.shift());
if (general.length > 0) order.push(general.shift());
if (hltuning) order.push(hltuning);
if (motoMorini) order.push(motoMorini);
if (uass) order.push(uass);
order = order.concat(general);

// Generate HTML
let html = '          <div class="ticker-track">\n';
const generateItem = (filename) => {
    const isUass = filename.includes('uass');
    const className = isUass ? 'logo-item uass-special' : 'logo-item';
    const altName = path.basename(filename, path.extname(filename)).replace(/-/g, ' ').toUpperCase();
    return `            <div class="${className}"><img src="img/logos/${filename}" alt="${altName}" loading="lazy" width="200" height="auto"></div>`;
};

// 3 Batches
html += '            <!-- Batch 1 -->\n';
order.forEach(l => html += generateItem(l) + '\n');
html += '\n            <!-- Batch 2 -->\n';
order.forEach(l => html += generateItem(l) + '\n');
html += '\n            <!-- Batch 3 -->\n';
order.forEach(l => html += generateItem(l) + '\n');

html += '          </div>';

fs.writeFileSync('ticker_block.html', html, 'utf8');
console.log('Generated ticker_block.html');
