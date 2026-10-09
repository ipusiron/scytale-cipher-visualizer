# Scytale Cipher Visualizer

English · [日本語](README.md)

[![Stars](https://img.shields.io/github/stars/ipusiron/scytale-cipher-visualizer)](https://github.com/ipusiron/scytale-cipher-visualizer/stargazers)
[![Forks](https://img.shields.io/github/forks/ipusiron/scytale-cipher-visualizer)](https://github.com/ipusiron/scytale-cipher-visualizer/network/members)
[![Last commit](https://img.shields.io/github/last-commit/ipusiron/scytale-cipher-visualizer)](https://github.com/ipusiron/scytale-cipher-visualizer/commits/main)
[![License](https://img.shields.io/github/license/ipusiron/scytale-cipher-visualizer)](LICENSE)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-live-brightgreen)](https://ipusiron.github.io/scytale-cipher-visualizer/)

**Day010 - 100 Security Tools with Generative AI**

A browser tool for encrypting and decrypting with the scytale cipher, the transposition cipher of ancient Sparta.

A strip of leather was wound around a rod of a particular thickness and written on across the turns. Unwound, the strip carried the letters out of order, and only a rod of the same thickness put them back. This tool rebuilds that rod as a matrix, so you can watch where each letter lands instead of being told.

## 🌐 Demo

👉 [Open it on GitHub Pages](https://ipusiron.github.io/scytale-cipher-visualizer/)

## 📸 Screenshots

![Encryption result, light theme](assets/screenshot2.png)
> *WE_ARE_DISCOVERED encrypted with 4 rows and no padding, with its matrix and result*

![Encryption result, dark theme](assets/screenshot3.png)
> *The same result in dark mode*

![Exhaustive key search](assets/screenshot4.png)
> *The 9 candidates for row counts 2 to 10, showing that only 6 distinct plaintexts exist*

## ✨ Features

### 🎯 For learning

- **Seeing it happen**: the matrix shows character placement and reading direction for both directions
- **Historical ground**: the cipher as it was actually used in Spartan military messages
- **Immediate feedback**: every change to the key redraws the rod and the column count
- **Separate tabs**: encryption and decryption never share a field, so nothing is ambiguous

### 🎨 Moving parts

- **The rod**: its thickness follows the row count, which is the key
- **Animation**: the strip winds on when you encrypt and unwinds when you decrypt
- **Eight row colours**: each row of the matrix has its own colour, so the reading order is visible
- **One-click hand-off**: send the ciphertext and its row count straight to the decrypt tab

### 💻 Technical

- **Pure JavaScript**: no libraries, no build step
- **Responsive**: works on phones and on the desktop
- **Modern CSS**: Grid, Flexbox and CSS animation
- **Hardened**: `textContent` rendering only, a CSP meta tag, and input sanitising
- **Exhaustive key search**: all 9 row counts, with equivalent keys grouped together
- **Character fidelity**: spaces, Japanese and emoji are handled one code point at a time
- **Dark mode**: follows the operating system, and can be switched by hand
- **Japanese and English**: switch with the button at the top left; `?lang=en` and the browser setting also work

## 📖 How to use

### 🔒 On the encrypt tab

1. **Enter the plaintext** you want to encrypt
2. **Set the row count**, which is the thickness of the rod (2 to 10)
3. **Turn on padding** if you want the rectangle filled with random letters
4. **Press 🔒 Encrypt**

### 🔓 On the decrypt tab

1. **Enter the ciphertext**, or press 📋 Fetch the encryption result to bring it over
2. **Set the row count** used for the encryption (filled in for you when you fetch)
3. **Press 🔓 Decrypt**
4. **Press 🔎 Try every row count** if you do not know the key
5. **Press Decrypt with this row count** on a candidate to see its matrix and result

### 📋 Worked example

```
[Encrypt tab]
Input:  "SECRET_MESSAGE"
Rows:   4
Result: "SEEGETSEC_SRMA"

[Decrypt tab, after fetching]
Input:  "SEEGETSEC_SRMA" (filled in)
Rows:   4 (filled in)
Result: "SECRET_MESSAGE"
```

## 📐 What is on screen

- **Encrypt and decrypt tabs**: separate fields, character counts, row counts and buttons
- **The rod**: thickness from the row count, the column count (turns around the rod), and the winding animation
- **The matrix**: row colours, padding and empty cells are distinguished; the first 60 columns are shown
- **Column highlight**: hover, click, or focus a cell and press Enter or Space
- **Result**: the full text with runs of spaces preserved, plus a copy button; identity settings are flagged
- **Exhaustive key search**: 9 candidates, the groups of equivalent row counts, and the number of distinct results
- **Theme**: top right of the header. Only the theme and the language choice are stored locally
- **Language**: top left of the header. Switching keeps whatever input and results are on screen

## 🎯 Use cases

### Ways of using this tool in particular

- Seeing how a rearrangement spreads out a burst of errors (a class on communication and storage): even if three consecutive characters of the ciphertext are damaged, decryption splits them into three separate places in the plaintext. Encrypt WE_ARE_DISCOVERED with 4 rows to get WECEE_OD_DVAIERSR, damage its first three characters, and after decryption the damaged ones are the 1st, 6th and 11th characters, every 5 characters, which is the number of columns. Single damaged characters are easier to guess from their neighbors. This is the same idea as the interleaving (rearranging to spread errors) used in CDs and wireless communication (in practice it is combined with an error-correcting code; rearranging alone does not fix errors)
- Feeling how reading order changes the text (crafts and language lessons for children): the same grid gives a different string just by reading in another direction. HELLO_WORLD written across a grid with 3 rows reads HORE_LLWDLO down the columns. It works as an answer key for comparing vertical and horizontal writing, or for a craft of winding a paper strip around a pencil
- Comparing members of the transposition family: put the same plaintext through the zigzag of [RailFence CipherLab](https://ipusiron.github.io/railfence-cipherlab/) (Day034) and the column reordering of [Columnar CipherLab](https://ipusiron.github.io/columnar-cipherlab/) (Day043), and confirm that all of them change only the order, never the letters, and differ in how the key is chosen

### General uses

- Explaining transposition ciphers in a class or a study group
- Watching what happens to spaces, Japanese text and emoji when they are rearranged
- Seeing how small the key space really is, and which keys are equivalent

### Where the cipher fails

### 📊 Strength

- **Key space**: 9 row counts from 2 to 10, but the effective key is the column count, `ceil(length / rows)`
- **Weakness**: trivially broken by brute force
- **Frequency analysis**: letter frequencies are unchanged, so statistical attacks apply directly

Row counts that produce the same column count produce the same plaintext. The table below uses ciphertexts made of all-distinct characters. Within this range there are 3 to 9 distinct results, but a one-character input, or one character repeated, can collapse to a single result.

| Ciphertext length | 6 | 8 | 10 | 11 | 14 | 17 | 20 | 30 | 50 | 100 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Distinct decryption results | 3 | 4 | 5 | 4 | 5 | 6 | 6 | 7 | 9 | 9 |

`ATTACK_AT_DAWN` (14 characters) encrypted with 5 rows gives `AA__WTCADNTKTA`, which decrypts correctly with either 5 or 6 rows, because both give 3 columns. More rows do not mean more strength: once the row count reaches the character count there is a single column, and without padding the ciphertext is the plaintext.

| Ciphertext for the search | Distinct results | Correct row counts | Decryption result |
| --- | ---: | --- | --- |
| `HORE_LLWDLO` | 4 | 3 | `HELLO_WORLD` |
| `AA__WTCADNTKTA` | 5 | 5, 6 | `ATTACK_AT_DAWN` |
| `WECEE_OD_DVAIERSR` | 6 | 4 | `WE_ARE_DISCOVERED` |
| `ACEBDF` | 3 | 3, 4, 5 | `ABCDEF` |

### 🎓 Why it still matters

The scytale cipher is of no practical use today, but it is the ground floor of transposition.

- **Block ciphers**: permutation and transposition steps in modern designs
- **Teaching**: the vocabulary of cryptography, learned on something you can see
- **History**: where the craft started

## 🔬 How it works

### 🔒 Encryption

1. Wrap the plaintext at the chosen row count, which is the thickness of the rod.
2. Place the characters into the matrix, row by row.
3. Read down each column to produce the ciphertext.

```
Example: "HELLO_WORLD" with 3 rows
H E L L
O _ W O
R L D

Reading down the columns: H O R E _ L L W D L O
Result: "HORE_LLWDLO"
```

### 🔓 Decryption

1. Work out the column count from the ciphertext length and the row count.
2. Deal the characters down the columns, into the cells the plaintext actually occupied.
3. Read across the rows to recover the plaintext.

With `n` characters and `rows` rows, the column count is `cols = ceil(n / rows)`. When decrypting, cell `(r, c)` receives a character only when `r * cols + c < n`. Skipping the trailing cells of the last rows is what makes encryption without padding and decryption exact inverses of each other.

### Verified encryption examples

Leading and trailing spaces inside the backticks count as characters.

| Plaintext | Rows | Ciphertext |
| --- | ---: | --- |
| `HELLO_WORLD` | 3 | `HORE_LLWDLO` |
| `SECRET_MESSAGE` | 4 | `SEEGETSEC_SRMA` |
| `ATTACK_AT_DAWN` | 5 | `AA__WTCADNTKTA` |
| `WE_ARE_DISCOVERED` | 4 | `WECEE_OD_DVAIERSR` |
| `ABCDEFGHIJ` | 3 | `AEIBFJCGDH` |
| `ABCD` | 3 | `ACBD` |
| `日本語のテスト文字列` | 3 | `日テ字本ス列語トの文` |
| `😀😃😄😁ABCD` | 3 | `😀😁C😃AD😄B` |
| `🔐SECRET🔑` | 3 | `🔐CTSR🔑EE` |
| `  SPACED  TEXT  ` | 3 | ` EX DTS  P  ATCE` |
| `A B C D` | 2 | `AC  BD ` |
| `AB` | 5 | `AB` |
| `ABCDE` | 10 | `ABCDE` |

### Padding and input handling

With padding on, empty cells are filled with random letters A to Z so that the matrix is a full `rows × cols` rectangle. The values come from `crypto.getRandomValues`, and values of 234 or more are discarded to avoid the modulo bias that 26 letters would otherwise introduce. Padding survives decryption, so it is up to you to decide how much of the tail to remove.

Control characters, newlines and tabs are stripped. Spaces, including full-width ones, are kept and encrypted as characters wherever they appear. One character means one code point, so emoji built from ZWJ sequences and combining characters may come apart. The limit is 10000 characters after stripping, and the row count is an integer from 2 to 10.

### Background

#### 🏛️ History

The scytale cipher was used for military messages in ancient Sparta, around the fifth century BC.

A strip of leather was wound in a spiral around a rod of a set thickness, and the message written along it in a single line. Unwinding the strip scattered the letters, and only a rod of the same thickness restored them.

#### 🔬 Classification

- **Type**: transposition cipher
- **Key**: the thickness of the rod, represented here as the row count
- **Strength**: the number of keys depends on the row count, so it is weak

## 🔒 Security

Input and results are processed in the browser. Nothing is sent to an external API and nothing is stored on a server. The only things kept in `localStorage` are the theme and the language choice; input and results are not saved.

Rendering goes through `textContent`, so input is never interpreted as HTML. The CSP is set in a meta tag and limits scripts and styles to the same origin, with `object-src 'none'`, `base-uri 'self'` and `form-action 'self'`. `frame-ancestors` is not set, because a meta tag cannot enforce it. The referrer policy is `no-referrer`.

## ⚠️ Note

This tool exists to teach. Do not use it to protect anything. Padding guarantees nothing about security, and it is not removed automatically after decryption. With reduced-motion preferences the processing delay and the animation are both switched off; otherwise the rod turns.

## 🧪 Tests

Run `npm test` on Node 22 or later. It uses `node --test` and needs no dependencies, and GitHub Actions runs it on every push and pull request.

Covered: the 13 known answers, 558 round trips over letters and digits, 432 round trips over Japanese and emoji, the exhaustive key search, the input boundaries, the colour contrast, the HTML, and the formatting. The tables in the README, the key-space numbers, the image references and the YAML block are checked against the implementation as well. For the two languages, the tests check that the key sets match, that the interpolation names agree, that nothing was left untranslated, and that no Japanese text remains in the pure cipher logic.

```bash
npm test
```

## 🔗 References

- 🎓 [Cryptography articles (akademeia.info, in Japanese)](https://akademeia.info/category/crypto/)
- 📜 [Classical cipher](https://en.wikipedia.org/wiki/Classical_cipher)
- 🔄 [Transposition cipher](https://en.wikipedia.org/wiki/Transposition_cipher)

## 📁 Directory structure

```
scytale-cipher-visualizer/
├── index.html              # Tabs, forms and status regions
├── css/style.css           # Light and dark palettes, rod animation
├── js/
│   ├── i18n.js              # Japanese and English dictionaries, language switching
│   ├── scytale-logic.js     # Cipher logic with no DOM dependency
│   └── script.js            # UI handling and matrix rendering
├── assets/
│   ├── favicon.svg          # Rod icon
│   ├── screenshot.png       # Older image, kept
│   └── screenshot2.png to screenshot4.png  # The three current screens
├── screenshot.png          # Older image, kept
├── test/                   # Seven test files, including test/i18n.test.js
├── .github/workflows/test.yml  # CI on Node 22
├── package.json            # npm test, no dependencies
├── README.md               # Japanese README
├── README.en.md            # This file
├── CLAUDE.md               # Notes for development
├── LICENSE                 # MIT
└── .gitignore              # Git exclusions
```

## 💻 Requirements

Any modern browser: Chrome, Edge, Firefox or Safari. Opening `index.html` over `file://` works too. Node 22 or later is needed only to run the tests.

### 💾 Running it locally

```bash
git clone https://github.com/ipusiron/scytale-cipher-visualizer.git
cd scytale-cipher-visualizer

python -m http.server 8000
# then open http://localhost:8000
```

## 📄 License

Released under the [MIT License](LICENSE).

## 🛠 About this tool

This tool was built as part of **100 Security Tools with Generative AI**, a project in which a security-related tool is built and published every day for 100 days with the help of generative AI.

🔗 [https://akademeia.info/?page_id=42163](https://akademeia.info/?page_id=42163)
