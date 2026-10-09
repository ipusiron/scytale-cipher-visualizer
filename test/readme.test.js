const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { encrypt, decrypt, bruteForce } = require('../js/scytale-logic.js');
const root = path.join(__dirname, '..');
const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');

test('READMEの暗号化表13例と全鍵探索表4例を再計算', () => {
    const examples = [...readme.matchAll(/^\| `([^`]+)` \| (\d+) \| `([^`]+)` \|$/gm)];
    assert.equal(examples.length, 13);
    for (const [, plain, rows, cipher] of examples) {
        assert.equal(encrypt(plain, Number(rows)), cipher);
        assert.equal(decrypt(cipher, Number(rows)), plain);
    }
    const searches = [...readme.matchAll(/^\| `([^`]+)` \| (\d+) \| ([\d, ]+) \| `([^`]+)` \|$/gm)];
    assert.equal(searches.length, 4);
    for (const [, cipher, count, rows, plain] of searches) {
        const search = bruteForce(cipher);
        assert.equal(search.uniqueCount, Number(count));
        assert.deepEqual(search.groups.find(group => group.plaintext === plain).rows, rows.split(',').map(Number));
    }
    assert.doesNotMatch(readme, /SMEESR_SCEARGTE|HOREL_LWDLO|HELOL_ORLDW/);
});

test('鍵空間の表を異なる文字の列から再計算', () => {
    const lengths = readme.match(/^\| 暗号文の文字数 \|(.+)\|$/m)[1].split('|').map(Number);
    const counts = readme.match(/^\| 異なる復号結果の数 \|(.+)\|$/m)[1].split('|').map(Number);
    assert.deepEqual(lengths, [6, 8, 10, 11, 14, 17, 20, 30, 50, 100]);
    assert.deepEqual(counts, [3, 4, 5, 4, 5, 6, 6, 7, 9, 9]);
    lengths.forEach((n, i) => {
        const cipher = Array.from({ length: n }, (_, j) => String.fromCodePoint(0x1000 + j)).join('');
        assert.equal(bruteForce(cipher).uniqueCount, counts[i]);
    });
});

test('画像参照・シリーズ表記・ライセンスが存在', () => {
    const images = [...readme.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)].map(m => m[1]).filter(p => !/^https?:/.test(p));
    assert.equal(images.length, 3);
    images.forEach(file => assert.ok(fs.existsSync(path.join(root, file)), file));
    assert.match(readme, /Day010 - 生成AIで作るセキュリティツール100/);
    assert.match(readme, /https:\/\/akademeia\.info\/\?page_id=42163/);
    assert.ok(fs.existsSync(path.join(root, 'LICENSE')));
});

test('YAMLのHTMLコメント・キー順・ブロック形式・固定値を保持', () => {
    const match = readme.match(/^<!--\r?\n---\r?\n([\s\S]+?)\r?\n---\r?\n-->/);
    assert.ok(match);
    const yaml = match[1];
    const keys = [...yaml.matchAll(/^(\w+):/gm)].map(m => m[1]);
    assert.deepEqual(keys, ['id', 'slug', 'title', 'subtitle_ja', 'subtitle_en', 'description_ja', 'description_en',
        'category_ja', 'category_en', 'difficulty', 'tags', 'repo_url', 'demo_url', 'hub']);
    for (const key of ['category_ja', 'category_en', 'tags']) {
        assert.match(yaml, new RegExp(`^${key}:\\r?\\n  - `, 'm'));
    }
    const fixed = {
        id: 'day010', slug: 'scytale-cipher-visualizer', difficulty: '1', hub: 'true',
        repo_url: 'https://github.com/ipusiron/scytale-cipher-visualizer',
        demo_url: 'https://ipusiron.github.io/scytale-cipher-visualizer/'
    };
    for (const [key, expected] of Object.entries(fixed)) {
        const value = yaml.match(new RegExp(`^${key}: (.+)$`, 'm'))[1].replace(/^"|"$/g, '').trim();
        assert.equal(value, expected);
    }
    assert.match(yaml, /  - 転置式暗号/);
    for (const tag of ['visualization', 'educational', 'scytale-cipher', 'transposition-cipher', 'brute-force']) {
        assert.ok(yaml.includes(`  - ${tag}`));
    }
});

test('ユースケースの「このツールならではの使い方」の例を実ロジックで再計算（日英）', () => {
    const readmeEn = fs.readFileSync(path.join(root, 'README.en.md'), 'utf8');
    const cipher = encrypt('WE_ARE_DISCOVERED', 4);
    assert.equal(cipher, 'WECEE_OD_DVAIERSR');
    const damaged = '###' + cipher.slice(3);
    const plain = decrypt(damaged, 4);
    const hit = [...plain].map((ch, i) => (ch === '#' ? i + 1 : 0)).filter(Boolean);
    assert.deepEqual(hit, [1, 6, 11]);
    assert.equal(Math.ceil('WE_ARE_DISCOVERED'.length / 4), 5);
    assert.ok(readme.includes('復号後に壊れているのは1・6・11文字目で、列数と同じ5文字おき'));
    assert.ok(readmeEn.includes('the damaged ones are the 1st, 6th and 11th characters, every 5 characters'));
    assert.equal(encrypt('HELLO_WORLD', 3), 'HORE_LLWDLO');
    for (const text of [readme, readmeEn]) assert.ok(text.includes('HELLO_WORLD') && text.includes('HORE_LLWDLO'));
});
