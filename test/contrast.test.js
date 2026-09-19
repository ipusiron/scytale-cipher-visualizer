const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const css = fs.readFileSync(path.join(__dirname, '../css/style.css'), 'utf8');

function variables(selector) {
    const block = css.match(selector);
    assert.ok(block, 'テーマの変数ブロックが存在');
    return Object.fromEntries([...block[1].matchAll(/--([\w-]+):\s*(#[\da-f]{6});/gi)].map(m => [m[1], m[2]]));
}

function luminance(hex) {
    const rgb = hex.slice(1).match(/../g).map(value => parseInt(value, 16) / 255);
    const linear = rgb.map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
    return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
}

function contrast(a, b) {
    const values = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (values[0] + 0.05) / (values[1] + 0.05);
}

const pairs = [
    ...Array.from({ length: 8 }, (_, i) => ['row-fg', `row-${i}`]),
    ['text', 'bg'], ['text', 'surface'], ['text', 'surface-2'],
    ['muted', 'bg'], ['muted', 'surface'], ['muted', 'surface-2'],
    ['accent', 'surface'], ['accent', 'surface-2'], ['accent-text', 'accent'],
    ['header-fg', 'header-cell'], ['highlight-fg', 'highlight'], ['pad-fg', 'pad'],
    ['rod-fg', 'rod'], ['rod-area-fg', 'rod-area'], ['result-fg', 'result-bg']
];

for (const [theme, selector] of [
    ['light', /^:root\s*\{([^}]+)\}/m],
    ['dark', /:root\[data-theme="dark"\]\s*\{([^}]+)\}/]
]) {
    const colors = variables(selector);
    for (const [foreground, background] of pairs) {
        test(`${theme}: ${foreground} / ${background} >= 4.5:1`, t => {
            assert.ok(colors[foreground] && colors[background]);
            const ratio = contrast(colors[foreground], colors[background]);
            t.diagnostic(`${ratio.toFixed(2)}:1`);
            assert.ok(ratio >= 4.5, String(ratio));
        });
    }
}

test('OSダーク設定と手動ダーク設定の色が一致', () => {
    assert.deepEqual(variables(/:root:not\(\[data-theme="light"\]\)\s*\{([^}]+)\}/),
        variables(/:root\[data-theme="dark"\]\s*\{([^}]+)\}/));
    assert.match(css, /@media\s*\(prefers-color-scheme: dark\)/);
});
