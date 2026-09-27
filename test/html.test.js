const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const script = fs.readFileSync(path.join(__dirname, '../js/script.js'), 'utf8');

test('CSP・referrer・viewport・noscript・faviconと安全な描画', () => {
    const csp = html.match(/<meta\s+http-equiv="Content-Security-Policy"\s+content="([^"]+)"/)[1];
    for (const directive of ["script-src 'self'", "style-src 'self'", "object-src 'none'", "base-uri 'self'", "form-action 'self'"]) {
        assert.ok(csp.includes(directive));
    }
    assert.doesNotMatch(csp, /unsafe-inline|frame-ancestors/);
    assert.match(html, /name="viewport"/);
    assert.match(html, /name="referrer" content="no-referrer"/);
    assert.match(html, /<noscript>[^<]+<\/noscript>/);
    assert.match(html, /rel="icon" href="assets\/favicon.svg"/);
    assert.doesNotMatch(html, /\s(?:style|on\w+)\s*=/i);
    assert.doesNotMatch(script, /innerHTML|alert\(|Math\.random\(|style\.cssText|escapeHtml|function encrypt\(/);
});

test('古典スクリプトを正しい順でdefer読み込み', () => {
    const scripts = [...html.matchAll(/<script\b([^>]*)>/g)];
    assert.equal(scripts.length, 3);
    assert.deepEqual(scripts.map(m => m[1].match(/src="([^"]+)"/)[1]),
        ['js/i18n.js', 'js/scytale-logic.js', 'js/script.js']);
    for (const script of scripts) {
        assert.match(script[1], /\bdefer\b/);
        assert.doesNotMatch(script[1], /type="module"/);
    }
});

test('操作ID・フォーム名・タブARIA・ライブ通知・外部リンク・見出し', () => {
    for (const id of [
        'encryptInputText', 'decryptInputText', 'encryptRows', 'decryptRows', 'fillPadding',
        'encryptExecuteBtn', 'decryptExecuteBtn', 'syncCipherBtn', 'bruteForceBtn', 'copyBtn',
        'matrixDisplay', 'resultText', 'scytaleStatus', 'themeToggleBtn', 'langToggle'
    ]) assert.ok(html.includes(`id="${id}"`), id);
    for (const id of ['encryptInputText', 'decryptInputText', 'encryptRows', 'decryptRows', 'fillPadding']) {
        assert.ok(html.includes(`for="${id}"`));
    }
    assert.match(html, /role="tablist"/);
    assert.equal((html.match(/role="tab"/g) || []).length, 2);
    assert.equal((html.match(/role="tabpanel"/g) || []).length, 2);
    assert.equal((html.match(/aria-selected="(?:true|false)"/g) || []).length, 2);
    for (const id of ['resultText', 'scytaleStatus', 'operationMessage']) {
        assert.match(html, new RegExp(`id="${id}"[^>]*aria-live="polite"`));
    }
    const links = [...html.matchAll(/<a\b[^>]*href="https?:[^>]+>/g)];
    assert.equal(links.length, 2);
    for (const [link] of links) assert.match(link, /rel="noopener noreferrer"/);
    const headings = [...html.matchAll(/<h([1-6])\b/g)].map(m => Number(m[1]));
    assert.equal(headings[0], 1);
    headings.slice(1).forEach((level, i) => assert.ok(level <= headings[i] + 1));
});
