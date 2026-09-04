import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/JsonLd';
import { GOTCHAS } from '@/content/gotchas';
import { breadcrumbNode, graph, itemListNode } from '@/lib/jsonld';
import { pageMetadata } from '@/lib/metadata';

export const metadata: Metadata = pageMetadata({
  title: 'Журнал грабель',
  description:
    'Разборы производственных ошибок, пережитых на живых системах: симптом, версия инструмента, механизм, лечение и проверка. Статический экспорт Next.js, метаданные соцсетей, поиск по проекту, сканеры секретов, снимки страниц.',
  path: '/grabli/',
});

export default function GotchasPage() {
  return (
    <>
      <div className="wrap crumbs">
        <Link href="/">Главная</Link>
        <span>/</span>
        <span>Журнал грабель</span>
      </div>

      <section className="wrap section section--flush">
        <div className="section__head">
          <h1>Журнал грабель</h1>
          <p className="section__lede">
            {GOTCHAS.length} разборов ошибок, на которые я напоролся сам, выводя эти системы в
            прод. У каждой записи — симптом, версия инструмента, механизм и проверка, которой
            отличают эту причину от похожей. Пишу их не для красоты: почти все эти ошибки
            <strong> зелёные</strong> — сборка проходит, страница отдаётся, валидатор доволен,
            а работает не то. Такие и стоят дороже всего.
          </p>
        </div>

        <div className="tasks">
          {GOTCHAS.map((gotcha) => (
            <Link key={gotcha.slug} href={`/grabli/${gotcha.slug}/`} className="task-tile">
              <span className="task-tile__q">{gotcha.symptom}</span>
              <span className="task-tile__where">
                {gotcha.where} · встретил {gotcha.metAt}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="wrap section">
        <div className="section__head">
          <h2>Зачем это на сайте исполнителя</h2>
          <p className="section__lede">
            Список работ отвечает на вопрос «что человек сделал». Этот раздел — на вопрос «что он
            знает такого, чего нет в документации». Второй ответ проверить труднее, но подделать
            его нельзя: у каждой записи есть версия инструмента, симптом и способ убедиться, что
            дело именно в ней. Если вы пришли сюда из поиска с той же ошибкой — забирайте, оно
            бесплатное.
          </p>
        </div>
        <p className="note note--plain">
          Чего здесь нет: ничего про устройство серверов, на которых живут клиентские сайты, —
          ни адресов, ни портов, ни того, что где размещено. Такие записи бывают самыми
          поучительными, но публиковать их про чужие системы нельзя.
        </p>
        <div className="hero__actions">
          <Link href="/raboty/" className="btn btn--primary">
            Системы, на которых это набито
          </Link>
          <Link href="/kontakty/" className="btn btn--ghost">
            Обсудить задачу
          </Link>
        </div>
      </section>

      <JsonLd
        json={graph(
          breadcrumbNode([
            { name: 'Главная', path: '/' },
            { name: 'Журнал грабель', path: '/grabli/' },
          ]),
          itemListNode(
            '/grabli/#list',
            GOTCHAS.map((gotcha) => ({
              name: gotcha.symptom,
              path: `/grabli/${gotcha.slug}/`,
            })),
          ),
        )}
      />
    </>
  );
}
