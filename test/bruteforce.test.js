const test = require('node:test');
const assert = require('node:assert/strict');
const { bruteForce } = require('../js/scytale-logic.js');

const cases = [
    ['HORE_LLWDLO', 4, [
        [[2], 'HR_LDOOELWL'], [[3], 'HELLO_WORLD'],
        [[4, 5], 'H_DOLLRLOEW'], [[6, 7, 8, 9, 10], 'HLOWRDEL_OL']
    ]],
    ['AA__WTCADNTKTA', 5, [[[5, 6], 'ATTACK_AT_DAWN']]],
    ['WECEE_OD_DVAIERSR', 6, [[[4], 'WE_ARE_DISCOVERED']]],
    ['ACEBDF', 3, [[[3, 4, 5], 'ABCDEF'], [[6, 7, 8, 9, 10], 'ACEBDF']]]
];

for (const [cipher, expectedCount, knownGroups] of cases) {
    test(`全鍵探索: ${cipher}`, () => {
        const { results, groups, uniqueCount } = bruteForce(cipher);
        assert.equal(results.length, 9);
        assert.deepEqual(results.map(item => item.rows), [2, 3, 4, 5, 6, 7, 8, 9, 10]);
        assert.equal(uniqueCount, expectedCount);
        assert.equal(groups.length, expectedCount);
        assert.equal(new Set(results.map(item => item.plaintext)).size, expectedCount);
        assert.equal(groups.flatMap(group => group.rows).length, 9);
        for (const [rows, plaintext] of knownGroups) {
            assert.deepEqual(groups.find(group => group.plaintext === plaintext).rows, rows);
        }
        for (const item of results) {
            assert.equal(item.cols, Math.ceil(Array.from(cipher).length / item.rows));
            assert.equal(item.isIdentity, item.cols === 1);
            assert.ok(groups.some(group => group.plaintext === item.plaintext && group.rows.includes(item.rows)));
        }
    });
}

test('空文字・単一文字・空白・絵文字も同じ結果でグループ化', () => {
    assert.equal(bruteForce('').uniqueCount, 1);
    assert.equal(bruteForce('😀').uniqueCount, 1);
    assert.equal(bruteForce('      ').uniqueCount, 1);
});
