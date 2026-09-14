import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/JsonLd';
import { SERVICE_TOPICS, SERVICES } from '@/content/services';
import { workBySlug } from '@/content/works';
import { breadcrumbNode, graph, offerCatalogNode } from '@/lib/jsonld';
import { pageMetadata } from '@/lib/metadata';
import { capitalize } from '@/lib/ru';

/**
 * Состав — из каталога услуг, а не руками: перечисление здесь не сверялось ни с чем,
 * и седьмой класс в него бы не попал. То же, что в описании `/zadachi/`.
 */
const DESCRIPTION = `${capitalize(SERVICE_TOPICS)}. Кировская область и удалённо по России.`;

/*
  Потолок длины — как у `/zadachi/`: собранное из данных описание растёт вместе
  с каталогом, а поисковик обрежет его на своё усмотрение, и обрыв придётся на середину
  перечисления. Пусть это заметит тот, кто добавляет класс услуг, а не читатель выдачи.
  Текущая длина — 210 знаков.
*/
const DESCRIPTION_LIMIT = 320;
if (DESCRIPTION.length > DESCRIPTION_LIMIT) {
  throw new Error(
    `/uslugi/: описание разрослось до ${DESCRIPTION.length} знаков при потолке ${DESCRIPTION_LIMIT} — перепиши фразу в app/uslugi/page.tsx, а не удлиняй перечисление`,
  );
}

export const metadata: Metadata = pageMetadata({
  title: 'Услуги: сайты и учётные системы, Малмыж',
  description: DESCRIPTION,
  path: '/uslugi/',
});

export default function ServicesPage() {
  return (
    <>
      <div className="wrap crumbs">
        <Link href="/">Главная</Link>
        <span>/</span>
        <span>Услуги</span>
      </div>

      <section className="wrap section section--flush">
        <div className="section__head">
          <h1>Чем могу быть полезен</h1>
          <p className="section__lede">
            Работаю один и веду проект целиком — от разговора о задаче до работающего адреса в
            браузере. Ниже — классы задач, за каждым стоит уже запущенная система, которую можно
            открыть и посмотреть.
          </p>
        </div>
        <div className="services">
          {SERVICES.map((service) => (
            <article key={service.id} className="service" id={service.id}>
              <h2 style={{ fontSize: '1.2rem' }}>{service.title}</h2>
              <p className="service__need">«{service.need}»</p>
              <p className="service__body">{service.body}</p>
              <div className="service__proof">
                {service.proof.map((slug) => {
                  const work = workBySlug(slug);
                  if (!work) return null;
                  return (
                    <Link key={slug} href={`/raboty/${slug}/`}>
                      {work.title}
                    </Link>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="wrap section">
        <div className="section__head">
          <span className="section__kicker">Как это обычно идёт</span>
          <h2>От задачи до работающего адреса</h2>
        </div>
        <div className="prose">
          <ul>
            <li>
              <strong>Разговор.</strong> Что за задача, кто будет пользоваться, что считается
              результатом. По итогам говорю прямо, берусь или нет, и за какой срок.
            </li>
            <li>
              <strong>Каркас в проде рано.</strong> Сначала выводится работающий минимум на реальном
              домене, дальше он наполняется. Так вы видите прогресс, а не слайды.
            </li>
            <li>
              <strong>Передача управления.</strong> Контентом занимается заказчик через админку.
              Программист для новостей и страниц не нужен.
            </li>
            <li>
              <strong>Эксплуатация.</strong> Сборка автоматическая, сертификат продлевается сам,
              после каждого обновления сайт проверяется автоматически.
            </li>
          </ul>
        </div>
        <div className="hero__actions" style={{ marginTop: 28 }}>
          <Link href="/kontakty/" className="btn btn--primary">
            Обсудить задачу
          </Link>
          <Link href="/raboty/" className="btn btn--ghost">
            Посмотреть работы
          </Link>
        </div>
      </section>

      <JsonLd
        json={graph(
          breadcrumbNode([
            { name: 'Главная', path: '/' },
            { name: 'Услуги', path: '/uslugi/' },
          ]),
          offerCatalogNode(SERVICES),
        )}
      />
    </>
  );
}
