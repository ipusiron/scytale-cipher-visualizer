# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Scytale Cipher Visualizer** - an educational web application that demonstrates the ancient Spartan transposition cipher through interactive visualization. The project is a pure HTML/CSS/JavaScript static web application with no build process or external dependencies.

## Development Commands

This is a static web application that requires no build process. To run locally:

```bash
# Start a local web server (choose one):
python -m http.server 8000
# or
npx serve .

# Then open http://localhost:8000 in browser
```

## Code Architecture

### File Structure
```
scytale-cipher-visualizer/
├── index.html          # Main HTML page with UI components
├── css/style.css       # Complete styling with animations and matrix visualization
├── js/script.js        # Core cipher logic and interactive features
└── assets/             # Static assets (screenshots, etc.)
```

### Core Components (js/script.js)

**Cipher Logic:**
- `encrypt(text, rows)` - Implements Scytale encryption using matrix transposition
- `decrypt(cipherText, rows)` - Implements Scytale decryption 
- `createEncryptMatrix()` / `createDecryptMatrix()` - Matrix generation for visualization

**Visualization System:**
- `displayMatrix(matrix, mode)` - Renders interactive color-coded matrix table (js/script.js:128)
- `animateScytale(mode, text)` - Animates the visual scytale rod during processing (js/script.js:192)
- `updateScytaleSize()` - Dynamically adjusts scytale rod thickness based on key (js/script.js:224)

**User Interface:**
- `processText()` - Main entry point triggered by "実行" button (js/script.js:7)
- `copyResult()` - Clipboard functionality with fallback support (js/script.js:248)

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

- Mode switching updates input placeholders automatically
- Real-time scytale size updates when key (row count) changes
- Auto-execution on page load with default "HELLO_WORLD" example

## Technical Notes

- Pure vanilla JavaScript - no frameworks or build tools
- Uses modern Web APIs (Clipboard API with document.execCommand fallback)
- Responsive design supports mobile and desktop
- Japanese language UI with educational focus
- Character encoding handles special characters and spaces