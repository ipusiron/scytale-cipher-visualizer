const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const I18n = require(path.join(root, 'js/i18n.js'));
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const script = fs.readFileSync(path.join(root, 'js/script.js'), 'utf8');
const pure = fs.readFileSync(path.join(root, 'js/scytale-logic.js'), 'utf8');
// gフラグを付けるとlastIndexが残り、ループ内の.test()が交互にfalseになります。
const JAPANESE = /[぀-ヿ一-鿿]/;

test('日本語と英語で、キーの集合が同じ', () => {
    const ja = Object.keys(I18n.ja);
    const en = Object.keys(I18n.en);
    assert.ok(ja.length >= 80, `キーが少なすぎる: ${ja.length}`);
    assert.deepEqual(ja.filter(key => !(key in I18n.en)), [], '英語に無いキー');
    assert.deepEqual(en.filter(key => !(key in I18n.ja)), [], '日本語に無いキー');
});

test('差し込みの名前が、日本語と英語で一致する', () => {
    const holes = value => [...String(value).matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort().join(',');
    assert.deepEqual(Object.keys(I18n.ja).filter(key => holes(I18n.ja[key]) !== holes(I18n.en[key])), []);
});

test('index.html が指すキーは、すべて辞書にある', () => {
    const keys = new Set();
    for (const m of html.matchAll(/data-i18n(?:-[a-z-]+)?="([^"]+)"/g)) keys.add(m[1]);
    assert.ok(keys.size >= 35, `data-i18n が少なすぎる: ${keys.size}`);
    assert.deepEqual([...keys].filter(key => !(key in I18n.ja)), []);
});

test('スクリプトが呼ぶキーは、すべて辞書にある', () => {
    const keys = new Set();
    for (const m of script.matchAll(/\bt\(\s*'([\w.]+)'/g)) keys.add(m[1]);
    for (const m of script.matchAll(/'((?:rod|copy|msg|warn|matrix|brute|mode|theme|error|count|result)\.\w+)'/g)) {
        keys.add(m[1]);
    }
    for (const m of pure.matchAll(/'(error\.\w+)'/g)) keys.add(m[1]);
    assert.ok(keys.size >= 30, `呼び出しが少なすぎる: ${keys.size}`);
    assert.deepEqual([...keys].filter(key => !(key in I18n.ja)), []);
});

test('辞書に使われていないキーが残っていない', () => {
    // headのtitleとmetaは i18n.js の apply() が当てるので、そこだけ例外
    const inI18n = new Set(['app.title', 'app.description', 'app.keywords']);
    const source = html + script + pure;
    const unused = Object.keys(I18n.ja).filter(key => !inI18n.has(key) && !source.includes(key));
    assert.deepEqual(unused, []);
});

test('英語の辞書に、訳し忘れの日本語が残っていない', () => {
    // 言語の切り替えボタンだけは、相手の言語を出すのが正しい
    const expected = new Set(['app.langButton']);
    const left = Object.keys(I18n.en).filter(key => !expected.has(key) && JAPANESE.test(I18n.en[key]));
    assert.deepEqual(left, []);
});

test('t() は差し込みを埋め、知らないキーは黙って通さない', () => {
    assert.equal(I18n.t('rod.size', { rows: 3, cols: 4 }), '行数3→列数4（円柱4周分）');
    assert.equal(I18n.t('matrix.size', { rows: 3, cols: 4, used: 3 }), '全3行4列。文字が入る行は3行です。');
    assert.equal(I18n.t('brute.heading', { count: 6 }), '全鍵探索：異なる結果は6種類');
    assert.throws(() => I18n.t('no.such.key'), /Unknown message/);
    assert.equal(I18n.has('rod.size'), true);
    assert.equal(I18n.has('no.such.key'), false);
});

test('ロジックと画面のスクリプトが文言を直書きしていない', () => {
    // 文字列リテラルに和文が無いことを見る（和文コメントは残してよい）
    const literals = source => [...source.matchAll(/(['"`])(?:\\.|(?!\1)[\s\S])*?\1/g)].map(m => m[0]);
    for (const [name, source] of [['scytale-logic.js', pure], ['script.js', script]]) {
        const found = literals(source);
        assert.ok(found.length > 0, name);
        assert.deepEqual(found.filter(value => JAPANESE.test(value)), [], name);
    }
    assert.doesNotMatch(pure, /RangeError\('[^']*[぀-ヿ一-鿿]/);
});

test('子要素を持つ要素に data-i18n を付けていない', () => {
    const offenders = [];
    for (const m of html.matchAll(/<(\w+)[^>]*data-i18n="[^"]+"[^>]*>([\s\S]*?)<\/\1>/g)) {
        if (m[2].includes('<')) offenders.push(m[1] + ': ' + m[2].slice(0, 40));
    }
    assert.deepEqual(offenders, []);
});

test('noscript は両言語を併記する（JSが無いと切り替えられない）', () => {
    const noscript = html.match(/<noscript>([^<]+)<\/noscript>/)[1];
    assert.match(noscript, JAPANESE);
    assert.match(noscript, /JavaScript/);
    assert.match(noscript, /This tool requires JavaScript/);
});

test('状態は表示中の文言との一致で判定しない', () => {
    // 結果の有無・コピー中・テーマは、文言ではなく状態から組み立てる
    assert.doesNotMatch(script, /=== *'結果がここに表示されます'/);
    assert.doesNotMatch(script, /=== *'コピー/);
    assert.match(script, /resultState === null/);
    assert.match(script, /dataset\.copyState/);
    // 状態で変わる属性は apply() に上書きさせない
    assert.doesNotMatch(html, /themeToggleBtn[^>]*data-i18n/);
    assert.match(script, /function renderThemeButton/);
});

test('言語の保存は i18n.js だけが持ち、script.js はテーマだけを保存する', () => {
    const i18nSource = fs.readFileSync(path.join(root, 'js/i18n.js'), 'utf8');
    assert.match(i18nSource, /scytale-cipher-visualizer-language/);
    assert.doesNotMatch(script, /-language/);
    assert.doesNotMatch(pure, /localStorage/);
});

test('languagechange で表示中のものを訳し直す', () => {
    const handler = script.match(/addEventListener\('languagechange'[\s\S]*?\n {4}\}\);/);
    assert.ok(handler, 'languagechange の登録が無い');
    for (const name of ['renderThemeButton', 'renderMessage', 'renderIdentityWarning', 'renderRodStatus',
        'renderResult', 'renderCopyButton', 'renderMatrix', 'renderBruteForce', 'updateInputCounts']) {
        assert.ok(handler[0].includes(name + '()'), name);
    }
});

test('i18n.js を他のスクリプトより先に読み込む', () => {
    assert.ok(html.indexOf('src="js/i18n.js"') < html.indexOf('src="js/scytale-logic.js"'));
    assert.ok(html.indexOf('src="js/scytale-logic.js"') < html.indexOf('src="js/script.js"'));
});

test('README は日英を相互にリンクし、英語版が存在する', () => {
    const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
    const english = fs.readFileSync(path.join(root, 'README.en.md'), 'utf8');
    assert.match(readme, /^\[English\]\(README\.en\.md\) · 日本語$/m);
    assert.match(english, /^English · \[日本語\]\(README\.md\)$/m);
    // YAMLのHTMLコメントより後に置く（先頭に足すとreadme.test.jsが落ちる）
    assert.ok(readme.indexOf('-->') < readme.indexOf('[English](README.en.md)'));
    for (const name of ['i18n.js', 'README.en.md', 'i18n.test.js']) {
        assert.ok(readme.includes(name), name);
    }
});
