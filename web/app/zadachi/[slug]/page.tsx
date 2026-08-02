import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FactColumns } from '@/components/FactList';
import { JsonLd } from '@/components/JsonLd';
import { WorkCard } from '@/components/WorkCard';
import { TASKS, taskBySlug } from '@/content/tasks';
import { workBySlug } from '@/content/works';
import { breadcrumbNode, graph } from '@/lib/jsonld';

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return TASKS.map((task) => ({ slug: task.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const task = taskBySlug(slug);
  if (!task) return {};
  return {
    title: task.question,
    description: `${task.question}. ${task.approach[0]} Где это уже сделано: ${task.proof
      .map((s) => workBySlug(s)?.title)
      .filter(Boolean)
      .join(', ')}.`.slice(0, 300),
    alternates: { canonical: `/zadachi/${task.slug}/` },
  };
}

export default async function TaskPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const task = taskBySlug(slug);
  if (!task) notFound();

  const works = task.proof.map(workBySlug).filter((w) => w !== undefined);
  const facts = works.flatMap((w) => w.facts);

  return (
    <>
      <div className="wrap crumbs">
        <Link href="/">Главная</Link>
        <span>/</span>
        <Link href="/zadachi/">Задачи</Link>
        <span>/</span>
        <span>{task.question}</span>
      </div>

      <div className="wrap work-head">
        <h1>{task.question}</h1>
      </div>

      <section className="wrap section section--flush">
        <div className="prose">
          <h2>Как это обычно выглядит</h2>
          <ul>
            {task.symptoms.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <h2>Что я делаю</h2>
          <ul>
            {task.approach.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <h2>Сроки</h2>
          <p>{task.timeline}</p>

          {task.notDoing && (
            <>
              <h2>Чего не делаю</h2>
              <p>{task.notDoing}</p>
            </>
          )}
        </div>
      </section>

      <section className="wrap section">
        <div className="section__head">
          <h2>Где это уже сделано</h2>
        </div>
        <div className="works">
          {works.map((work) => (
            <WorkCard key={work.slug} work={work} />
          ))}
        </div>
      </section>

      {facts.length > 0 && (
        <section className="wrap section">
          <div className="section__head">
            <h2>Что по этим работам можно проверить</h2>
          </div>
          <FactColumns facts={facts} />
        </section>
      )}

      <section className="wrap section">
        <div className="section__head">
          <h2>Обсудить такую задачу</h2>
          <p className="section__lede">
            Напишите в двух словах, что нужно и для кого. Отвечу, берусь ли, за какой срок и что
            потребуется с вашей стороны.
          </p>
        </div>
        <div className="hero__actions">
          <Link href="/kontakty/" className="btn btn--primary">
            Написать
          </Link>
          <Link href="/zadachi/" className="btn btn--ghost">
            Другие задачи
          </Link>
        </div>
      </section>

      <JsonLd
        json={graph(
          breadcrumbNode([
            { name: 'Главная', path: '/' },
            { name: 'Задачи', path: '/zadachi/' },
            { name: task.question, path: `/zadachi/${task.slug}/` },
          ]),
        )}
      />
    </>
  );
}
