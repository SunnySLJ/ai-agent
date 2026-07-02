import unittest

from agent_platform.agent import AgentPlatform
from agent_platform.approval import ApprovalStore


class HumanInTheLoopTest(unittest.TestCase):
    def test_create_todo_requires_approval_before_execution(self):
        platform = AgentPlatform.offline_demo(approval_store=ApprovalStore())

        response = platform.ask("创建一个待办：跟进客户 ORD-1001")

        self.assertTrue(response.approval_required)
        self.assertIsNotNone(response.approval_id)
        self.assertIn("人工确认", response.answer)
        self.assertEqual([], response.trace.tool_calls)

    def test_confirm_approval_executes_create_todo(self):
        platform = AgentPlatform.offline_demo(approval_store=ApprovalStore())
        pending = platform.ask("创建一个待办：跟进客户")

        confirmed = platform.confirm_approval(pending.approval_id)

        self.assertFalse(confirmed.refused)
        self.assertEqual(1, len(confirmed.trace.tool_calls))
        self.assertEqual("create_todo", confirmed.trace.tool_calls[0].name)
        self.assertIn("已创建待办", confirmed.answer)

    def test_read_only_tools_do_not_require_approval(self):
        platform = AgentPlatform.offline_demo(approval_store=ApprovalStore())

        response = platform.ask("查询订单 ORD-1001 的状态")

        self.assertFalse(response.approval_required)
        self.assertEqual(1, len(response.trace.tool_calls))


if __name__ == "__main__":
    unittest.main()
