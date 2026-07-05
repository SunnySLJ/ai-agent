import { MaterialDetailClient } from "@/components/materials/material-detail-client";

type PageProps = { params: Promise<{ id: string }> };

export default async function MaterialPage({ params }: PageProps) {
  const { id } = await params;
  return <MaterialDetailClient materialId={id} />;
}
