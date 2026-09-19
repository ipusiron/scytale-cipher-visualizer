# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Scytale Cipher Visualizer** - an educational web application that demonstrates the ancient Spartan transposition cipher through interactive visualization. Day010の静的Webツールです。外部依存やビルド処理はありません。

## Development Commands

This is a static web application that requires no build process. To run locally:

```bash
# Node 22以上でテスト（依存なし）
npm test
# ローカルHTTP配信
python -m http.server 8000

# Then open http://localhost:8000 in browser
```

`index.html`をfile://で直接開いても全機能が動きます。古典スクリプトを使い、ES moduleにはしません。

## Code Architecture

### File Structure
```
scytale-cipher-visualizer/
├── index.html          # Main HTML page with UI components
├── css/style.css       # Complete styling with animations and matrix visualization
├── js/scytale-logic.js # DOMに依存しない暗号ロジック
├── js/script.js        # DOM処理とアニメーション
├── assets/             # faviconとスクリーンショット
├── test/               # 6ファイルのnode:test
├── .github/workflows/test.yml # pushとpull_requestでNode 22のテスト
├── package.json        # npm test（依存なし）
└── LICENSE             # MITライセンス（旧名LISENCE）
```

### Core Components

**Cipher Logic (js/scytale-logic.js):**

- `sanitize` / `validate` — 制御文字除去と上限10000コードポイント・整数行数2〜10の検査
- `encrypt` / `decrypt` — 行方向配置・列方向読み取りと厳密な逆写像
- `buildEncryptMatrix` / `buildDecryptMatrix` — 空セルを空文字で保持した二次元配列
- `isIdentity` / `usedRows` / `colLengths` — 恒等・使用行数・列ごとの文字数
- `bruteForce` — 行数2〜10のresults、同じplaintextをまとめたgroups、uniqueCount
- `randomPadChars` — crypto.getRandomValuesと234以上の棄却によるA〜Zの埋字

**Visualization System (js/script.js):**

- `displayMatrix` — 先頭60列の行色・埋字・空セルを描画
- `animateScytale` / `stopScytaleAnimation` — 円柱の回転と帯の巻き取り／ほどき
- `updateScytaleSize` — 行数による円柱の太さと列数の表示

**User Interface (js/script.js):**

- `processText` — 入力を固定して実行し、処理中の多重実行を抑止
- `copyResult` — spanのtextContentでコピー通知を更新。フォールバックも保持
- `showBruteForce` / `syncCipherText` — 9候補の表示と暗号化時の行数を含む同期
- `initializeTheme` / `applyTheme` — 検証したlight／dark設定の復元

### Key Features

**Matrix Visualization:** 8-color row coding system with column hover highlighting for understanding cipher mechanics

**Scytale Animation:** Dynamic visual representation where rod thickness changes based on cipher key (row count)

**Educational Focus:** Real-time matrix display showing character placement and reading direction for both encryption/decryption

### CSS Architecture (style.css)

- Grid-based responsive layout using CSS Grid and Flexbox
- CSS animations for scytale rod processing states
- Color-coded matrix cells (`.row-0` through `.row-7` classes)
- Mobile-responsive design with proper viewport handling

### Event Handling

- タブのARIA状態と矢印キー操作を同期
- Real-time scytale size updates when key (row count) changes
- Auto-execution on page load with default "HELLO_WORLD" example

## Technical Notes

- Pure vanilla JavaScript - no frameworks or build tools
- Uses modern Web APIs (Clipboard API with document.execCommand fallback)
- Responsive design supports mobile and desktop
- Japanese language UI with educational focus
- 前後の空白を保持し、1文字を1コードポイントで処理。ZWJシーケンスは分割されうる

## Safety and Verification

- 入力を外部送信せず、localStorageに保存するのはテーマだけ
- 依存パッケージ・CDN・fetchを追加しない
- 描画はtextContent／createElementを使い、innerHTMLとインラインstyle属性は使わない
- CSPのmetaにframe-ancestorsを追加しない（metaでは無効）
- 円柱アニメーションは削除せず、reduced-motionでのみ停止し、待機も1500msから0msに変更
- 埋字は復号後も保持。除去は利用者の判断
- 既存のscreenshot.pngとassets/screenshot.pngは変更しない
- ロジック変更時はnpm testとHTTP／file://の実ブラウザー確認を実行
- 期待値は実装に合わせて書き換えない。READMEの表と既知解答13例も検証
