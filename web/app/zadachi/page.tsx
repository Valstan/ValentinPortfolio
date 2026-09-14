import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/JsonLd';
import { TASKS } from '@/content/tasks';
import { workBySlug } from '@/content/works';
import { breadcrumbNode, faqPageNode, graph } from '@/lib/jsonld';
import { pageMetadata } from '@/lib/metadata';

export const metadata: Metadata = pageMetadata({
  title: 'Задачи: с чем ко мне приходят, Малмыж',
  description:
    'С какой задачей приходят: сайт учреждению, перенос старого сайта без потери позиций, учётная система на предприятие, сайт события к дате, автоматизация публикаций, приложение без магазинов приложений. Кировская область и удалённо по России.',
  path: '/zadachi/',
});

export default function TasksPage() {
  return (
    <>
      <div className="wrap crumbs">
        <Link href="/">Главная</Link>
        <span>/</span>
        <span>Задачи</span>
      </div>

      <section className="wrap section section--flush">
        <div className="section__head">
          <h1>С какой задачей вы пришли</h1>
          <p className="section__lede">
            Шесть типов задач, с которыми ко мне обращаются. У каждой — своя страница: как задача
            выглядит изнутри организации, что я по ней делаю, где это уже сделано и за какой срок.
          </p>
        </div>
        <p className="note note--plain">
          {/* <a>, не Link: на конструктор — только полной загрузкой, см. BriefBuilder */}
          Не уверены, какая из них ваша? <a href="/tehzadanie/">Соберите черновик техзадания</a>{' '}
          — восемь вопросов, и задача опишется сама.
        </p>
        <div className="tasks">
          {TASKS.map((task) => (
            <Link key={task.slug} href={`/zadachi/${task.slug}/`} className="task-tile">
              <span className="task-tile__q">{task.question}</span>
              <span className="task-tile__where">
                где сделано: {task.proof.map((s) => workBySlug(s)?.title).filter(Boolean).join(' · ')}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <JsonLd
        json={graph(
          breadcrumbNode([
            { name: 'Главная', path: '/' },
            { name: 'Задачи', path: '/zadachi/' },
          ]),
          // Шесть задач — это уже готовые вопрос-ответ, и FAQPage разделяет их за
          // цитирующую сторону. Ответ собирается из первого шага подхода и ориентира
          // по срокам: фрагмент должен быть понятен вырезанным из страницы.
          faqPageNode(
            TASKS.map((task) => ({
              question: task.question,
              answer: `${task.approach[0]} ${task.timeline}`,
              path: `/zadachi/${task.slug}/`,
            })),
          ),
        )}
      />
    </>
  );
}
