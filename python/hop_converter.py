"""
hop_converter — HWP/HWPX 변환 Python 래퍼
사용법:
    from hop_converter import convert, to_pdf_bytes, to_text, to_markdown
"""

import subprocess
import tempfile
import shutil
from pathlib import Path

_HERE = Path(__file__).parent

def _find_node_script() -> Path:
    # 환경변수로 경로 지정 가능: HOP_CONVERTER_DIR=C:\path\to\hopConverter
    import os
    base = os.environ.get("HOP_CONVERTER_DIR")
    if base:
        return (Path(base) / "src" / "index.js").resolve()
    # 기본값: hop_converter.py 기준 상위 폴더
    return (_HERE.parent / "src" / "index.js").resolve()

_NODE_SCRIPT = _find_node_script()


def _find_node() -> str:
    node = shutil.which("node")
    if not node:
        raise EnvironmentError(
            "node 실행 파일을 찾을 수 없습니다. Node.js가 설치되어 있는지 확인하세요."
        )
    return node


def _run(input_path: str | Path, fmt: str, output_path: str | Path) -> None:
    """내부 변환 실행. 실패 시 RuntimeError 발생."""
    cmd = [
        _find_node(),
        str(_NODE_SCRIPT),
        "convert",
        str(input_path),
        "--format", fmt,
        "--output", str(output_path),
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8")
    if result.returncode != 0:
        stderr = result.stderr.strip()
        raise RuntimeError(f"변환 실패 (fmt={fmt}): {stderr}")


def convert(
    input_path: str | Path,
    output_path: str | Path,
    fmt: str = "pdf",
) -> Path:
    """
    HWP/HWPX 파일을 변환하여 output_path에 저장합니다.

    Args:
        input_path:  .hwp 또는 .hwpx 파일 경로
        output_path: 출력 파일 경로
        fmt:         'pdf' | 'text' | 'markdown' (기본값: 'pdf')

    Returns:
        저장된 출력 파일의 Path 객체

    Raises:
        FileNotFoundError: 입력 파일이 없을 때
        ValueError:        지원하지 않는 형식일 때
        RuntimeError:      변환 중 오류 발생 시
    """
    input_path = Path(input_path).resolve()
    output_path = Path(output_path).resolve()

    if not input_path.exists():
        raise FileNotFoundError(f"파일을 찾을 수 없습니다: {input_path}")
    if input_path.suffix.lower() not in (".hwp", ".hwpx"):
        raise ValueError(f"지원하지 않는 입력 형식입니다: {input_path.suffix}")
    if fmt not in ("pdf", "text", "markdown"):
        raise ValueError(f"지원하지 않는 출력 형식입니다: {fmt!r}")

    _run(input_path, fmt, output_path)
    return output_path


def to_pdf_bytes(input_path: str | Path) -> bytes:
    """HWP/HWPX → PDF 변환 결과를 bytes로 반환합니다."""
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
        tmp_path = Path(tmp.name)
    try:
        convert(input_path, tmp_path, fmt="pdf")
        return tmp_path.read_bytes()
    finally:
        tmp_path.unlink(missing_ok=True)


def to_text(input_path: str | Path) -> str:
    """HWP/HWPX 본문 텍스트를 문자열로 반환합니다."""
    with tempfile.NamedTemporaryFile(suffix=".txt", delete=False) as tmp:
        tmp_path = Path(tmp.name)
    try:
        convert(input_path, tmp_path, fmt="text")
        return tmp_path.read_text(encoding="utf-8")
    finally:
        tmp_path.unlink(missing_ok=True)


def to_markdown(input_path: str | Path) -> str:
    """HWP/HWPX → Markdown 문자열로 반환합니다."""
    with tempfile.NamedTemporaryFile(suffix=".md", delete=False) as tmp:
        tmp_path = Path(tmp.name)
    try:
        convert(input_path, tmp_path, fmt="markdown")
        return tmp_path.read_text(encoding="utf-8")
    finally:
        tmp_path.unlink(missing_ok=True)
