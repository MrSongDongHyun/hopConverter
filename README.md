# hop-converter

HWP / HWPX 파일을 **PDF · 텍스트 · Markdown** 으로 변환하는 CLI 도구 및 Python 라이브러리입니다.

[golbin/hop](https://github.com/golbin/hop) 프로젝트의 [`@rhwp/core`](https://www.npmjs.com/package/@rhwp/core) WASM 엔진을 사용하며, **Rust 설치 없이** 동작합니다.

---

## 특징

- **Node.js 불필요** — 독립 실행 exe로 배포, Python에서 바로 사용 가능
- **세 가지 출력 형식** — PDF / 텍스트 / Markdown
- **순수 JS 파이프라인** — native 모듈 없음 (pdfkit + svg-to-pdfkit)
- **Python 패키지** — `pip install` 한 줄로 설치, DLL처럼 가져다 사용

---

## Python 패키지 (권장)

### 설치

```bash
# whl 파일로 설치 (Node.js 불필요)
pip install hop_converter-1.0.0-py3-none-any.whl

# 또는 소스에서 설치
git clone https://github.com/MrSongDongHyun/hopConverter.git
cd hopConverter
git lfs pull        # exe 다운로드 (Git LFS)
pip install .
```

### 사용법

```python
from hop_converter import convert, to_pdf_bytes, to_text, to_markdown

# 파일로 저장
convert("문서.hwp", "출력.pdf")
convert("문서.hwp", "출력.txt", fmt="text")
convert("문서.hwp", "출력.md",  fmt="markdown")

# 메모리에서 직접 사용
pdf_bytes = to_pdf_bytes("문서.hwp")   # bytes 반환
text      = to_text("문서.hwp")        # str 반환
md        = to_markdown("문서.hwp")    # str 반환
```

### 에러 처리

```python
from hop_converter import to_text

try:
    text = to_text("문서.hwp")
except FileNotFoundError:
    print("파일을 찾을 수 없습니다")
except ValueError as e:
    print("지원하지 않는 형식:", e)
except RuntimeError as e:
    print("변환 실패:", e)
```

### exe 경로 직접 지정 (선택)

```bash
set HOP_CONVERTER_EXE=C:\tools\hop-converter-win-x64.exe
```

---

## 독립 실행 exe

Node.js 없이 단독으로 실행할 수 있는 Windows 실행 파일입니다.

```bash
# PDF 변환
hop-converter-win-x64.exe convert 문서.hwp
hop-converter-win-x64.exe convert 문서.hwp -o 출력.pdf

# 텍스트 추출
hop-converter-win-x64.exe convert 문서.hwp -f text -o 출력.txt

# Markdown 변환
hop-converter-win-x64.exe convert 문서.hwp -f markdown -o 출력.md
```

| 옵션 | 설명 | 기본값 |
|------|------|--------|
| `-f, --format` | 출력 형식: `pdf` \| `text` \| `markdown` | `pdf` |
| `-o, --output` | 출력 파일 경로 | 입력 파일명과 동일 |

---

## 개발 환경 CLI (Node.js)

```bash
git clone https://github.com/MrSongDongHyun/hopConverter.git
cd hopConverter
npm install

node src/index.js convert 문서.hwp
node src/index.js convert 문서.hwp -f text
node src/index.js convert 문서.hwp -f markdown
```

---

## 빌드

exe와 Python wheel을 직접 빌드하려면:

```bash
# 1. WASM 인라인 생성
node scripts/generate-wasm.js

# 2. exe 빌드 (Node.js 번들 포함, ~120MB)
node scripts/build-exe.js

# 3. Python wheel 빌드 (~40MB)
pip install build
python -m build --wheel
```

---

## 프로젝트 구조

```
hopConverter/
├── src/
│   ├── index.js            개발용 CLI 진입점
│   ├── index.bundle.js     번들용 CLI 진입점
│   ├── wasm.js             개발용 WASM 로더
│   ├── wasm-bundle.js      번들용 WASM 로더 (base64 인라인)
│   ├── pdf.js              SVG → PDF 변환 (pdfkit)
│   ├── text.js             텍스트 / Markdown 추출
│   └── generated/
│       └── wasm-bytes.js   자동생성 — WASM base64
├── scripts/
│   ├── generate-wasm.js    WASM → base64 생성 스크립트
│   └── build-exe.js        esbuild + pkg 빌드 파이프라인
├── hop_converter/          Python 패키지
│   ├── __init__.py         공개 API
│   ├── _core.py            exe 탐색 + subprocess 실행
│   └── _bin/win32-x64/
│       └── hop-converter-win-x64.exe   (Git LFS)
├── pyproject.toml          Python 패키지 설정
└── package.json
```

---

## 동작 방식

```
HWP / HWPX
    │
    ▼
@rhwp/core (WASM)  — 파싱 + 페이지별 SVG 렌더링
    │
    ├── PDF      →  svg-to-pdfkit → pdfkit → .pdf
    ├── Text     →  getPageTextLayout() → paraIdx 단락 구분 → .txt
    └── Markdown →  폰트 크기 기준 제목 레벨 추론 → .md
```

---

## 요구사항

| 사용 방법 | 요구사항 |
|-----------|---------|
| Python 패키지 / exe | Python 3.10+, Windows x64 |
| 개발 환경 CLI | Node.js v18+, Python 3.10+ |

---

## 라이선스

MIT
