# 40 Testing

| skill | 状态 | 用途 |
|---|---|---|
| `shuang-router` | canonical | 判定测试缺口类型并路由 |
| `shuang-blueprint` | reference | 测试体系蓝本、风险分级、发布门 |
| `shuang-backend` | executor | 后端真实数据、鉴权、并发、韧性补测 |
| `shuang-frontend` | executor | 前端视觉、交互、可访问性、契约、回归补测 |
| `shuang-slice` | executor | 局部前后端接缝测试 |
| `shuang-chain` | executor | 跨 feature 完整链路 E2E |

保持 router/executor 架构，不合并 executor。
