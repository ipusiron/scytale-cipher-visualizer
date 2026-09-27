/** 日本語と英語の文言。画面側のスクリプトは言語ごとの文字列を持たない。 */
(function () {
    'use strict';

    const ja = {
        'app.title': 'スキュタレー暗号ビジュアライザー - Scytale Cipher Visualizer',
        'app.description': '古代スパルタで使われたスキュタレー暗号を視覚的に学習できる教育ツール',
        'app.keywords': '暗号, 古典暗号, スキュタレー, 教育, セキュリティ, IPUSIRON',
        'app.h1': 'スキュタレー暗号ビジュアライザー',
        'app.h1sub': '（Scytale Cipher Visualizer）',
        'app.subtitle': '古代スパルタの転置暗号を体験しよう',
        'app.langButton': 'English',
        'app.langAria': '言語を切り替える',
        'theme.toDark': 'ダークモードに切り替える',
        'theme.toLight': 'ライトモードに切り替える',
        'intro.heading': 'スキュタレー暗号とは？',
        'intro.line1':
            '古代スパルタで使われた転置暗号です。円柱（スキュタレー）に紐を巻いて文字を書き、紐をほどくと暗号文になります。',
        'intro.strong': '重要：行数 = 円柱の太さ',
        'intro.line2':
            ' - 行数が大きいほど太い円柱を使った暗号になります。本ツールでは、異なる行数でも列数が同じなら復号結果は同じです。',
        'tabs.aria': '暗号化と復号',
        'tab.encrypt': '🔒 暗号化',
        'tab.decrypt': '🔓 復号',
        'mode.encrypt': '暗号化',
        'mode.decrypt': '復号',
        'encrypt.textLabel': '平文テキスト',
        'encrypt.placeholder': '暗号化したい文字列を入力してください\n例: HELLO_WORLD',
        'encrypt.rowsHint': '数値が大きいほど太い円柱になります',
        'encrypt.run': '🔒 暗号化実行',
        'rows.label': '行数（鍵）= 円柱の太さ',
        'padding.label': '埋字',
        'padding.checkbox': 'ランダム文字で埋める',
        'decrypt.textLabel': '暗号文',
        'decrypt.placeholder': '復号したい暗号文を入力してください\n例: HORE_LLWDLO',
        'decrypt.rowsHint': '暗号化時と同じ行数を指定してください',
        'decrypt.run': '🔓 復号実行',
        'sync.label': '暗号文の同期',
        'sync.button': '📋 暗号化結果を取得',
        'sync.hint': '暗号化タブの結果を自動で入力します',
        'brute.button': '🔎 全行数を試す',
        'brute.heading': '全鍵探索：異なる結果は{count}種類',
        'brute.caption': '行数2〜10の復号候補',
        'brute.colRows': '行数',
        'brute.colCols': '列数',
        'brute.colPlain': '復号結果',
        'brute.colAction': '操作',
        'brute.useRows': 'この行数で復号する',
        'brute.useRowsAria': '行数{rows}で復号する',
        'brute.groups': '同じ結果の行数グループ：{list}',
        'brute.groupSeparator': ' ／ ',
        'brute.note':
            '行数は2〜10の9通りだが、実質の鍵は列数（＝ceil(文字数÷行数)）なので、異なる結果は{count}種類しかない',
        'rod.initial':
            '古代スパルタのスキュタレー（円柱）- 行数 = 円柱の太さ（行数を変更すると太さが変わります）',
        'rod.encrypting': '🔒 暗号化中: 紐を円柱に巻いています...',
        'rod.decrypting': '🔓 復号中: 紐を円柱からほどいています...',
        'rod.done': '✅ 処理完了！マトリクスと結果をご確認ください',
        'rod.size': '行数{rows}→列数{cols}（円柱{cols}周分）',
        'rod.checkInput': '入力と設定をご確認ください。',
        'matrix.heading': '📊 マトリクス表示',
        'matrix.empty': '上記のボタンを押すとマトリクスが表示されます',
        'matrix.failed': 'マトリクスを生成できませんでした',
        'matrix.caption': '{mode}マトリクス。行・列番号は0から始まります。',
        'matrix.corner': '行\\列',
        'matrix.cellAria': '行{row}列{col}の文字{char}{pad}',
        'matrix.cellNone': 'なし',
        'matrix.cellPadding': '（埋字）',
        'matrix.descEncrypt': '暗号化プロセス: 各行に色分けして配置し、列方向（縦）に読み取ります',
        'matrix.descDecrypt': '復号プロセス: 列方向に文字を分配し、行方向（横）に読み取ります',
        'matrix.paddingNote': ' 💡 赤い背景はランダム埋字です',
        'matrix.size': '全{rows}行{cols}列。文字が入る行は{used}行です。',
        'matrix.truncated': ' 全{cols}列のうち先頭{shown}列を表示しています。',
        'result.heading': '🎯 結果',
        'result.empty': '結果がここに表示されます',
        'copy.label': 'コピー',
        'copy.done': 'コピー完了！',
        'copy.failed': 'コピー失敗',
        'copy.fallbackAria': 'コピーする結果',
        'count.text': '有効文字数：{count}文字（空白を含む／上限{max}文字）',
        'warn.identity':
            '行数（{rows}）が文字数（{count}）以上のため、列数が1になり、暗号文は平文と同じになります',
        'warn.identityPadded':
            '行数（{rows}）が文字数（{count}）以上のため、列数が1になり、暗号文は平文と同じになります'
            + '（埋字なしの場合）。今回は末尾に埋字が追加されます。',
        'msg.needEncrypt': 'まず暗号化タブで暗号化を実行してください',
        'msg.synced': '暗号化結果と、その暗号化に使った行数を同期しました。',
        'msg.copied': '結果をコピーしました。',
        'msg.copyFailed': 'コピーできませんでした。結果を選択して手動でコピーしてください。',
        'error.tooLong': '入力文字数が上限（{max}文字）を超えています',
        'error.rows': '行数は2〜10の整数で入力してください',
        'error.empty': 'テキストを入力してください',
        'error.padCount': '埋字の文字数が不正です',
        'error.process': '処理できませんでした。{message}',
        'algo.heading': '🔬 アルゴリズム',
        'algo.encryptHeading': '🔒 暗号化アルゴリズム',
        'algo.encrypt1': '平文を指定した行数で折り返す',
        'algo.encrypt2': 'マトリクスに文字を配置',
        'algo.encrypt3': '列方向に読み取って暗号文を生成',
        'algo.decryptHeading': '🔓 復号アルゴリズム',
        'algo.decrypt1': '暗号文の長さから列数を計算',
        'algo.decrypt2': '元の文字が入っていたセルだけへ列方向に分配',
        'algo.decrypt3': '行方向に読み取って平文を復元'
    };

    const en = {
        'app.title': 'Scytale Cipher Visualizer',
        'app.description':
            'An educational tool for learning the ancient Spartan scytale cipher through visual animation',
        'app.keywords': 'cipher, classical cryptography, scytale, education, security, IPUSIRON',
        'app.h1': 'Scytale Cipher Visualizer',
        'app.h1sub': '(Ancient Spartan Transposition Cipher)',
        'app.subtitle': 'Try out the transposition cipher of ancient Sparta',
        'app.langButton': '日本語',
        'app.langAria': 'Switch language',
        'theme.toDark': 'Switch to dark mode',
        'theme.toLight': 'Switch to light mode',
        'intro.heading': 'What is the scytale cipher?',
        'intro.line1':
            'A transposition cipher used in ancient Sparta. A strip of leather was wound around a rod (the scytale)'
            + ' and written on; unwinding the strip left the ciphertext.',
        'intro.strong': 'Key point: rows = rod thickness',
        'intro.line2':
            ' - a larger row count means a thicker rod. In this tool, two different row counts give the same'
            + ' plaintext whenever they produce the same number of columns.',
        'tabs.aria': 'Encryption and decryption',
        'tab.encrypt': '🔒 Encrypt',
        'tab.decrypt': '🔓 Decrypt',
        'mode.encrypt': 'Encryption',
        'mode.decrypt': 'Decryption',
        'encrypt.textLabel': 'Plaintext',
        'encrypt.placeholder': 'Enter the text you want to encrypt\nExample: HELLO_WORLD',
        'encrypt.rowsHint': 'A larger number means a thicker rod',
        'encrypt.run': '🔒 Encrypt',
        'rows.label': 'Rows (key) = rod thickness',
        'padding.label': 'Padding',
        'padding.checkbox': 'Fill with random letters',
        'decrypt.textLabel': 'Ciphertext',
        'decrypt.placeholder': 'Enter the ciphertext you want to decrypt\nExample: HORE_LLWDLO',
        'decrypt.rowsHint': 'Use the same row count as the encryption',
        'decrypt.run': '🔓 Decrypt',
        'sync.label': 'Copy the ciphertext over',
        'sync.button': '📋 Fetch the encryption result',
        'sync.hint': 'Fills this tab with the result from the encrypt tab',
        'brute.button': '🔎 Try every row count',
        'brute.heading': 'Exhaustive key search: {count} distinct results',
        'brute.caption': 'Decryption candidates for row counts 2 to 10',
        'brute.colRows': 'Rows',
        'brute.colCols': 'Columns',
        'brute.colPlain': 'Decryption result',
        'brute.colAction': 'Action',
        'brute.useRows': 'Decrypt with this row count',
        'brute.useRowsAria': 'Decrypt with {rows} rows',
        'brute.groups': 'Row counts grouped by identical result: {list}',
        'brute.groupSeparator': ' / ',
        'brute.note':
            'There are 9 row counts from 2 to 10, but the effective key is the column count'
            + ' (= ceil(length / rows)), so only {count} distinct results exist',
        'rod.initial':
            'The scytale (rod) of ancient Sparta - rows = rod thickness (changing the row count changes'
            + ' the thickness)',
        'rod.encrypting': '🔒 Encrypting: winding the strip around the rod...',
        'rod.decrypting': '🔓 Decrypting: unwinding the strip from the rod...',
        'rod.done': '✅ Done. Check the matrix and the result below',
        'rod.size': '{rows} rows to {cols} columns ({cols} turns around the rod)',
        'rod.checkInput': 'Please check the input and the settings.',
        'matrix.heading': '📊 Matrix view',
        'matrix.empty': 'Press one of the buttons above to see the matrix',
        'matrix.failed': 'Could not build the matrix',
        'matrix.caption': '{mode} matrix. Row and column numbers start at 0.',
        'matrix.corner': 'Row\\Col',
        'matrix.cellAria': 'Row {row}, column {col}, character {char}{pad}',
        'matrix.cellNone': 'none',
        'matrix.cellPadding': ' (padding)',
        'matrix.descEncrypt':
            'Encryption: characters go in row by row with one colour per row, then are read down each column',
        'matrix.descDecrypt':
            'Decryption: characters are dealt out down each column, then are read across each row',
        'matrix.paddingNote': ' 💡 The red cells are random padding',
        'matrix.size': '{rows} rows and {cols} columns in total. {used} rows hold characters.',
        'matrix.truncated': ' Showing the first {shown} of {cols} columns.',
        'result.heading': '🎯 Result',
        'result.empty': 'The result will appear here',
        'copy.label': 'Copy',
        'copy.done': 'Copied',
        'copy.failed': 'Copy failed',
        'copy.fallbackAria': 'Result to copy',
        'count.text': 'Effective length: {count} characters (spaces included, limit {max})',
        'warn.identity':
            'The row count ({rows}) is at least the character count ({count}), so there is only one column'
            + ' and the ciphertext equals the plaintext',
        'warn.identityPadded':
            'The row count ({rows}) is at least the character count ({count}), so there is only one column'
            + ' and the ciphertext equals the plaintext when no padding is used. This time padding is appended.',
        'msg.needEncrypt': 'Run the encryption on the encrypt tab first',
        'msg.synced': 'Copied over the ciphertext and the row count it was encrypted with.',
        'msg.copied': 'The result was copied.',
        'msg.copyFailed': 'Could not copy. Select the result and copy it by hand.',
        'error.tooLong': 'The input is longer than the limit of {max} characters',
        'error.rows': 'Enter the number of rows as an integer from 2 to 10',
        'error.empty': 'Enter some text',
        'error.padCount': 'The number of padding characters is invalid',
        'error.process': 'Could not process the input. {message}',
        'algo.heading': '🔬 Algorithm',
        'algo.encryptHeading': '🔒 Encryption algorithm',
        'algo.encrypt1': 'Wrap the plaintext at the chosen row count',
        'algo.encrypt2': 'Place the characters in the matrix',
        'algo.encrypt3': 'Read down the columns to build the ciphertext',
        'algo.decryptHeading': '🔓 Decryption algorithm',
        'algo.decrypt1': 'Work out the column count from the ciphertext length',
        'algo.decrypt2': 'Deal characters down the columns, into the original cells only',
        'algo.decrypt3': 'Read across the rows to recover the plaintext'
    };

    let language = 'ja';
    const STORAGE_KEY = 'scytale-cipher-visualizer-language';

    function t(key, values = {}) {
        const dict = language === 'en' ? en : ja;
        const message = dict[key];
        if (typeof message !== 'string') throw new Error('Unknown message: ' + key);
        return message.replace(/\{(\w+)\}/g, (whole, name) =>
            Object.prototype.hasOwnProperty.call(values, name) ? String(values[name]) : whole);
    }

    function has(key) {
        return typeof ja[key] === 'string';
    }

    function apply(root = document) {
        document.documentElement.lang = language;
        document.title = t('app.title');
        for (const [name, key] of [['description', 'app.description'], ['keywords', 'app.keywords']]) {
            const meta = document.querySelector(`meta[name="${name}"]`);
            if (meta) meta.setAttribute('content', t(key));
        }
        root.querySelectorAll('[data-i18n]').forEach(element => {
            element.textContent = t(element.dataset.i18n);
        });
        for (const attr of ['aria-label', 'title', 'placeholder']) {
            root.querySelectorAll(`[data-i18n-${attr}]`).forEach(element => {
                element.setAttribute(attr, t(element.getAttribute(`data-i18n-${attr}`)));
            });
        }
    }

    function setLanguage(value) {
        if (value !== 'ja' && value !== 'en') return;
        language = value;
        try { localStorage.setItem(STORAGE_KEY, value); } catch (error) { /* 保存できない環境でも操作できます。 */ }
        apply();
        document.dispatchEvent(new Event('languagechange'));
    }

    function init() {
        let saved = null;
        try { saved = localStorage.getItem(STORAGE_KEY); } catch (error) { /* 既定の言語で続けます。 */ }
        const query = new URLSearchParams(location.search).get('lang');
        const fallback = /^ja\b/i.test(navigator.language || '') ? 'ja' : 'en';
        language = [query, saved].find(value => value === 'ja' || value === 'en') || fallback;
        apply();
    }

    const I18n = { ja, en, t, has, apply, init, setLanguage, get language() { return language; } };
    if (typeof window !== 'undefined') window.I18n = I18n;
    if (typeof globalThis !== 'undefined') globalThis.I18n = I18n;
    if (typeof module === 'object' && module.exports) module.exports = I18n;
})();
