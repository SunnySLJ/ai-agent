import type { Material } from "@/lib/db";

export type ResourceLink = {
  kind: "material" | "note";
  label: string;
  href: string;
  editable: boolean;
};

export function resolveLearningStepLinks(
  step: { id: string; week: string; deliverable: string | null },
  materials: Material[]
): ResourceLink[] {
  const links: ResourceLink[] = [];

  for (const m of materials.filter((x) => x.step_id === step.id)) {
    links.push({
      kind: "material",
      label: m.title,
      href: `/materials/${m.id}`,
      editable: true,
    });
  }

  links.push({
    kind: "note",
    label: "我的笔记",
    href: `/notes?week=${encodeURIComponent(step.week)}`,
    editable: true,
  });

  links.push({
    kind: "note",
    label: "+ 新建笔记",
    href: `/notes/new?week=${encodeURIComponent(step.week)}`,
    editable: true,
  });

  return links;
}

export function resolveTopicLinks(
  topic: { id: string; week: string },
  materials: Material[]
): ResourceLink[] {
  const links: ResourceLink[] = [];

  for (const m of materials.filter((x) => x.topic_id === topic.id)) {
    links.push({
      kind: "material",
      label: m.title,
      href: `/materials/${m.id}`,
      editable: true,
    });
  }

  links.push({
    kind: "note",
    label: "+ 新建笔记",
    href: `/notes/new?week=${encodeURIComponent(topic.week)}`,
    editable: true,
  });

  return links;
}
