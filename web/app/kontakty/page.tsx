import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/JsonLd';
import { CONTACTS, PERSON } from '@/content/site';
import { breadcrumbNode, graph } from '@/lib/jsonld';

export const metadata: Metadata = {
  title: 'Контакты',
  description: `Связаться с разработчиком: ${PERSON.name}. Обсуждение задачи, сроков и стоимости.`,
  alternates: { canonical: '/kontakty/' },
};

export default function ContactsPage() {
  return (
    <>
      <div className="wrap crumbs">
        <Link href="/">Главная</Link>
        <span>/</span>
        <span>Контакты</span>
      </div>

      <section className="wrap section section--flush">
        <div className="section__head">
          <h1>Обсудить задачу</h1>
          <p className="section__lede">
            Напишите в двух словах, что нужно и для кого. Отвечу, берусь ли, за какой срок и что
            потребуется с вашей стороны. Если задача не моя — скажу прямо, а не буду тянуть.
          </p>
        </div>

        {/* Порядок не случайный: муниципальный заказчик и директор завода звонят,
            а не пишут в мессенджер. Пустое поле не рендерится. */}
        <div className="contact-list">
          {CONTACTS.phone && (
            <a href={`tel:${CONTACTS.phone}`} className="contact-row">
              <span className="contact-row__label">Телефон</span>
              <span className="contact-row__value">{CONTACTS.phoneLabel}</span>
            </a>
          )}
          {CONTACTS.email && (
            <a href={`mailto:${CONTACTS.email}`} className="contact-row">
              <span className="contact-row__label">Почта</span>
              <span className="contact-row__value">{CONTACTS.email}</span>
            </a>
          )}
          <a href={CONTACTS.telegram} className="contact-row" rel="noopener">
            <span className="contact-row__label">Telegram</span>
            <span className="contact-row__value">{CONTACTS.telegramLabel}</span>
          </a>
          <a href={CONTACTS.github} className="contact-row" rel="noopener">
            <span className="contact-row__label">Код</span>
            <span className="contact-row__value">{CONTACTS.githubLabel}</span>
          </a>
        </div>

        <div className="prose" style={{ marginTop: 40 }}>
          <h2>Что полезно приложить к первому сообщению</h2>
          <ul>
            <li>Кто будет пользоваться системой и что для них должно измениться.</li>
            <li>Есть ли сейчас сайт или программа, которую надо заменить или перенести.</li>
            <li>Кто будет вести контент после запуска — вы сами или нужен кто-то ещё.</li>
            <li>Ориентир по срокам: есть ли дата, к которой всё должно работать.</li>
          </ul>
          <p>
            География — {PERSON.areaServed}. Работаю по договору, результат передаётся вместе с
            доступами: домен, сервер и репозиторий остаются вашими.
          </p>
        </div>
      </section>

      <JsonLd
        json={graph(
          breadcrumbNode([
            { name: 'Главная', path: '/' },
            { name: 'Контакты', path: '/kontakty/' },
          ]),
        )}
      />
    </>
  );
}
