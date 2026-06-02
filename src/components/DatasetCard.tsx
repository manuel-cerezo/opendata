import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/Badge";
import { sectorLabel } from "@/constants/sectors";
import { formatDate } from "@/lib/format";
import type { DatasetSummary } from "@/lib/api/types";

export function DatasetCard({
  dataset,
  publisherName,
}: {
  dataset: DatasetSummary;
  publisherName?: string;
}) {
  return (
    <Link
      to={`/datasets/${dataset.id}`}
      className="group block rounded-xl border border-border bg-surface p-5 transition-colors hover:border-accent"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg leading-snug text-fg group-hover:text-accent">{dataset.title}</h3>
        <span className="mt-1 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent" aria-hidden="true">→</span>
      </div>

      {dataset.description && (
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted">{dataset.description}</p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {dataset.sectors.slice(0, 3).map((s) => (
          <Badge key={s} tone="accent">{sectorLabel(s)}</Badge>
        ))}
        {dataset.formats.slice(0, 4).map((f) => (
          <Badge key={f}>{f}</Badge>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
        {publisherName && <span className="font-medium text-fg/80">{publisherName}</span>}
        {dataset.issued && <span>Alta: {formatDate(dataset.issued)}</span>}
      </div>
    </Link>
  );
}
