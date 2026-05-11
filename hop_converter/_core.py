"""
hop_converter — HWP/HWPX 변환 내부 구현
exe 경로를 자동 탐색하고 subprocess로 실행합니다.
"""

import os
import subprocess
import sys
import tempfile
from pathlib import Path

_HERE = Path(__file__).parent


def _find_exe() -> Path:
    # 환경변수로 직접 exe 경로 지정 가능
    custom = os.environ.get("HOP_CONVERTER_EXE")
    if custom:
        p = Path(custom)
        if p.is_file():
            return p
        raise FileNotFoundError(f"HOP_CONVERTER_EXE 경로가 유효하지 않습니다: {custom}")

    # 패키지에 동봉된 exe
    platform_key = f"{sys.platform}-{('x64' if sys.maxsize > 2**32 else 'x86')}"
    candidates = [
        _HERE / "_bin" / platform_key / "hop-converter-win-x64.exe",
        _HERE / "_bin" / "win32-x64" / "hop-converter-win-x64.exe",
    ]
    for p in candidates:
        if p.is_file():
            return p

    raise FileNotFoundError(
        "hop-converter 실행 파일을 찾을 수 없습니다. "
        "HOP_CONVERTER_EXE 환경변수로 exe 경로를 지정하거나 "
        "Windows x64 플랫폼에서 사용해 주세요."
    )


_EXE: Path | None = None


def _get_exe() -> Path:
    global _EXE
    if _EXE is None:
        _EXE = _find_exe()
    return _EXE


def _run(input_path: Path, fmt: str, output_path: Path) -> None:
    exe = _get_exe()
    cmd = [str(exe), "convert", str(input_path), "--format", fmt, "--output", str(output_path)]
    result = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8")
    if result.returncode != 0:
        raise RuntimeError(f"변환 실패 (fmt={fmt}): {result.stderr.strip()}")


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
