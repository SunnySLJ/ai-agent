import Link from "next/link";
import { BookOpen, FileText, StickyNote } from "lucide-react";
import type { ResourceLink } from "@/lib/docs/resolve-links";
import { cn } from "@/lib/utils";

const ICONS = {
  material: FileText,
  note: StickyNote,
} as const;

type ResourceLinksProps = {
  links: ResourceLink[];
  className?: string;
};

export function ResourceLinks({ links, className }: ResourceLinksProps) {
  if (!links.length) return null;

  return (
    <div className={cn("mt-2 flex flex-wrap gap-2", className)}>
      {links.map((link) => {
        const Icon = ICONS[link.kind] ?? BookOpen;
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] transition-colors hover:bg-[var(--color-bg-hover)]",
              link.kind === "material"
                ? "border-[var(--color-brand-500)]/40 text-[var(--color-brand-400)]"
                : "border-[var(--color-border)] text-[var(--color-text-muted)]"
            )}
          >
            <Icon size={10} />
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}
