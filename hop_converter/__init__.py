"""
hop_converter — HWP/HWPX to PDF/Text/Markdown converter

Node.js 없이 동작하는 독립 실행형 변환기입니다.
Windows x64 환경에서 번들된 exe를 직접 실행합니다.

사용법:
    from hop_converter import convert, to_pdf_bytes, to_text, to_markdown

    # 파일로 저장
    convert("report.hwp", "report.pdf")
    convert("report.hwp", "report.txt", fmt="text")
    convert("report.hwp", "report.md", fmt="markdown")

    # 메모리로 받기
    pdf_bytes = to_pdf_bytes("report.hwp")
    text = to_text("report.hwp")
    md = to_markdown("report.hwp")
"""

from ._core import convert, to_pdf_bytes, to_text, to_markdown

__all__ = ["convert", "to_pdf_bytes", "to_text", "to_markdown"]
__version__ = "1.0.0"
