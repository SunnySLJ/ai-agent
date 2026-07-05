import { CourseReader } from "@/components/docs/course-reader";

type PageProps = { params: Promise<{ slug: string[] }> };

export default async function CoursePage({ params }: PageProps) {
  const { slug } = await params;
  const coursePath = slug.map(decodeURIComponent).join("/");

  return <CourseReader coursePath={coursePath} />;
}
