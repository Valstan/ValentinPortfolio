import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArchDiagram } from '@/components/ArchDiagram';
import { FactColumns } from '@/components/FactList';
import { JsonLd } from '@/components/JsonLd';
import { ShotFrame } from '@/components/ShotFrame';
import { StatusBadge } from '@/components/StatusBadge';
import { WORKS, workBySlug } from '@/content/works';
import { breadcrumbNode, creativeWorkNode, graph } from '@/lib/jsonld';

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return WORKS.map((work) => ({ slug: work.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const work = workBySlug(slug);
  if (!work) return {};
  return {
    title: work.title,
    description: `${work.tagline}. ${work.whatItGives}`.slice(0, 300),
    alternates: { canonical: `/raboty/${work.slug}/` },
    openGraph: {
      type: 'article',
      title: `${work.title} — ${work.tagline}`,
      description: work.whatItGives.slice(0, 300),
    },
  };
}

export default async function WorkPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const work = workBySlug(slug);
  if (!work) notFound();

  // Исходящий абсолютный URL канонизируется в punycode — юникод-хост ломает сниппеты при шаринге.
  const prodHref = work.prodUrl ? new URL(work.prodUrl).href : undefined;

  return (
    <>
      <div className="wrap crumbs">
        <Link href="/">Главная</Link>
        <span>/</span>
        <Link href="/raboty/">Работы</Link>
        <span>/</span>
        <span>{work.title}</span>
      </div>

      <div className="wrap work-head">
        <h1>{work.title}</h1>
        <p className="work-head__tagline">{work.tagline}</p>
        <div className="work-head__meta">
          <StatusBadge status={work.status} />
          {prodHref && (
            <a href={prodHref} className="btn btn--ghost" rel="noopener">
              Открыть {work.prodLabel}&nbsp;↗
            </a>
          )}
        </div>
      </div>

      <div className="wrap work-layout">
        <div className="prose">
          {work.shots ? (
            <>
              {/* Широкие экраны идут в колонку на всю ширину — вся их ценность в деталях,
                  а бок о бок они ужимаются до нечитаемого. Телефон уходит вниз узкой лентой.
                  Такая раскладка держит любой состав: один экран, два или два плюс телефон. */}
              <div className="shots-wide">
                {work.shots.items
                  .filter((shot) => shot.ratio === 'wide')
                  .map((shot) => (
                    <ShotFrame
                      key={shot.file}
                      dir={work.shots!.dir}
                      shot={shot}
                      title={work.title}
                      eager
                      withCaption
                    />
                  ))}
              </div>
              {work.shots.items.some((shot) => shot.ratio === 'phone') && (
                <div className="shots-phone">
                  {work.shots.items
                    .filter((shot) => shot.ratio === 'phone')
                    .map((shot) => (
                      <ShotFrame
                        key={shot.file}
                        dir={work.shots!.dir}
                        shot={shot}
                        title={work.title}
                        withCaption
                      />
                    ))}
                </div>
              )}
              {work.shotsNote && <p className="note note--plain">{work.shotsNote}</p>}
            </>
          ) : (
            <ArchDiagram slug={work.slug} note={work.noScreenshotReason} />
          )}

          <h2>Что даёт</h2>
          <p>{work.whatItGives}</p>

          <h2>Под капотом</h2>
          <ul>
            {work.underTheHood.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <h2>Что можно проверить</h2>
          <FactColumns facts={work.facts} />

          <h2>Что дальше</h2>
          <ul>
            {work.plans.map((plan) => (
              <li key={plan}>{plan}</li>
            ))}
          </ul>
        </div>

        <aside className="aside">
          <div className="aside__card">
            <div className="aside__label">Стек</div>
            <div className="aside__value aside__value--mono">{work.stack}</div>
          </div>
          <div className="aside__card">
            <div className="aside__label">Статус</div>
            <div className="aside__value">
              <StatusBadge status={work.status} />
            </div>
            {prodHref && (
              <>
                <div className="aside__label" style={{ marginTop: 14 }}>
                  Адрес
                </div>
                <div className="aside__value">
                  <a href={prodHref} rel="noopener">
                    {work.prodLabel}
                  </a>
                </div>
              </>
            )}
          </div>
          <div className="aside__card">
            <div className="aside__label">Нужна такая же система?</div>
            <div className="aside__value" style={{ marginBottom: 12 }}>
              Расскажите задачу — отвечу, за какой срок и что для этого нужно.
            </div>
            <Link href="/kontakty/" className="btn btn--primary">
              Написать
            </Link>
          </div>
        </aside>
      </div>

      <JsonLd
        json={graph(
          creativeWorkNode(work),
          breadcrumbNode([
            { name: 'Главная', path: '/' },
            { name: 'Работы', path: '/raboty/' },
            { name: work.title, path: `/raboty/${work.slug}/` },
          ]),
        )}
      />
    </>
  );
}
