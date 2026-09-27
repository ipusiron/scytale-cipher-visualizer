/**
 * Scytale Cipher Visualizer
 * Created by IPUSIRON
 * https://akademeia.info/
 */

const logic = globalThis.ScytaleLogic;
const i18n = globalThis.I18n;

// 表示中の文言は、訳した文字列ではなく辞書のキーと差し込み値で覚えます。
// languagechange のたびに render*() を呼び直せば、表示中の内容が訳し直されます。
function t(key, values) {
    return i18n.t(key, values);
}

// グローバル変数で現在のタブと結果を管理
let currentTab = 'encrypt';
let encryptResult = '';
let encryptedRows = 3;
let processing = false;
let pinnedColumn = null;
let copyTimer;

// 表示中の状態。文言そのものは持ちません。
let messageState = null;
let warningState = null;
let rodState = { key: 'rod.initial', values: {} };
let resultState = null;
let matrixState = null;
let searchState = null;

function setBusy(busy) {
    processing = busy;
    const controls = '#encryptExecuteBtn, #decryptExecuteBtn, #syncCipherBtn, #bruteForceBtn, .candidate-btn, .tab-btn';
    document.querySelectorAll(controls).forEach(button => { button.disabled = busy; });
    document.getElementById('resultText').setAttribute('aria-busy', String(busy));
}

// 差し込み値が辞書のキーなら、表示の直前に訳します（純ロジックが返すキーを入れ子にできます）。
function resolve(values) {
    const resolved = {};
    for (const [name, value] of Object.entries(values || {})) {
        resolved[name] = typeof value === 'string' && i18n.has(value) ? t(value) : value;
    }
    return resolved;
}

function showMessage(key, values = {}) {
    messageState = key ? { key, values } : null;
    renderMessage();
}

function clearMessage() {
    showMessage('');
}

function renderMessage() {
    const element = document.getElementById('operationMessage');
    element.textContent = messageState ? t(messageState.key, resolve(messageState.values)) : '';
}

function renderIdentityWarning() {
    const element = document.getElementById('identityWarning');
    if (!warningState) {
        element.textContent = '';
        return;
    }
    const key = warningState.padded ? 'warn.identityPadded' : 'warn.identity';
    element.textContent = t(key, { rows: warningState.rows, count: warningState.count });
}

function renderRodStatus() {
    document.getElementById('scytaleStatus').textContent = rodState ? t(rodState.key, rodState.values) : '';
}

function setRodStatus(key, values = {}) {
    rodState = { key, values };
    renderRodStatus();
}

function renderResult() {
    const element = document.getElementById('resultText');
    element.textContent = resultState === null ? t('result.empty') : resultState;
}

// 復帰する文言を定数に持たず、dataset の印から組み立て直します。
function renderCopyButton() {
    const button = document.getElementById('copyBtn');
    const state = button.dataset.copyState || '';
    button.classList.toggle('copy-success', state === 'done');
    document.getElementById('copyIcon').textContent = state === 'done' ? '✅' : state === 'failed' ? '❌' : '📋';
    const key = state === 'done' ? 'copy.done' : state === 'failed' ? 'copy.failed' : 'copy.label';
    document.getElementById('copyLabel').textContent = t(key);
}

function processText(mode = null) {
    if (processing) return;
    let inputText, rows;

    // モードが指定されていない場合は現在のタブから判定
    if (!mode) {
        mode = currentTab;
    }

    if (mode === 'encrypt') {
        const rawInputText = document.getElementById('encryptInputText').value;
        inputText = logic.sanitize(rawInputText);
        rows = Number(document.getElementById('encryptRows').value);
    } else {
        const rawInputText = document.getElementById('decryptInputText').value;
        inputText = logic.sanitize(rawInputText);
        rows = Number(document.getElementById('decryptRows').value);
    }

    const validationError = logic.validate(inputText, rows);
    if (validationError) {
        showMessage(validationError.key, validationError.params);
        return;
    }

    const fillPadding = mode === 'encrypt' && document.getElementById('fillPadding').checked;
    clearMessage();
    warningState = null;
    renderIdentityWarning();
    setBusy(true);

    // スキュタレーアニメーション開始
    animateScytale(mode, inputText);

    // 少し遅延してから処理を実行（アニメーション効果のため）
    const finish = () => {
        try {
            const n = Array.from(inputText).length;
            let result, matrix;
            if (mode === 'encrypt') {
                const padCount = rows * Math.ceil(n / rows) - n;
                const padding = fillPadding ? logic.randomPadChars(padCount) : undefined;
                result = logic.encrypt(inputText, rows, padding);
                matrix = logic.buildEncryptMatrix(inputText, rows, padding);
                encryptResult = result;
                encryptedRows = rows;
            } else {
                result = logic.decrypt(inputText, rows);
                matrix = logic.buildDecryptMatrix(inputText, rows);
            }
            displayMatrix(matrix, mode, inputText, fillPadding);
            resultState = result;
            renderResult();
            document.getElementById('copyBtn').hidden = false;
            if (logic.isIdentity(n, rows)) {
                warningState = { rows, count: n, padded: fillPadding };
                renderIdentityWarning();
            }
            stopScytaleAnimation();
        } catch (error) {
            stopScytaleAnimation();
            // RangeError のメッセージは辞書のキーなので、resolve() が訳します。
            showMessage('error.process', { message: error && error.message ? String(error.message) : '' });
            setRodStatus('rod.checkInput');
        } finally {
            setBusy(false);
        }
    };
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) finish();
    else setTimeout(finish, 1500);
}

function displayMatrix(matrix, mode, originalText, fillPadding = false) {
    pinnedColumn = null;
    matrixState = { matrix, mode, originalText, fillPadding };
    renderMatrix();
}

function renderMatrix() {
    if (!matrixState) return;
    const display = document.getElementById('matrixDisplay');
    const { matrix, mode, originalText, fillPadding } = matrixState;

    if (matrix.length === 0) {
        display.textContent = t('matrix.failed');
        return;
    }

    const inputText = originalText;
    const inputLength = Array.from(inputText).length;
    const cols = matrix[0].length;
    const shownCols = Math.min(cols, 60);
    const modeText = t(mode === 'encrypt' ? 'mode.encrypt' : 'mode.decrypt');

    // テーブル要素を作成
    const table = document.createElement('table');
    table.className = 'matrix-table';
    const caption = document.createElement('caption');
    caption.className = 'visually-hidden';
    caption.textContent = t('matrix.caption', { mode: modeText });
    table.appendChild(caption);

    // ヘッダー行（列番号）
    const headerRow = document.createElement('tr');
    const cornerCell = document.createElement('th');
    cornerCell.scope = 'col';
    cornerCell.textContent = t('matrix.corner');
    headerRow.appendChild(cornerCell);

    for (let col = 0; col < shownCols; col++) {
        const cell = document.createElement('th');
        cell.scope = 'col';
        cell.textContent = col;
        headerRow.appendChild(cell);
    }
    table.appendChild(headerRow);

    // データ行
    for (let row = 0; row < matrix.length; row++) {
        const dataRow = document.createElement('tr');

        // 行番号セル
        const rowHeaderCell = document.createElement('th');
        rowHeaderCell.scope = 'row';
        rowHeaderCell.textContent = row;
        dataRow.appendChild(rowHeaderCell);

        for (let col = 0; col < shownCols; col++) {
            const char = matrix[row][col] || '';
            const cell = document.createElement('td');
            cell.textContent = char;
            cell.className = `row-${row % 8}`;

            // 埋字かどうかを判定
            const isPadding = fillPadding && mode === 'encrypt' && row * cols + col >= inputLength;
            if (isPadding) {
                cell.classList.add('padding-char');
            }
            if (!char) cell.classList.add('empty-cell');
            cell.tabIndex = 0;
            cell.setAttribute('aria-label', t('matrix.cellAria', {
                row, col,
                char: char || t('matrix.cellNone'),
                pad: isPadding ? t('matrix.cellPadding') : ''
            }));

            // イベントリスナーを安全に追加
            cell.addEventListener('mouseover', () => {
                removeHighlight();
                highlightColumn(col);
            });
            cell.addEventListener('mouseout', restoreHighlight);
            const toggle = () => {
                pinnedColumn = pinnedColumn === col ? null : col;
                restoreHighlight();
            };
            cell.addEventListener('click', toggle);
            cell.addEventListener('keydown', event => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    toggle();
                }
            });

            dataRow.appendChild(cell);
        }
        table.appendChild(dataRow);
    }

    // 表示エリアをクリア
    display.replaceChildren();
    display.appendChild(table);

    // 説明文を追加
    const description = document.createElement('p');
    description.className = 'matrix-description';
    description.textContent = t(mode === 'encrypt' ? 'matrix.descEncrypt' : 'matrix.descDecrypt');

    if (fillPadding && mode === 'encrypt') {
        const paddingNote = document.createElement('span');
        paddingNote.textContent = t('matrix.paddingNote');
        description.appendChild(document.createElement('br'));
        description.appendChild(paddingNote);
    }

    display.appendChild(description);
    const note = document.createElement('p');
    note.className = 'matrix-description';
    const used = fillPadding ? matrix.length : logic.usedRows(inputLength, matrix.length);
    note.textContent = t('matrix.size', { rows: matrix.length, cols, used });
    if (cols > shownCols) note.textContent += t('matrix.truncated', { cols, shown: shownCols });
    display.appendChild(note);

    // 言語を切り替えて描き直したあとも、固定した列のハイライトを保ちます。
    restoreHighlight();
}

function highlightColumn(col) {
    const table = document.querySelector('.matrix-table');
    if (!table) return;

    const rows = table.querySelectorAll('tr');
    rows.forEach((row, rowIndex) => {
        if (rowIndex > 0) { // ヘッダー行をスキップ
            const cell = row.children[col + 1]; // +1はrow headerのため
            if (cell) {
                cell.classList.add('column-highlight');
            }
        }
    });
}

function removeHighlight() {
    document.querySelectorAll('.column-highlight').forEach(cell => {
        cell.classList.remove('column-highlight');
    });
}

function restoreHighlight() {
    removeHighlight();
    if (pinnedColumn !== null) highlightColumn(pinnedColumn);
}

function animateScytale(mode, text) {
    const rod = document.getElementById('scytaleRod');
    const band = document.getElementById('scytaleBand');
    const textEl = document.getElementById('scytaleText');

    // 処理開始のアニメーション
    rod.classList.add('processing-animation');

    // テキストを円柱に表示
    const chars = Array.from(text);
    const displayText = chars.slice(0, 15).join('') + (chars.length > 15 ? '...' : '');
    textEl.textContent = displayText;

    if (mode === 'encrypt') {
        band.classList.add('band-animate-wrap');
        setRodStatus('rod.encrypting');
    } else {
        band.classList.add('band-animate-unwrap');
        setRodStatus('rod.decrypting');
    }
}

function stopScytaleAnimation() {
    const rod = document.getElementById('scytaleRod');
    const band = document.getElementById('scytaleBand');

    rod.classList.remove('processing-animation');
    band.classList.remove('band-animate-wrap', 'band-animate-unwrap');
    setRodStatus('rod.done');
}

function updateScytaleSize() {
    let rows;

    // 現在のタブに応じて行数を取得
    if (currentTab === 'encrypt') {
        rows = Number(document.getElementById('encryptRows').value);
    } else {
        rows = Number(document.getElementById('decryptRows').value);
    }
    if (!Number.isInteger(rows) || rows < 2 || rows > 10) return;

    const rod = document.getElementById('scytaleRod');
    const band = document.getElementById('scytaleBand');

    // 行数に応じて円柱の太さを変更（20px + 行数 * 8px）
    const height = Math.max(30, 20 + rows * 8);
    const borderRadius = height / 2;

    rod.style.height = height + 'px';
    rod.style.borderRadius = borderRadius + 'px';
    band.style.borderRadius = borderRadius + 'px';

    // 巻き具合も行数に応じて変更
    band.style.setProperty('--band-angle', `${45 + rows * 5}deg`);
    band.style.setProperty('--band-step', `${4 + rows}px`);
    band.style.setProperty('--band-period', `${8 + rows * 2}px`);
    const n = Array.from(logic.sanitize(document.getElementById(`${currentTab}InputText`).value)).length;
    setRodStatus('rod.size', { rows, cols: Math.ceil(n / rows) });
}

// タブ切り替え関数
function switchTab(tabName) {
    if (processing) return;
    // タブボタンの状態更新
    document.querySelectorAll('.tab-btn').forEach(btn => {
        const active = btn.dataset.tab === tabName;
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-selected', String(active));
        btn.tabIndex = active ? 0 : -1;
    });
    document.getElementById(tabName + 'Tab').classList.add('active');

    // タブコンテンツの表示切り替え
    document.querySelectorAll('.tab-content').forEach(content => {
        const active = content.id === `${tabName}Content`;
        content.classList.toggle('active', active);
        content.hidden = !active;
    });
    document.getElementById(tabName + 'Content').classList.add('active');

    // 現在のタブを更新
    currentTab = tabName;

    // スキュタレーサイズを更新
    updateScytaleSize();
}

function clearBruteForce() {
    searchState = null;
    document.getElementById('bruteForceResults').replaceChildren();
}

// 暗号文同期関数
function syncCipherText() {
    if (processing) return;
    if (!encryptResult) {
        showMessage('msg.needEncrypt');
        return;
    }

    // 暗号化結果を復号タブに設定
    document.getElementById('decryptInputText').value = encryptResult;

    // 暗号化タブの行数を復号タブにも設定
    document.getElementById('decryptRows').value = encryptedRows;
    clearBruteForce();
    updateInputCounts();
    updateScytaleSize();

    // フィードバック表示
    showMessage('msg.synced');
}

async function copyResult() {
    const resultText = document.getElementById('resultText').textContent;
    const copyBtn = document.getElementById('copyBtn');
    let copied = false;
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(resultText);
            copied = true;
        }
    } catch (err) {
        // 権限がない場合も、ユーザー操作中のフォールバックを試します。
    }
    if (!copied) {
        // フォールバック: 古いブラウザー対応
        const textArea = document.createElement('textarea');
        textArea.className = 'clipboard-fallback';
        textArea.setAttribute('aria-label', t('copy.fallbackAria'));
        textArea.value = resultText;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            copied = document.execCommand('copy');
        } catch (fallbackErr) {
            copied = false;
        }
        document.body.removeChild(textArea);
    }
    clearTimeout(copyTimer);
    copyBtn.dataset.copyState = copied ? 'done' : 'failed';
    renderCopyButton();
    showMessage(copied ? 'msg.copied' : 'msg.copyFailed');
    copyTimer = setTimeout(() => {
        copyBtn.dataset.copyState = '';
        renderCopyButton();
    }, 2000);
}

function showBruteForce() {
    if (processing) return;
    const cipher = logic.sanitize(document.getElementById('decryptInputText').value);
    const error = logic.validate(cipher, 2);
    if (error) {
        showMessage(error.key, error.params);
        return;
    }
    setBusy(true);
    clearMessage();
    try {
        searchState = { cipher, search: logic.bruteForce(cipher) };
        renderBruteForce();
    } finally {
        setBusy(false);
    }
}

function renderBruteForce() {
    if (!searchState) return;
    const { cipher, search } = searchState;
    const display = document.getElementById('bruteForceResults');
    display.replaceChildren();
    const heading = document.createElement('h2');
    heading.textContent = t('brute.heading', { count: search.uniqueCount });
    display.appendChild(heading);
    const table = document.createElement('table');
    table.className = 'brute-force-table';
    const caption = document.createElement('caption');
    caption.className = 'visually-hidden';
    caption.textContent = t('brute.caption');
    table.appendChild(caption);
    const columns = document.createElement('colgroup');
    for (const className of ['key-column', 'key-column', 'plaintext-column', 'action-column']) {
        const column = document.createElement('col');
        column.className = className;
        columns.appendChild(column);
    }
    table.appendChild(columns);
    const header = document.createElement('tr');
    for (const key of ['brute.colRows', 'brute.colCols', 'brute.colPlain', 'brute.colAction']) {
        const cell = document.createElement('th');
        cell.scope = 'col';
        cell.textContent = t(key);
        header.appendChild(cell);
    }
    table.appendChild(header);
    for (const item of search.results) {
        const row = document.createElement('tr');
        for (const value of [item.rows, item.cols, item.plaintext]) {
            const cell = document.createElement('td');
            cell.textContent = value;
            row.appendChild(cell);
        }
        const action = document.createElement('td');
        const button = document.createElement('button');
        button.className = 'candidate-btn';
        button.textContent = t('brute.useRows');
        button.disabled = processing;
        button.setAttribute('aria-label', t('brute.useRowsAria', { rows: item.rows }));
        button.addEventListener('click', () => {
            if (processing) return;
            document.getElementById('decryptInputText').value = cipher;
            document.getElementById('decryptRows').value = item.rows;
            updateInputCounts();
            updateScytaleSize();
            processText('decrypt');
        });
        action.appendChild(button);
        row.appendChild(action);
        table.appendChild(row);
    }
    display.appendChild(table);
    const groups = document.createElement('p');
    groups.className = 'search-groups';
    const list = search.groups.map(group => `[${group.rows.join(', ')}]`).join(t('brute.groupSeparator'));
    groups.textContent = t('brute.groups', { list });
    display.appendChild(groups);
    const note = document.createElement('p');
    note.textContent = t('brute.note', { count: search.uniqueCount });
    display.appendChild(note);
}

function updateInputCounts() {
    for (const mode of ['encrypt', 'decrypt']) {
        const n = Array.from(logic.sanitize(document.getElementById(`${mode}InputText`).value)).length;
        document.getElementById(`${mode}CharCount`).textContent =
            t('count.text', { count: n, max: logic.MAX_LENGTH });
    }
}

function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    renderThemeButton();
}

// 状態で変わる属性は data-i18n-aria-label に任せず、状態から組み立て直します。
function renderThemeButton() {
    const dark = document.documentElement.dataset.theme === 'dark';
    const button = document.getElementById('themeToggleBtn');
    button.setAttribute('aria-pressed', String(dark));
    button.setAttribute('aria-label', t(dark ? 'theme.toLight' : 'theme.toDark'));
    button.textContent = dark ? '☀️' : '🌙';
}

function initializeTheme() {
    let stored;
    try { stored = localStorage.getItem('theme'); } catch (error) { /* 保存不可でも操作できます。 */ }
    const preferred = matchMedia('(prefers-color-scheme: dark)');
    let explicit = stored === 'light' || stored === 'dark';
    applyTheme(explicit ? stored : (preferred.matches ? 'dark' : 'light'));
    preferred.addEventListener('change', event => {
        if (!explicit) applyTheme(event.matches ? 'dark' : 'light');
    });
    document.getElementById('themeToggleBtn').addEventListener('click', () => {
        const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
        explicit = true;
        applyTheme(theme);
        try { localStorage.setItem('theme', theme); } catch (error) { /* テーマの保存は任意です。 */ }
    });
}

function initializeLanguage() {
    i18n.init();
    document.getElementById('langToggle').addEventListener('click', () => {
        i18n.setLanguage(i18n.language === 'ja' ? 'en' : 'ja');
    });
    // 表示中のものを、覚えたキーから全部訳し直します。
    document.addEventListener('languagechange', () => {
        renderThemeButton();
        renderMessage();
        renderIdentityWarning();
        renderRodStatus();
        renderResult();
        renderCopyButton();
        renderMatrix();
        renderBruteForce();
        updateInputCounts();
    });
}

// イベントリスナー設定
document.addEventListener('DOMContentLoaded', function() {
    initializeLanguage();

    // タブ切り替えのイベントリスナー
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            switchTab(tabName);
        });
        btn.addEventListener('keydown', event => {
            if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key) || processing) return;
            event.preventDefault();
            const mode = event.key === 'Home' ? 'encrypt' : event.key === 'End' ? 'decrypt'
                : currentTab === 'encrypt' ? 'decrypt' : 'encrypt';
            switchTab(mode);
            document.getElementById(`${mode}Tab`).focus();
        });
    });

    // 暗号化実行ボタンのイベントリスナー
    document.getElementById('encryptExecuteBtn').addEventListener('click', () => processText('encrypt'));

    // 復号実行ボタンのイベントリスナー
    document.getElementById('decryptExecuteBtn').addEventListener('click', () => processText('decrypt'));

    // 同期ボタンのイベントリスナー
    document.getElementById('syncCipherBtn').addEventListener('click', syncCipherText);

    // コピーボタンのイベントリスナー
    document.getElementById('copyBtn').addEventListener('click', copyResult);
    document.getElementById('bruteForceBtn').addEventListener('click', showBruteForce);

    // 暗号化タブの行数変更時のスキュタレーサイズ更新
    document.getElementById('encryptRows').addEventListener('input', function() {
        if (currentTab === 'encrypt') {
            updateScytaleSize();
        }
    });

    // 復号タブの行数変更時のスキュタレーサイズ更新
    document.getElementById('decryptRows').addEventListener('input', function() {
        if (currentTab === 'decrypt') {
            updateScytaleSize();
        }
    });

    // 初期設定
    initializeTheme();
    renderRodStatus();
    renderResult();
    renderCopyButton();
    for (const mode of ['encrypt', 'decrypt']) {
        document.getElementById(`${mode}InputText`).addEventListener('input', () => {
            updateInputCounts();
            if (!processing) updateScytaleSize();
            if (mode === 'decrypt') clearBruteForce();
        });
    }
    document.getElementById('encryptInputText').value = 'HELLO_WORLD';
    updateInputCounts();
    updateScytaleSize(); // 初期サイズ設定
    processText('encrypt'); // 初期実行
});
