import Link from 'next/link';
import { ArchDiagram } from '@/components/ArchDiagram';
import { ShotFrame } from '@/components/ShotFrame';
import { StatusBadge } from '@/components/StatusBadge';
import type { Work } from '@/content/works';

export function WorkCard({ work }: { work: Work }) {
  return (
    <Link href={`/raboty/${work.slug}/`} className="work-card">
      {work.screenshotDir ? (
        <ShotFrame dir={work.screenshotDir} domain={work.prodLabel} title={work.title} />
      ) : (
        <ArchDiagram slug={work.slug} note={work.noScreenshotReason} compact />
      )}
      <div className="work-card__body">
        <div className="work-card__title">
          <h3>{work.title}</h3>
          <StatusBadge status={work.status} />
        </div>
        <p className="work-card__tagline">{work.tagline}</p>
        <div className="work-card__meta">{work.prodLabel ?? work.stack.split(',')[0]}</div>
      </div>
    </Link>
  );
}
