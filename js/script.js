/**
 * Scytale Cipher Visualizer
 * Created by IPUSIRON
 * https://akademeia.info/
 */

function sanitizeInput(input) {
    // 有害な文字や制御文字を除去（HTMLエスケープは結果表示では不要）
    return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
                .trim();
}

function validateInput(text, rows) {
    // 文字数制限（10000文字まで）
    if (text.length > 10000) {
        return '入力文字数が上限（10000文字）を超えています';
    }
    
    // 行数の範囲チェック
    if (rows < 2 || rows > 10 || !Number.isInteger(rows)) {
        return '行数は2〜10の整数で入力してください';
    }
    
    // 空文字チェック
    if (!text.trim()) {
        return 'テキストを入力してください';
    }
    
    return null;
}

// グローバル変数で現在のタブと結果を管理
let currentTab = 'encrypt';
let encryptResult = '';

function processText(mode = null) {
    let inputText, rows;
    
    // モードが指定されていない場合は現在のタブから判定
    if (!mode) {
        mode = currentTab;
    }
    
    if (mode === 'encrypt') {
        const rawInputText = document.getElementById('encryptInputText').value;
        inputText = sanitizeInput(rawInputText);
        rows = parseInt(document.getElementById('encryptRows').value);
    } else {
        const rawInputText = document.getElementById('decryptInputText').value;
        inputText = sanitizeInput(rawInputText);
        rows = parseInt(document.getElementById('decryptRows').value);
    }

    const validationError = validateInput(inputText, rows);
    if (validationError) {
        alert(validationError);
        return;
    }

    // スキュタレーアニメーション開始
    animateScytale(mode, inputText);

    // 少し遅延してから処理を実行（アニメーション効果のため）
    setTimeout(() => {
        let result, matrix;
        
        if (mode === 'encrypt') {
            const encryptionData = encryptWithMatrix(inputText, rows);
            result = encryptionData.result;
            matrix = encryptionData.matrix;
            encryptResult = result; // 暗号化結果を保存
        } else {
            result = decrypt(inputText, rows);
            matrix = createDecryptMatrix(inputText, rows);
        }

        displayMatrix(matrix, mode, inputText);
        document.getElementById('resultText').textContent = result;
        
        // コピーボタンを表示
        document.getElementById('copyBtn').style.display = 'block';
        
        // アニメーション終了
        stopScytaleAnimation();
    }, 1500);
}

function generateRandomChar() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return chars[Math.floor(Math.random() * chars.length)];
}

function encryptWithMatrix(text, rows) {
    const fillPadding = document.getElementById('fillPadding').checked;
    const cols = Math.ceil(text.length / rows);
    const matrix = Array(rows).fill(null).map(() => Array(cols).fill(''));
    
    // 行方向に文字を配置
    for (let i = 0; i < text.length; i++) {
        const row = Math.floor(i / cols);
        const col = i % cols;
        matrix[row][col] = text[i];
    }
    
    // 埋字オプションが有効な場合、空いている部分にランダム文字を埋める
    if (fillPadding) {
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                if (!matrix[row][col]) {
                    matrix[row][col] = generateRandomChar();
                }
            }
        }
    }
    
    // 列方向に読み取り
    let result = '';
    for (let col = 0; col < cols; col++) {
        for (let row = 0; row < rows; row++) {
            if (matrix[row][col]) {
                result += matrix[row][col];
            }
        }
    }
    
    return { result: result, matrix: matrix };
}

// 後方互換性のため従来のencrypt関数も維持
function encrypt(text, rows) {
    return encryptWithMatrix(text, rows).result;
}

function decrypt(cipherText, rows) {
    const cols = Math.ceil(cipherText.length / rows);
    const matrix = Array(rows).fill(null).map(() => Array(cols).fill(''));
    
    // 列方向に文字を分配
    let index = 0;
    for (let col = 0; col < cols; col++) {
        for (let row = 0; row < rows; row++) {
            if (index < cipherText.length) {
                matrix[row][col] = cipherText[index++];
            }
        }
    }
    
    // 行方向に読み取り
    let result = '';
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            if (matrix[row][col]) {
                result += matrix[row][col];
            }
        }
    }
    
    return result;
}


function createDecryptMatrix(cipherText, rows) {
    const cols = Math.ceil(cipherText.length / rows);
    const matrix = Array(rows).fill(null).map(() => Array(cols).fill(''));
    
    let index = 0;
    for (let col = 0; col < cols; col++) {
        for (let row = 0; row < rows; row++) {
            if (index < cipherText.length) {
                matrix[row][col] = cipherText[index++];
            }
        }
    }
    
    return matrix;
}

function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

function displayMatrix(matrix, mode, originalText = '') {
    const display = document.getElementById('matrixDisplay');
    
    if (matrix.length === 0) {
        display.textContent = 'マトリクスを生成できませんでした';
        display.style.textAlign = 'center';
        display.style.color = '#7f8c8d';
        return;
    }

    const fillPadding = document.getElementById('fillPadding').checked;
    const inputText = originalText || document.getElementById('inputText').value;
    
    // テーブル要素を作成
    const table = document.createElement('table');
    table.className = 'matrix-table';
    
    // ヘッダー行（列番号）
    const headerRow = document.createElement('tr');
    const cornerCell = document.createElement('td');
    cornerCell.textContent = '行\\列';
    cornerCell.style.cssText = 'background: #34495e; color: white; font-weight: bold;';
    headerRow.appendChild(cornerCell);
    
    for (let col = 0; col < matrix[0].length; col++) {
        const cell = document.createElement('td');
        cell.textContent = col;
        cell.style.cssText = 'background: #34495e; color: white; font-weight: bold;';
        headerRow.appendChild(cell);
    }
    table.appendChild(headerRow);
    
    // データ行
    let charIndex = 0;
    for (let row = 0; row < matrix.length; row++) {
        const dataRow = document.createElement('tr');
        
        // 行番号セル
        const rowHeaderCell = document.createElement('td');
        rowHeaderCell.textContent = row;
        rowHeaderCell.style.cssText = 'background: #34495e; color: white; font-weight: bold;';
        dataRow.appendChild(rowHeaderCell);
        
        for (let col = 0; col < matrix[row].length; col++) {
            const char = matrix[row][col] || '';
            const cell = document.createElement('td');
            cell.textContent = char;
            cell.className = `row-${row % 8}`;
            
            // 埋字かどうかを判定
            const isPadding = fillPadding && mode === 'encrypt' && charIndex >= inputText.length;
            if (isPadding) {
                cell.classList.add('padding-char');
            }
            
            // イベントリスナーを安全に追加
            cell.addEventListener('mouseover', () => highlightColumn(col));
            cell.addEventListener('mouseout', removeHighlight);
            
            dataRow.appendChild(cell);
            if (char) charIndex++;
        }
        table.appendChild(dataRow);
    }
    
    // 表示エリアをクリア
    display.innerHTML = '';
    display.appendChild(table);
    
    // 説明文を追加
    const description = document.createElement('p');
    description.style.cssText = 'margin-top: 15px; text-align: center; color: #7f8c8d; font-style: italic;';
    
    const modeText = mode === 'encrypt' ? '暗号化' : '復号';
    const processText = mode === 'encrypt' ? 
        '各行に色分けして配置し、列方向（縦）に読み取ります' : 
        '列方向に文字を分配し、行方向（横）に読み取ります';
    
    description.textContent = `${modeText}プロセス: ${processText}`;
    
    if (fillPadding && mode === 'encrypt') {
        const paddingNote = document.createElement('span');
        paddingNote.style.color = '#e74c3c';
        paddingNote.textContent = ' 💡 赤い背景はランダム埋字です';
        description.appendChild(document.createElement('br'));
        description.appendChild(paddingNote);
    }
    
    display.appendChild(description);
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

function animateScytale(mode, text) {
    const rod = document.getElementById('scytaleRod');
    const band = document.getElementById('scytaleBand');
    const textEl = document.getElementById('scytaleText');
    const status = document.getElementById('scytaleStatus');
    
    // 処理開始のアニメーション
    rod.classList.add('processing-animation');
    
    // テキストを円柱に表示
    const displayText = text.length > 15 ? text.substring(0, 15) + '...' : text;
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
        rows = parseInt(document.getElementById('encryptRows').value) || 3;
    } else {
        rows = parseInt(document.getElementById('decryptRows').value) || 3;
    }
    
    const rod = document.getElementById('scytaleRod');
    const band = document.getElementById('scytaleBand');
    
    // 行数に応じて円柱の太さを変更（20px + 行数 * 8px）
    const height = Math.max(30, 20 + rows * 8);
    const borderRadius = height / 2;
    
    rod.style.height = height + 'px';
    rod.style.borderRadius = borderRadius + 'px';
    band.style.borderRadius = borderRadius + 'px';
    
    // 巻き具合も行数に応じて変更
    const bandPattern = `repeating-linear-gradient(
        ${45 + rows * 5}deg,
        rgba(139, 69, 19, 0.3),
        rgba(139, 69, 19, 0.3) ${4 + rows}px,
        rgba(160, 82, 45, 0.3) ${4 + rows}px,
        rgba(160, 82, 45, 0.3) ${8 + rows * 2}px
    )`;
    band.style.background = bandPattern;
}

// タブ切り替え関数
function switchTab(tabName) {
    // タブボタンの状態更新
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(tabName + 'Tab').classList.add('active');
    
    // タブコンテンツの表示切り替え
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabName + 'Content').classList.add('active');
    
    // 現在のタブを更新
    currentTab = tabName;
    
    // スキュタレーサイズを更新
    updateScytaleSize();
}

// 暗号文同期関数
function syncCipherText() {
    if (!encryptResult) {
        alert('まず暗号化タブで暗号化を実行してください');
        return;
    }
    
    // 暗号化結果を復号タブに設定
    document.getElementById('decryptInputText').value = encryptResult;
    
    // 暗号化タブの行数を復号タブにも設定
    const encryptRows = document.getElementById('encryptRows').value;
    document.getElementById('decryptRows').value = encryptRows;
    
    // フィードバック表示
    const syncBtn = document.getElementById('syncCipherBtn');
    const originalText = syncBtn.textContent;
    syncBtn.textContent = '✅ 同期完了！';
    syncBtn.style.background = 'linear-gradient(45deg, #27ae60, #229954)';
    
    setTimeout(() => {
        syncBtn.textContent = originalText;
        syncBtn.style.background = 'linear-gradient(45deg, #3498db, #2980b9)';
    }, 2000);
}

async function copyResult() {
    const resultText = document.getElementById('resultText').textContent;
    const copyBtn = document.getElementById('copyBtn');
    const copyIcon = document.getElementById('copyIcon');
    
    try {
        await navigator.clipboard.writeText(resultText);
        
        // 成功時の視覚的フィードバック
        copyBtn.classList.add('copy-success');
        copyIcon.textContent = '✅';
        copyBtn.innerHTML = '<span id="copyIcon">✅</span> コピー完了！';
        
        // 2秒後に元に戻す
        setTimeout(() => {
            copyBtn.classList.remove('copy-success');
            copyIcon.textContent = '📋';
            copyBtn.innerHTML = '<span id="copyIcon">📋</span> コピー';
        }, 2000);
        
    } catch (err) {
        // フォールバック: 古いブラウザ対応
        const textArea = document.createElement('textarea');
        textArea.value = resultText;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            copyIcon.textContent = '✅';
            copyBtn.innerHTML = '<span id="copyIcon">✅</span> コピー完了！';
        } catch (fallbackErr) {
            copyIcon.textContent = '❌';
            copyBtn.innerHTML = '<span id="copyIcon">❌</span> コピー失敗';
        }
        document.body.removeChild(textArea);
        
        // 2秒後に元に戻す
        setTimeout(() => {
            copyIcon.textContent = '📋';
            copyBtn.innerHTML = '<span id="copyIcon">📋</span> コピー';
        }, 2000);
    }
}

// イベントリスナー設定
document.addEventListener('DOMContentLoaded', function() {
    // タブ切り替えのイベントリスナー
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            switchTab(tabName);
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

    // 暗号化タブの行数変更時のスキュタレーサイズ更新
    document.getElementById('encryptRows').addEventListener('input', function() {
        if (currentTab === 'encrypt') {
            updateScytaleSize();
            const status = document.getElementById('scytaleStatus');
            const rows = this.value;
            status.textContent = `行数 = 円柱の太さ: ${rows}行 → ${rows}段の太さの円柱を使用中（太いほど複雑な暗号）`;
        }
    });

    // 復号タブの行数変更時のスキュタレーサイズ更新
    document.getElementById('decryptRows').addEventListener('input', function() {
        if (currentTab === 'decrypt') {
            updateScytaleSize();
            const status = document.getElementById('scytaleStatus');
            const rows = this.value;
            status.textContent = `行数 = 円柱の太さ: ${rows}行 → ${rows}段の太さの円柱を使用中（暗号化時と同じ値）`;
        }
    });

    // 初期設定
    document.getElementById('encryptInputText').value = 'HELLO_WORLD';
    updateScytaleSize(); // 初期サイズ設定
    processText('encrypt'); // 初期実行
});
