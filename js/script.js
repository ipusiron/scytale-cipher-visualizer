/**
 * Scytale Cipher Visualizer
 * Created by IPUSIRON
 * https://akademeia.info/
 */

function processText() {
    const inputText = document.getElementById('inputText').value;
    const rows = parseInt(document.getElementById('rows').value);
    const mode = document.getElementById('mode').value;

    if (!inputText.trim()) {
        alert('テキストを入力してください');
        return;
    }

    if (rows < 2 || rows > 10) {
        alert('行数は2〜10の範囲で入力してください');
        return;
    }

    // スキュタレーアニメーション開始
    animateScytale(mode, inputText);

    // 少し遅延してから処理を実行（アニメーション効果のため）
    setTimeout(() => {
        let result, matrix;
        
        if (mode === 'encrypt') {
            result = encrypt(inputText, rows);
            matrix = createEncryptMatrix(inputText, rows);
        } else {
            result = decrypt(inputText, rows);
            matrix = createDecryptMatrix(inputText, rows);
        }

        displayMatrix(matrix, mode);
        document.getElementById('resultText').textContent = result;
        
        // コピーボタンを表示
        document.getElementById('copyBtn').style.display = 'block';
        
        // アニメーション終了
        stopScytaleAnimation();
    }, 1500);
}

function encrypt(text, rows) {
    const cols = Math.ceil(text.length / rows);
    const matrix = Array(rows).fill(null).map(() => Array(cols).fill(''));
    
    // 行方向に文字を配置
    for (let i = 0; i < text.length; i++) {
        const row = Math.floor(i / cols);
        const col = i % cols;
        matrix[row][col] = text[i];
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
    
    return result;
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

function createEncryptMatrix(text, rows) {
    const cols = Math.ceil(text.length / rows);
    const matrix = Array(rows).fill(null).map(() => Array(cols).fill(''));
    
    for (let i = 0; i < text.length; i++) {
        const row = Math.floor(i / cols);
        const col = i % cols;
        matrix[row][col] = text[i];
    }
    
    return matrix;
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

function displayMatrix(matrix, mode) {
    const display = document.getElementById('matrixDisplay');
    
    if (matrix.length === 0) {
        display.innerHTML = '<p style="text-align: center; color: #7f8c8d;">マトリクスを生成できませんでした</p>';
        return;
    }

    let html = '<table class="matrix-table">';
    
    // ヘッダー行（列番号）
    html += '<tr><td style="background: #34495e; color: white; font-weight: bold;">行\\列</td>';
    for (let col = 0; col < matrix[0].length; col++) {
        html += `<td style="background: #34495e; color: white; font-weight: bold;">${col}</td>`;
    }
    html += '</tr>';
    
    // データ行
    for (let row = 0; row < matrix.length; row++) {
        html += '<tr>';
        html += `<td style="background: #34495e; color: white; font-weight: bold;">${row}</td>`;
        for (let col = 0; col < matrix[row].length; col++) {
            const char = matrix[row][col] || '';
            const cellClass = `row-${row % 8}`;
            html += `<td class="${cellClass}" onmouseover="highlightColumn(${col})" onmouseout="removeHighlight()">${char}</td>`;
        }
        html += '</tr>';
    }
    html += '</table>';
    
    // 説明文を追加
    const modeText = mode === 'encrypt' ? '暗号化' : '復号';
    const processText = mode === 'encrypt' ? 
        '各行に色分けして配置し、列方向（縦）に読み取ります' : 
        '列方向に文字を分配し、行方向（横）に読み取ります';
    
    html += `<p style="margin-top: 15px; text-align: center; color: #7f8c8d; font-style: italic;">
        ${modeText}プロセス: ${processText}
    </p>`;
    
    display.innerHTML = html;
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
    const rows = parseInt(document.getElementById('rows').value) || 3;
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
    // モード変更時のプレースホルダー更新
    document.getElementById('mode').addEventListener('change', function() {
        const textarea = document.getElementById('inputText');
        if (this.value === 'encrypt') {
            textarea.placeholder = '暗号化したい文字列を入力してください\n例: HELLO_WORLD';
        } else {
            textarea.placeholder = '復号したい暗号文を入力してください\n例: HELOL_ORLDW';
        }
    });

    // 行数変更時のスキュタレーサイズ更新
    document.getElementById('rows').addEventListener('input', function() {
        updateScytaleSize();
        const status = document.getElementById('scytaleStatus');
        const rows = this.value;
        status.textContent = `円柱の太さ: ${rows}行モード - 太い円柱ほど複雑な暗号になります`;
    });

    // 初期設定
    document.getElementById('inputText').value = 'HELLO_WORLD';
    updateScytaleSize(); // 初期サイズ設定
    processText();
});
