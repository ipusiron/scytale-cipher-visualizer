const test = require('node:test');
const assert = require('node:assert/strict');
const L = require('../js/scytale-logic.js');

const examples = [
    ['HELLO_WORLD', 3, 'HORE_LLWDLO'],
    ['SECRET_MESSAGE', 4, 'SEEGETSEC_SRMA'],
    ['ATTACK_AT_DAWN', 5, 'AA__WTCADNTKTA'],
    ['WE_ARE_DISCOVERED', 4, 'WECEE_OD_DVAIERSR'],
    ['ABCDEFGHIJ', 3, 'AEIBFJCGDH'],
    ['ABCD', 3, 'ACBD'],
    ['日本語のテスト文字列', 3, '日テ字本ス列語トの文'],
    ['😀😃😄😁ABCD', 3, '😀😁C😃AD😄B'],
    ['🔐SECRET🔑', 3, '🔐CTSR🔑EE'],
    ['  SPACED  TEXT  ', 3, ' EX DTS  P  ATCE'],
    ['A B C D', 2, 'AC  BD '],
    ['AB', 5, 'AB'],
    ['ABCDE', 10, 'ABCDE']
];

for (const [plain, rows, cipher] of examples) {
    test(`既知解答と逆写像: ${JSON.stringify(plain)}, 行数${rows}`, () => {
        assert.equal(L.encrypt(plain, rows), cipher);
        assert.equal(L.decrypt(cipher, rows), plain);
    });
}

test('全558通りで往復一致（長さ1〜62、行数2〜10）', () => {
    const pool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let count = 0;
    for (let n = 1; n <= 62; n++) {
        for (let rows = 2; rows <= 10; rows++) {
            const plain = pool.slice(0, n);
            assert.equal(L.decrypt(L.encrypt(plain, rows), rows), plain, `${n}/${rows}`);
            count++;
        }
    }
    assert.equal(count, 558);
});

test('日本語・絵文字を含む全432通りで往復一致', () => {
    const pool = Array.from('AB日本語😀🔐😃全角　 空白xyz'.repeat(3));
    let count = 0;
    for (let n = 1; n <= 48; n++) {
        for (let rows = 2; rows <= 10; rows++) {
            const plain = pool.slice(0, n).join('');
            assert.equal(L.decrypt(L.encrypt(plain, rows), rows), plain);
            count++;
        }
    }
    assert.equal(count, 432);
});

test('sanitizeは制御文字を除去し前後の半角・全角空白を保持', () => {
    assert.equal(L.sanitize('  \t日\n本\r語\x00\x7f　 '), '  日本語　 ');
    assert.equal(L.sanitize('   '), '   ');
});

test('入力上限はコードポイント10000文字、行数は整数2〜10', () => {
    assert.equal(L.MAX_LENGTH, 10000);
    assert.equal(L.validate('😀'.repeat(10000), 2), null);
    // validateは文言を持たず、辞書のキーと差し込み値だけを返します。
    assert.deepEqual(L.validate('😀'.repeat(10001), 2), { key: 'error.tooLong', params: { max: 10000 } });
    for (const rows of [1, 11, 2.5, NaN, Infinity, '3']) {
        assert.deepEqual(L.validate('A', rows), { key: 'error.rows', params: {} });
        assert.throws(() => L.encrypt('A', rows), { name: 'RangeError', message: 'error.rows' });
    }
    assert.deepEqual(L.validate('', 2), { key: 'error.empty', params: {} });
    assert.equal(L.validate(' ', 2), null);
    assert.equal(L.encrypt('', 2), '');
    assert.equal(L.decrypt('', 2), '');
    assert.equal(L.decrypt(L.encrypt('😀'.repeat(10000), 10), 10), '😀'.repeat(10000));
});

test('矩形の空セル・列長・埋字の保持', () => {
    assert.deepEqual(L.buildEncryptMatrix('ABCDE', 3), [['A', 'B'], ['C', 'D'], ['E', '']]);
    assert.deepEqual(L.buildDecryptMatrix('ACEBD', 3), [['A', 'B'], ['C', 'D'], ['E', '']]);
    assert.deepEqual(L.colLengths(5, 3), [3, 2]);
    assert.deepEqual(L.colLengths(2, 5), [2]);
    assert.deepEqual(L.colLengths(0, 3), []);
    assert.equal(L.encrypt('ABCDE', 3, ['X']), 'ACEBDX');
    assert.equal(L.decrypt('ACEBDX', 3), 'ABCDEX');
});

test('恒等・実使用行数の境界', () => {
    for (let rows = 2; rows <= 10; rows++) {
        assert.equal(L.isIdentity(rows, rows), true);
        assert.equal(L.isIdentity(rows + 1, rows), false);
        assert.equal(L.usedRows(rows, rows), rows);
        assert.equal(L.usedRows(rows + 1, rows), Math.ceil((rows + 1) / 2));
    }
    assert.equal(L.usedRows(0, 3), 0);
    assert.equal(L.usedRows(1, 10), 1);
    assert.equal(L.isIdentity(0, 3), false);
});

test('埋字は234以上を棄却してA〜Zから選択', () => {
    const source = { getRandomValues(bytes) {
        bytes.fill(255);
        bytes.set([234, 255, 0, 25, 26, 233]);
        return bytes;
    } };
    assert.deepEqual(L.randomPadChars(4, source), ['A', 'Z', 'A', 'Z']);
    assert.deepEqual(L.randomPadChars(0, source), []);
    assert.match(L.randomPadChars(100).join(''), /^[A-Z]{100}$/);
    assert.throws(() => L.randomPadChars(-1), { name: 'RangeError', message: 'error.padCount' });
});
