const fs = require('fs');
const path = require('path');

const baseDir = __dirname;
const logosDir = path.join(baseDir, 'img', 'logos');
const logosClientesDir = path.join(baseDir, 'logos_clientes');
const indexHtmlPath = path.join(baseDir, 'index.html');

console.log('Starting Clean One-Way Restore...');

// 1. Rename existing Directory to avoid locks
if (fs.existsSync(logosDir)) {
    const trashName = `logos_trash_${Date.now()}`;
    const trashPath = path.join(baseDir, 'img', trashName);
    try {
        fs.renameSync(logosDir, trashPath);
        console.log(`Moved old img/logos to ${trashName}`);
    } catch (e) {
        console.error('Could not move old folder, trying to delete content...');
        const files = fs.readdirSync(logosDir);
        for (const file of files) {
            try { fs.unlinkSync(path.join(logosDir, file)); } catch (err) { }
        }
    }
}

// Ensure new dir exists
if (!fs.existsSync(logosDir)) {
    fs.mkdirSync(logosDir, { recursive: true });
}

// 2. Map & Copy
const renameMap = {
    'logohorizontal.png': 'tecnocor.png',
    'logo_sancristobal420pcombrillo.png': 'san-cristobal.png',
    'carnescampo92.png': 'carnes-campo.png',
    // soundpro is fine as is, but ensuring lowercase match
};

const processedFiles = [];
const validExtensions = ['.png', '.jpg', '.jpeg'];

const sourceFiles = fs.readdirSync(logosClientesDir);

sourceFiles.forEach(file => {
    const lowerName = file.toLowerCase();

    // Explicit skips
    if (lowerName === 'carnescampo9.png') return;

    let finalName = lowerName; // default to lowercase

    // Map check
    if (renameMap[lowerName]) {
        finalName = renameMap[lowerName];
    }

    // Copy
    const srcPath = path.join(logosClientesDir, file);
    const destPath = path.join(logosDir, finalName);

    // Sanity check extension
    const ext = path.extname(finalName);
    if (!validExtensions.includes(ext)) return;

    try {
        fs.copyFileSync(srcPath, destPath);
        processedFiles.push(finalName);
    } catch (e) {
        console.error(`Failed to copy ${file}:`, e.message);
    }
});

console.log(`Copied ${processedFiles.length} logos.`);

// 3. Ordering
const uass = processedFiles.find(f => f.includes('uass'));
const hltuning = processedFiles.find(f => f.includes('hltuning'));
const motoMorini = processedFiles.find(f => f.includes('morini'));

let general = processedFiles.filter(f => f !== uass && f !== hltuning && f !== motoMorini);

let tickerOrder = [];
if (general.length > 0) tickerOrder.push(general.shift());
if (general.length > 0) tickerOrder.push(general.shift());
if (hltuning) tickerOrder.push(hltuning);
if (motoMorini) tickerOrder.push(motoMorini);
if (uass) tickerOrder.push(uass);
tickerOrder = tickerOrder.concat(general);

// 4. Generate HTML
let html = '          <div class="ticker-track">\n';

const generateItem = (filename) => {
    const isUass = filename.includes('uass');
    const className = isUass ? 'logo-item uass-special' : 'logo-item';
    const altName = path.basename(filename, path.extname(filename)).replace(/-/g, ' ').toUpperCase();
    // Use timestamp to force cache bust
    const v = Date.now();
    return `            <div class="${className}"><img src="img/logos/${filename}?v=${v}" alt="${altName}" loading="lazy" width="200" height="auto"></div>`;
};

// 3 Batches
const batches = [1, 2, 3];
batches.forEach(b => {
    html += `            <!-- Batch ${b} -->\n`;
    tickerOrder.forEach(l => html += generateItem(l) + '\n');
    html += '\n';
});
html += '          </div>';


// 5. Inject HTML
let indexContent = fs.readFileSync(indexHtmlPath, 'utf8');
const startTag = '<div class="ticker-track">';
// We will look for the container div "logo-ticker" and replace its inner HTML completely
// Or robustly find lines again

const lines = indexContent.split(/\r?\n/);
let startIdx = -1;
let endIdx = -1;

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('class="ticker-track"')) {
        startIdx = i;
    }
    if (startIdx !== -1 && i > startIdx) {
        // Find the CLOSING of ticker-track.
        // It should match indentation of startIdx if formatted, OR be the first </div> after logos
        // Since we are writing cleaner HTML key: </div> that closes ticker-track

        // Let's assume the block ends when we see a line that is JUST </div> followed by another </div> (ticker close)
        // OR simply finding the block end.
        if (lines[i].trim() === '</div>') {
            // Peek next
            if (lines[i + 1] && lines[i + 1].trim() === '</div>') {
                endIdx = i;
                break;
            }
        }
    }
}

if (startIdx !== -1 && endIdx !== -1) {
    console.log(`Replacing HTML lines ${startIdx + 1} to ${endIdx + 1}`);
    const head = lines.slice(0, startIdx);
    const tail = lines.slice(endIdx + 1);
    const newContent = head.join('\n') + '\n' + html + '\n' + tail.join('\n');
    fs.writeFileSync(indexHtmlPath, newContent, 'utf8');
    console.log('✓ index.html updated.');
} else {
    console.error('! Failed to find ticker insertion point in index.html');
}
