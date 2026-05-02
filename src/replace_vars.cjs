const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.resolve(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('d:\\Documentos\\Compiladores\\congreso-2026-umg\\congreso-umg-frontend\\src');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    content = content.replace(/var\(--blue\)/g, 'var(--accent-primary)');
    content = content.replace(/var\(--blue-light\)/g, 'var(--accent-light)');
    content = content.replace(/var\(--blue-dark\)/g, 'var(--accent-dark)');
    
    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated: ${file}`);
    }
});
