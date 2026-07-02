import base64
import unittest
from io import BytesIO

from agent_platform.document_parser import parse_document_content, parse_pdf_base64


class DocumentParserTest(unittest.TestCase):
    def test_parse_markdown_content(self):
        text = parse_document_content("# Title\n\nBody", "text/markdown")
        self.assertIn("Body", text)

    def test_parse_pdf_base64(self):
        try:
            from pypdf import PdfWriter
        except ImportError:
            self.skipTest("pypdf not installed")

        writer = PdfWriter()
        writer.add_blank_page(width=200, height=200)
        buffer = BytesIO()
        writer.write(buffer)
        encoded = base64.b64encode(buffer.getvalue()).decode("ascii")

        with self.assertRaises(ValueError):
            parse_pdf_base64(encoded)

    def test_rejects_unknown_content_type(self):
        with self.assertRaises(ValueError):
            parse_document_content("data", "application/octet-stream")


if __name__ == "__main__":
    unittest.main()
