import { DocEditor } from "@/components/docs/doc-editor";

type PageProps = { params: Promise<{ segments: string[] }> };

export default async function DocFilePage({ params }: PageProps) {
  const { segments } = await params;
  const filePath = segments.map(decodeURIComponent).join("/");

  return <DocEditor filePath={filePath} />;
}
