const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'js/theme-init.js'), 'utf8');

// theme-init.js を、保存値と OS 設定を差し替えた仮の window で動かし、<html> の data-theme を返します。
function run({ saved = null, prefersDark = false, storageThrows = false } = {}) {
    const attrs = {};
    const window = {
        localStorage: { getItem: () => { if (storageThrows) throw new Error('blocked'); return saved; } },
        matchMedia: () => ({ matches: prefersDark }),
        document: { documentElement: { setAttribute: (name, value) => { attrs[name] = value; } } }
    };
    vm.runInNewContext(source, { window });
    return attrs['data-theme'];
}

test('保存値がなければ OS の設定に従う', () => {
    assert.equal(run({ prefersDark: true }), 'dark');
    assert.equal(run({ prefersDark: false }), 'light');
});

test('保存値は OS の設定より優先する', () => {
    assert.equal(run({ saved: 'light', prefersDark: true }), 'light');
    assert.equal(run({ saved: 'dark', prefersDark: false }), 'dark');
});

test('想定外の保存値は無視して OS の設定に従う', () => {
    assert.equal(run({ saved: 'blue', prefersDark: true }), 'dark');
    assert.equal(run({ saved: 'blue', prefersDark: false }), 'light');
});

test('localStorage が使えなくても落ちず、OS の設定に従う', () => {
    assert.equal(run({ storageThrows: true, prefersDark: false }), 'light');
    assert.equal(run({ storageThrows: true, prefersDark: true }), 'dark');
});

test('index.html の <head> で、stylesheet のあとに同期で読み込む', () => {
    const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
    const head = html.slice(0, html.indexOf('</head>'));
    assert.ok(head.includes('<script src="js/theme-init.js"></script>'), '<head> に theme-init.js がない');
    assert.ok(head.indexOf('css/style.css') < head.indexOf('js/theme-init.js'));
});
