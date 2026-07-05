"use client";

import { useState } from "react";
import AgentConsole from "@/components/AgentConsole";
import ProjectForgeWorkbench from "@/components/ProjectForgeWorkbench";
import WechatArticleStudio from "@/components/WechatArticleStudio";

type TabId = "forge" | "wechat" | "agent";

export default function HomePage() {
  const [tab, setTab] = useState<TabId>("forge");

  return (
    <>
      <nav className="top-nav">
        <button
          type="button"
          className={tab === "forge" ? "active" : ""}
          onClick={() => setTab("forge")}
        >
          ProjectForge 工作台
        </button>
        <button
          type="button"
          className={tab === "wechat" ? "active" : ""}
          onClick={() => setTab("wechat")}
        >
          书籍 → 公众号
        </button>
        <button
          type="button"
          className={tab === "agent" ? "active" : ""}
          onClick={() => setTab("agent")}
        >
          Agent 控制台
        </button>
      </nav>
      {tab === "forge" && <ProjectForgeWorkbench />}
      {tab === "wechat" && <WechatArticleStudio />}
      {tab === "agent" && <AgentConsole />}
    </>
  );
}
