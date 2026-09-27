/** スキュタレー暗号の純粋ロジック（文字の単位はコードポイント）。 */
(function () {
    'use strict';

    function sanitize(input) {
        return input.replace(/[\x00-\x1F\x7F]/g, '');
    }

    // 文言は持たず、辞書のキーと差し込み値だけを返します（表示の直前にi18nで訳します）。
    const MAX_LENGTH = 10000;

    function validate(text, rows) {
        if (Array.from(text).length > MAX_LENGTH) {
            return { key: 'error.tooLong', params: { max: MAX_LENGTH } };
        }
        if (!Number.isInteger(rows) || rows < 2 || rows > 10) {
            return { key: 'error.rows', params: {} };
        }
        if (text.length === 0) {
            return { key: 'error.empty', params: {} };
        }
        return null;
    }

    function checkRows(rows) {
        if (!Number.isInteger(rows) || rows < 2 || rows > 10) {
            throw new RangeError('error.rows');
        }
    }

    function buildEncryptMatrix(text, rows, padChars) {
        checkRows(rows);
        const chars = Array.from(text);
        const cols = Math.ceil(chars.length / rows);
        const padding = padChars === undefined ? [] : Array.from(padChars);
        const matrix = Array.from({ length: rows }, () => Array(cols).fill(''));
        let paddingIndex = 0;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const index = r * cols + c;
                matrix[r][c] = index < chars.length ? chars[index] : (padding[paddingIndex++] ?? '');
            }
        }
        return matrix;
    }

    function encrypt(text, rows, padChars) {
        const matrix = buildEncryptMatrix(text, rows, padChars);
        const result = [];
        for (let c = 0; c < matrix[0].length; c++) {
            for (let r = 0; r < rows; r++) {
                result.push(matrix[r][c]);
            }
        }
        return result.join('');
    }

    function buildDecryptMatrix(cipher, rows) {
        checkRows(rows);
        const chars = Array.from(cipher);
        const cols = Math.ceil(chars.length / rows);
        const matrix = Array.from({ length: rows }, () => Array(cols).fill(''));
        let index = 0;
        for (let c = 0; c < cols; c++) {
            for (let r = 0; r < rows; r++) {
                // 暗号化時に存在したセルだけへ、列方向に文字を戻します。
                if (r * cols + c < chars.length) {
                    matrix[r][c] = chars[index++];
                }
            }
        }
        return matrix;
    }

    function decrypt(cipher, rows) {
        return buildDecryptMatrix(cipher, rows).flat().join('');
    }

    function isIdentity(n, rows) {
        checkRows(rows);
        return Math.ceil(n / rows) === 1;
    }

    function usedRows(n, rows) {
        checkRows(rows);
        return n === 0 ? 0 : Math.min(rows, Math.ceil(n / Math.ceil(n / rows)));
    }

    function colLengths(n, rows) {
        checkRows(rows);
        const cols = Math.ceil(n / rows);
        return Array.from({ length: cols }, (_, c) => Math.min(rows, Math.ceil((n - c) / cols)));
    }

    function bruteForce(cipher) {
        const n = Array.from(cipher).length;
        const results = [];
        const groups = [];
        for (let rows = 2; rows <= 10; rows++) {
            const plaintext = decrypt(cipher, rows);
            results.push({ rows, cols: Math.ceil(n / rows), plaintext, isIdentity: isIdentity(n, rows) });
            const group = groups.find(item => item.plaintext === plaintext);
            if (group) {
                group.rows.push(rows);
            } else {
                groups.push({ plaintext, rows: [rows] });
            }
        }
        return { results, groups, uniqueCount: groups.length };
    }

    function randomPadChars(count, randomSource = globalThis.crypto) {
        if (!Number.isInteger(count) || count < 0 || count > MAX_LENGTH) {
            throw new RangeError('error.padCount');
        }
        const result = [];
        const bytes = new Uint8Array(32);
        while (result.length < count) {
            randomSource.getRandomValues(bytes);
            for (const value of bytes) {
                // 234 = 26 × 9。余った22値は捨て、剰余による偏りを防ぎます。
                if (value < 234) {
                    result.push(String.fromCharCode(65 + value % 26));
                    if (result.length === count) break;
                }
            }
        }
        return result;
    }

    const ScytaleLogic = {
        MAX_LENGTH, sanitize, validate, encrypt, decrypt, buildEncryptMatrix, buildDecryptMatrix,
        isIdentity, usedRows, colLengths, bruteForce, randomPadChars
    };
    globalThis.ScytaleLogic = ScytaleLogic;
    if (typeof module === 'object' && module.exports) module.exports = ScytaleLogic;
})();
