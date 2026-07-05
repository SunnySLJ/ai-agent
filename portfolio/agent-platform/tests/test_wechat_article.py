import json
import unittest
from io import BytesIO
from unittest import mock

from fastapi.testclient import TestClient
from pypdf import PdfWriter

from agent_platform.api import create_app
from agent_platform.book_parser import BookDocument, BookPage
from agent_platform.wechat_article_generator import generate_wechat_article
from test_llm import chat_completion_service


def _sample_pdf_bytes(
    text: str = "深度工作是一本关于专注力的书。作者提出要在无干扰环境中进行高质量认知劳动。",
) -> bytes:
    try:
        import fitz

        document = fitz.open()
        page = document.new_page()
        page.insert_text((72, 72), text, fontsize=12)
        pdf_bytes = document.tobytes()
        document.close()
        return pdf_bytes
    except ImportError:
        buffer = BytesIO()
        writer = PdfWriter()
        writer.add_blank_page(width=612, height=792)
        writer.write(buffer)
        return buffer.getvalue()


class WechatArticleGeneratorTest(unittest.TestCase):
    def test_offline_generation_includes_essence_and_html(self):
        book = BookDocument(
            title_hint="深度工作",
            pages=[
                BookPage(
                    page_number=1,
                    text="深度工作要求在无干扰环境中进行高质量认知劳动，这是信息时代最有价值的技能之一。",
                ),
                BookPage(
                    page_number=2,
                    text="作者卡尔·纽波特提出四种深度工作哲学，帮助读者建立可持续的专注习惯。",
                ),
            ],
        )

        article = generate_wechat_article(book, book_title="深度工作", author="卡尔·纽波特")

        self.assertEqual("offline", article.generator)
        self.assertGreaterEqual(len(article.essence), 3)
        self.assertIn("深度工作", article.title)
        self.assertIn("全书精髓", article.html)
        self.assertIn("学以致用", article.markdown)
        self.assertGreaterEqual(len(article.sections), 1)

    def test_llm_generation_uses_complete_response(self):
        llm_json = json.dumps(
            {
                "title": "读完这本书，我学会了深度专注",
                "subtitle": "5 分钟掌握全书框架",
                "hook": "如果你总是被消息打断，这篇文章值得收藏。",
                "essence": ["精髓一", "精髓二", "精髓三", "精髓四", "精髓五"],
                "action_items": ["行动一", "行动二"],
                "sections": [
                    {
                        "heading": "为什么需要深度工作",
                        "body": "在碎片化时代，专注是最稀缺的竞争力。",
                        "quote": "专注是新的超能力。",
                    }
                ],
            },
            ensure_ascii=False,
        )
        book = BookDocument(
            title_hint="深度工作",
            pages=[BookPage(page_number=1, text="深度工作是一本关于专注力的经典著作。")],
        )

        with mock.patch(
            "agent_platform.wechat_article_generator.OpenAICompatibleChatClient"
        ) as mock_client_cls:
            mock_client_cls.return_value.complete.return_value = llm_json
            article = generate_wechat_article(
                book,
                book_title="深度工作",
                llm_client=mock_client_cls.return_value,
            )

        self.assertEqual("llm", article.generator)
        self.assertEqual("读完这本书，我学会了深度专注", article.title)
        self.assertEqual(5, len(article.essence))
        self.assertIn("专注是新的超能力", article.html)


class WechatArticleApiTest(unittest.TestCase):
    def setUp(self):
        self.env_patcher = mock.patch.dict("os.environ", {}, clear=True)
        self.env_patcher.start()

    def tearDown(self):
        self.env_patcher.stop()

    def test_generate_wechat_article_from_pdf(self):
        client = TestClient(create_app())
        pdf_bytes = _sample_pdf_bytes()

        response = client.post(
            "/wechat-articles/generate",
            files={"file": ("deep-work.pdf", pdf_bytes, "application/pdf")},
            data={"book_title": "深度工作", "author": "卡尔·纽波特"},
        )

        self.assertEqual(200, response.status_code)
        body = response.json()
        self.assertTrue(body["accepted"])
        self.assertIn("深度工作", body["title"])
        self.assertIn("html", body)
        self.assertIn("markdown", body)
        self.assertIn("essence", body)
        self.assertGreaterEqual(len(body["essence"]), 1)
        self.assertIn(body["generator"], {"offline", "llm"})

    def test_generate_wechat_article_rejects_non_pdf(self):
        client = TestClient(create_app())

        response = client.post(
            "/wechat-articles/generate",
            files={"file": ("notes.txt", b"hello", "text/plain")},
        )

        self.assertEqual(400, response.status_code)

    def test_generate_wechat_article_uses_llm_when_env_is_set(self):
        llm_json = json.dumps(
            {
                "title": "LLM 生成的公众号标题",
                "subtitle": "副标题",
                "hook": "引子内容",
                "essence": ["A", "B", "C", "D", "E"],
                "action_items": ["做笔记"],
                "sections": [
                    {"heading": "核心", "body": "正文内容足够长以通过校验。" * 3}
                ],
            },
            ensure_ascii=False,
        )
        with chat_completion_service(llm_json) as base_url:
            with mock.patch.dict(
                "os.environ",
                {
                    "OPENAI_API_KEY": "test-key",
                    "OPENAI_BASE_URL": base_url,
                    "OPENAI_MODEL": "test-model",
                },
                clear=True,
            ):
                client = TestClient(create_app())
                response = client.post(
                    "/wechat-articles/generate",
                    files={
                        "file": (
                            "book.pdf",
                            _sample_pdf_bytes(
                                "深度工作强调专注的重要性。作者卡尔纽波特提出四种深度工作哲学。"
                            ),
                            "application/pdf",
                        )
                    },
                    data={"book_title": "测试书"},
                )

        body = response.json()
        self.assertEqual(200, response.status_code)
        self.assertEqual("llm", body["generator"])
        self.assertEqual("LLM 生成的公众号标题", body["title"])


if __name__ == "__main__":
    unittest.main()
