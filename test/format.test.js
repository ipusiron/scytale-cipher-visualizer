const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const files = ['index.html', 'js/script.js', 'js/scytale-logic.js', 'css/style.css',
    ...fs.readdirSync(__dirname).filter(name => name.endsWith('.test.js')).map(name => `test/${name}`)];

for (const file of files) {
    test(`整形: ${file}`, t => {
        const source = fs.readFileSync(path.join(root, file), 'utf8');
        const lines = source.trimEnd().split(/\r?\n/);
        const max = Math.max(...lines.map(line => Array.from(line).length));
        t.diagnostic(`${lines.length}行、最長${max}文字`);
        assert.ok(max <= (file === 'index.html' ? 250 : 160), `${file}: ${max}`);
        assert.doesNotMatch(source, /[^\r\n\S]+\r?$/m, '末尾空白なし');
        const minimum = { 'css/style.css': 300, 'js/script.js': 200, 'js/scytale-logic.js': 80, 'index.html': 100 };
        if (minimum[file]) assert.ok(lines.length >= minimum[file]);
    });
}
