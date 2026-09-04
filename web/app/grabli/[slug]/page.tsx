import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/JsonLd';
import { GOTCHAS, gotchaBySlug } from '@/content/gotchas';
import { breadcrumbNode, graph, techArticleNode } from '@/lib/jsonld';
import { pageMetadata } from '@/lib/metadata';

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return GOTCHAS.map((gotcha) => ({ slug: gotcha.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const gotcha = gotchaBySlug(slug);
  if (!gotcha) return {};
  return pageMetadata({
    // Заголовок — симптом целиком: именно этими словами такое ищут.
    title: gotcha.symptom,
    description: `${gotcha.where}. ${gotcha.cause}`.slice(0, 300),
    path: `/grabli/${gotcha.slug}/`,
    ogTitle: gotcha.symptom,
  });
}

export default async function GotchaPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const gotcha = gotchaBySlug(slug);
  if (!gotcha) notFound();

  const others = GOTCHAS.filter((item) => item.slug !== gotcha.slug).slice(0, 3);

  return (
    <>
      <div className="wrap crumbs">
        <Link href="/">Главная</Link>
        <span>/</span>
        <Link href="/grabli/">Журнал грабель</Link>
        <span>/</span>
        <span>{gotcha.symptom}</span>
      </div>

      <div className="wrap work-head">
        <h1>{gotcha.symptom}</h1>
        <p className="note note--plain">
          {gotcha.where} · встретил {gotcha.metAt}
        </p>
      </div>

      <section className="wrap section section--flush">
        <div className="prose">
          <h2>Почему так происходит</h2>
          <p>{gotcha.cause}</p>

          <h2>Что делать</h2>
          <p>{gotcha.fix}</p>

          <h2>Как убедиться, что дело именно в этом</h2>
          <p>{gotcha.check}</p>

          <h2>Чем это кончается, если не заметить</h2>
          <p>{gotcha.cost}</p>
        </div>
      </section>

      <section className="wrap section">
        <div className="section__head">
          <h2>Рядом</h2>
        </div>
        <div className="tasks">
          {others.map((item) => (
            <Link key={item.slug} href={`/grabli/${item.slug}/`} className="task-tile">
              <span className="task-tile__q">{item.symptom}</span>
              <span className="task-tile__where">{item.where}</span>
            </Link>
          ))}
        </div>
        <div className="hero__actions">
          <Link href="/grabli/" className="btn btn--ghost">
            Все грабли
          </Link>
          <Link href="/kontakty/" className="btn btn--primary">
            Обсудить задачу
          </Link>
        </div>
      </section>

      <JsonLd
        json={graph(
          breadcrumbNode([
            { name: 'Главная', path: '/' },
            { name: 'Журнал грабель', path: '/grabli/' },
            { name: gotcha.symptom, path: `/grabli/${gotcha.slug}/` },
          ]),
          techArticleNode(gotcha),
        )}
      />
    </>
  );
}
