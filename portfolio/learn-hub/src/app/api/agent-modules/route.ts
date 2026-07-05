import { NextResponse } from "next/server";
import { migrate, listAgentModules, type AgentModule } from "@/lib/db";

export type AgentModuleNode = AgentModule & { children: AgentModuleNode[] };

function buildTree(modules: AgentModule[]): AgentModuleNode[] {
  const byId = new Map<string, AgentModuleNode>();

  for (const mod of modules) {
    byId.set(mod.id, { ...mod, children: [] });
  }

  const roots: AgentModuleNode[] = [];

  for (const node of byId.values()) {
    if (node.parent_id && byId.has(node.parent_id)) {
      byId.get(node.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const sortNodes = (nodes: AgentModuleNode[]) => {
    nodes.sort((a, b) => a.name.localeCompare(b.name, "zh-CN"));
    for (const node of nodes) sortNodes(node.children);
  };

  sortNodes(roots);
  return roots;
}

export async function GET() {
  migrate();
  const modules = listAgentModules();
  const tree = buildTree(modules);
  return NextResponse.json({ modules, tree });
}
