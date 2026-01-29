const fs = require('fs');
const path = require('path');

const filesToCheck = ['hltuning.png', 'tecnocor.png', 'alusiza.png'];
const dir = path.join(__dirname, 'img', 'logos');

filesToCheck.forEach(f => {
    const p = path.join(dir, f);
    try {
        if (fs.existsSync(p)) {
            const fd = fs.openSync(p, 'r');
            const buffer = Buffer.alloc(8);
            fs.readSync(fd, buffer, 0, 8, 0);
            fs.closeSync(fd);
            console.log(`${f}: Exists, Header: ${buffer.toString('hex')}`);
            // PNG header should be 89 50 4E 47 0D 0A 1A 0A
        } else {
            console.log(`${f}: Not Found`);
        }
    } catch (e) {
        console.log(`${f}: Error ${e.message}`);
    }
});
