import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/JsonLd';
import { SERVICES } from '@/content/services';
import { workBySlug } from '@/content/works';
import { breadcrumbNode, graph } from '@/lib/jsonld';

export const metadata: Metadata = {
  title: 'Услуги',
  description:
    'Сайты и порталы под ключ, настольные учётные системы, сервисы автоматизации, мобильные PWA с пуш-уведомлениями, единый вход и 152-ФЗ, вывод в прод на российских серверах.',
  alternates: { canonical: '/uslugi/' },
};

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
        )}
      />
    </>
  );
}
