/**
 * Scytale Cipher Visualizer
 * Created by IPUSIRON
 * https://akademeia.info/
 */

const logic = globalThis.ScytaleLogic;

// グローバル変数で現在のタブと結果を管理
let currentTab = 'encrypt';
let encryptResult = '';
let encryptedRows = 3;
let processing = false;
let pinnedColumn = null;
let copyTimer;

function setBusy(busy) {
    processing = busy;
    const controls = '#encryptExecuteBtn, #decryptExecuteBtn, #syncCipherBtn, #bruteForceBtn, .candidate-btn, .tab-btn';
    document.querySelectorAll(controls).forEach(button => { button.disabled = busy; });
    document.getElementById('resultText').setAttribute('aria-busy', String(busy));
}

function showMessage(message) {
    document.getElementById('operationMessage').textContent = message;
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
        showMessage(validationError);
        return;
    }

    const fillPadding = mode === 'encrypt' && document.getElementById('fillPadding').checked;
    showMessage('');
    document.getElementById('identityWarning').textContent = '';
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
            document.getElementById('resultText').textContent = result;
            document.getElementById('copyBtn').hidden = false;
            if (logic.isIdentity(n, rows)) {
                const warning = `行数（${rows}）が文字数（${n}）以上のため、列数が1になり、暗号文は平文と同じになります`;
                document.getElementById('identityWarning').textContent = fillPadding
                    ? `${warning}（埋字なしの場合）。今回は末尾に埋字が追加されます。` : warning;
            }
            stopScytaleAnimation();
        } catch (error) {
            stopScytaleAnimation();
            showMessage(`処理できませんでした。${error.message}`);
            document.getElementById('scytaleStatus').textContent = '入力と設定をご確認ください。';
        } finally {
            setBusy(false);
        }
    };
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) finish();
    else setTimeout(finish, 1500);
}

function displayMatrix(matrix, mode, originalText, fillPadding = false) {
    const display = document.getElementById('matrixDisplay');
    pinnedColumn = null;

    if (matrix.length === 0) {
        display.textContent = 'マトリクスを生成できませんでした';
        return;
    }

    const inputText = originalText;
    const inputLength = Array.from(inputText).length;
    const cols = matrix[0].length;
    const shownCols = Math.min(cols, 60);

    // テーブル要素を作成
    const table = document.createElement('table');
    table.className = 'matrix-table';
    const caption = document.createElement('caption');
    caption.className = 'visually-hidden';
    caption.textContent = `${mode === 'encrypt' ? '暗号化' : '復号'}マトリクス。行・列番号は0から始まります。`;
    table.appendChild(caption);

    // ヘッダー行（列番号）
    const headerRow = document.createElement('tr');
    const cornerCell = document.createElement('th');
    cornerCell.scope = 'col';
    cornerCell.textContent = '行\\列';
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
            cell.setAttribute('aria-label', `行${row}列${col}の文字${char || 'なし'}${isPadding ? '（埋字）' : ''}`);

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

    const modeText = mode === 'encrypt' ? '暗号化' : '復号';
    const processText = mode === 'encrypt' ?
        '各行に色分けして配置し、列方向（縦）に読み取ります' :
        '列方向に文字を分配し、行方向（横）に読み取ります';

    description.textContent = `${modeText}プロセス: ${processText}`;

    if (fillPadding && mode === 'encrypt') {
        const paddingNote = document.createElement('span');
        paddingNote.textContent = ' 💡 赤い背景はランダム埋字です';
        description.appendChild(document.createElement('br'));
        description.appendChild(paddingNote);
    }

    display.appendChild(description);
    const note = document.createElement('p');
    note.className = 'matrix-description';
    note.textContent = `全${matrix.length}行${cols}列。文字が入る行は${fillPadding ? matrix.length : logic.usedRows(inputLength, matrix.length)}行です。`;
    if (cols > shownCols) note.textContent += ` 全${cols}列のうち先頭60列を表示しています。`;
    display.appendChild(note);
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
    const status = document.getElementById('scytaleStatus');

    // 処理開始のアニメーション
    rod.classList.add('processing-animation');

    // テキストを円柱に表示
    const chars = Array.from(text);
    const displayText = chars.slice(0, 15).join('') + (chars.length > 15 ? '...' : '');
    textEl.textContent = displayText;

    if (mode === 'encrypt') {
        band.classList.add('band-animate-wrap');
        status.textContent = '🔒 暗号化中: 紐を円柱に巻いています...';
    } else {
        band.classList.add('band-animate-unwrap');
        status.textContent = '🔓 復号中: 紐を円柱からほどいています...';
    }
}

function stopScytaleAnimation() {
    const rod = document.getElementById('scytaleRod');
    const band = document.getElementById('scytaleBand');
    const status = document.getElementById('scytaleStatus');

    rod.classList.remove('processing-animation');
    band.classList.remove('band-animate-wrap', 'band-animate-unwrap');
    status.textContent = '✅ 処理完了！マトリクスと結果をご確認ください';
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
    document.getElementById('scytaleStatus').textContent = `行数${rows}→列数${Math.ceil(n / rows)}（円柱${Math.ceil(n / rows)}周分）`;
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

// 暗号文同期関数
function syncCipherText() {
    if (processing) return;
    if (!encryptResult) {
        showMessage('まず暗号化タブで暗号化を実行してください');
        return;
    }

    // 暗号化結果を復号タブに設定
    document.getElementById('decryptInputText').value = encryptResult;

    // 暗号化タブの行数を復号タブにも設定
    document.getElementById('decryptRows').value = encryptedRows;
    document.getElementById('bruteForceResults').replaceChildren();
    updateInputCounts();
    updateScytaleSize();

    // フィードバック表示
    showMessage('暗号化結果と、その暗号化に使った行数を同期しました。');
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
        textArea.setAttribute('aria-label', 'コピーする結果');
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
    copyBtn.classList.toggle('copy-success', copied);
    document.getElementById('copyIcon').textContent = copied ? '✅' : '❌';
    document.getElementById('copyLabel').textContent = copied ? 'コピー完了！' : 'コピー失敗';
    showMessage(copied ? '結果をコピーしました。' : 'コピーできませんでした。結果を選択して手動でコピーしてください。');
    copyTimer = setTimeout(() => {
        copyBtn.classList.remove('copy-success');
        document.getElementById('copyIcon').textContent = '📋';
        document.getElementById('copyLabel').textContent = 'コピー';
    }, 2000);
}

function showBruteForce() {
    if (processing) return;
    const cipher = logic.sanitize(document.getElementById('decryptInputText').value);
    const error = logic.validate(cipher, 2);
    if (error) {
        showMessage(error);
        return;
    }
    setBusy(true);
    showMessage('');
    try {
        const search = logic.bruteForce(cipher);
        const display = document.getElementById('bruteForceResults');
        display.replaceChildren();
        const heading = document.createElement('h2');
        heading.textContent = `全鍵探索：異なる結果は${search.uniqueCount}種類`;
        display.appendChild(heading);
        const table = document.createElement('table');
        table.className = 'brute-force-table';
        const caption = document.createElement('caption');
        caption.className = 'visually-hidden';
        caption.textContent = '行数2〜10の復号候補';
        table.appendChild(caption);
        const columns = document.createElement('colgroup');
        for (const className of ['key-column', 'key-column', 'plaintext-column', 'action-column']) {
            const column = document.createElement('col');
            column.className = className;
            columns.appendChild(column);
        }
        table.appendChild(columns);
        const header = document.createElement('tr');
        for (const title of ['行数', '列数', '復号結果', '操作']) {
            const cell = document.createElement('th');
            cell.scope = 'col';
            cell.textContent = title;
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
            button.textContent = 'この行数で復号する';
            button.setAttribute('aria-label', `行数${item.rows}で復号する`);
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
        groups.textContent = '同じ結果の行数グループ：' + search.groups.map(group => `[${group.rows.join(', ')}]`).join(' ／ ');
        display.appendChild(groups);
        const note = document.createElement('p');
        note.textContent = '行数は2〜10の9通りだが、実質の鍵は列数（＝ceil(文字数÷行数)）なので、'
            + `異なる結果は${search.uniqueCount}種類しかない`;
        display.appendChild(note);
    } finally {
        setBusy(false);
    }
}

function updateInputCounts() {
    for (const mode of ['encrypt', 'decrypt']) {
        const n = Array.from(logic.sanitize(document.getElementById(`${mode}InputText`).value)).length;
        document.getElementById(`${mode}CharCount`).textContent = `有効文字数：${n}文字（空白を含む／上限10000文字）`;
    }
}

function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    const button = document.getElementById('themeToggleBtn');
    button.setAttribute('aria-pressed', String(theme === 'dark'));
    button.setAttribute('aria-label', theme === 'dark' ? 'ライトモードに切り替える' : 'ダークモードに切り替える');
    button.textContent = theme === 'dark' ? '☀️' : '🌙';
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

// イベントリスナー設定
document.addEventListener('DOMContentLoaded', function() {
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
    for (const mode of ['encrypt', 'decrypt']) {
        document.getElementById(`${mode}InputText`).addEventListener('input', () => {
            updateInputCounts();
            if (!processing) updateScytaleSize();
            if (mode === 'decrypt') document.getElementById('bruteForceResults').replaceChildren();
        });
    }
    document.getElementById('encryptInputText').value = 'HELLO_WORLD';
    updateInputCounts();
    updateScytaleSize(); // 初期サイズ設定
    processText('encrypt'); // 初期実行
});
