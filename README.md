# hop-converter

HWP / HWPX 파일을 **PDF · 텍스트 · Markdown** 으로 변환하는 CLI 도구 및 Python 라이브러리입니다.

[golbin/hop](https://github.com/golbin/hop) 프로젝트의 [`@rhwp/core`](https://www.npmjs.com/package/@rhwp/core) WASM 엔진을 사용하며, **Rust 설치 없이** Node.js만으로 동작합니다.

---

## 요구사항

- **Node.js** v18 이상
- **Python** 3.10 이상 (Python 래퍼 사용 시)

---

## 설치

```bash
git clone git@github.com:MrSongDongHyun/hopConverter.git
cd hopConverter
npm install
```

---

## CLI 사용법

### PDF 변환 (기본)

```bash
node src/index.js convert 문서.hwp
node src/index.js convert 문서.hwp -o 출력.pdf
```

### 텍스트 추출

```bash
node src/index.js convert 문서.hwp -f text
node src/index.js convert 문서.hwp -f text -o 출력.txt
```

### Markdown 변환

```bash
node src/index.js convert 문서.hwp -f markdown
node src/index.js convert 문서.hwp -f markdown -o 출력.md
```

### 옵션

| 옵션 | 설명 | 기본값 |
|------|------|--------|
| `-f, --format` | 출력 형식: `pdf` \| `text` \| `markdown` | `pdf` |
| `-o, --output` | 출력 파일 경로 | 입력 파일명과 동일 |

---

## Python 라이브러리 사용법

`python/hop_converter.py`를 프로젝트에 복사하거나 `sys.path`에 추가합니다.

### 기본 사용

```python
import sys
sys.path.insert(0, '/path/to/hopConverter/python')

from hop_converter import convert, to_pdf_bytes, to_text, to_markdown

# 파일로 저장
convert('문서.hwp', '출력.pdf')                     # PDF
convert('문서.hwp', '출력.txt', fmt='text')          # 텍스트
convert('문서.hwp', '출력.md',  fmt='markdown')      # Markdown

# 메모리에서 직접 사용
pdf_bytes = to_pdf_bytes('문서.hwp')   # bytes 반환
text      = to_text('문서.hwp')        # str 반환
md        = to_markdown('문서.hwp')    # str 반환
```

### hopConverter 폴더가 다른 위치에 있는 경우

```python
import os
os.environ['HOP_CONVERTER_DIR'] = r'C:\path\to\hopConverter'

from hop_converter import to_text
text = to_text('문서.hwp')
```

또는 환경변수로 지정:

```bash
# Windows
set HOP_CONVERTER_DIR=C:\path\to\hopConverter

# macOS / Linux
export HOP_CONVERTER_DIR=/path/to/hopConverter
```

### 에러 처리

```python
from hop_converter import to_text

try:
    text = to_text('문서.hwp')
except FileNotFoundError:
    print('파일을 찾을 수 없습니다')
except ValueError as e:
    print('지원하지 않는 형식:', e)
except RuntimeError as e:
    print('변환 실패:', e)
```

---

## 동작 방식

```
HWP / HWPX
    │
    ▼
@rhwp/core (WASM)
    │  파싱 + 페이지별 SVG 렌더링
    ▼
PDF  →  resvg-js (SVG → PNG 2× 고해상도)
         pdf-lib (PNG → PDF 임베드)

Text / Markdown  →  getPageTextLayout()
                     paraIdx 기반 단락 구분
```

- **PDF**: SVG → 2× 해상도 PNG → pdf-lib 임베드 (~192 DPI)
- **텍스트**: `paraIdx` 기준으로 단락을 구분하여 UTF-8 텍스트 추출
- **Markdown**: 폰트 크기 기준 제목 레벨 자동 추론 (`#` / `##` / `###`)

---

## 프로젝트 구조

```
hopConverter/
├── src/
│   ├── index.js      # CLI 진입점
│   ├── wasm.js       # @rhwp/core WASM 초기화
│   ├── pdf.js        # SVG → PNG → PDF 변환
│   └── text.js       # 텍스트 / Markdown 추출
├── python/
│   └── hop_converter.py  # Python subprocess 래퍼
└── package.json
```

---

## 라이선스

MIT
