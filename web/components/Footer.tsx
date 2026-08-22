import Link from 'next/link';
import {
  CONTACTS,
  FOOTER_SIGNATURE,
  METRIKA_INFORMER_SRC,
  METRIKA_STAT_URL,
  SERVICES_CATALOG_URL,
} from '@/content/site';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap site-footer__inner">
        <div className="site-footer__identity">
          <span className="site-footer__seal" aria-hidden="true">
            <img src="/brand/vs-monogram-512.png" alt="" width="512" height="512" loading="lazy" />
          </span>
          <div>
          {/* Та же подпись, что несут все сайты экосистемы; у себя — без ссылки на себя. */}
          <div className="site-footer__sig">{FOOTER_SIGNATURE}</div>
          <p className="site-footer__note">
            Проектирование, разработка и вывод в прод целиком — от базы данных до сервера с сертификатом.
          </p>
          {/*
            Видимая цифра посещаемости — требование владельца (D-017): кабинет открывают
            раз в месяц, подвал — каждый раз, когда заходишь на свой сайт.
            Размеры проставлены явно: это внешняя картинка, без width/height подвал дёргается
            при её загрузке.
          */}
          <a
            className="site-footer__counter"
            href={METRIKA_STAT_URL}
            target="_blank"
            rel="nofollow noopener"
          >
            <img
              src={METRIKA_INFORMER_SRC}
              width={88}
              height={31}
              loading="lazy"
              alt="Яндекс.Метрика"
              title="Яндекс.Метрика: данные за сегодня (просмотры, визиты и уникальные посетители)"
            />
          </a>
          </div>
        </div>
        <div className="site-footer__links">
          <Link href="/zadachi/">Задачи</Link>
          <Link href="/raboty/">Работы</Link>
          <Link href="/uslugi/">Услуги</Link>
          <Link href="/kontakty/">Контакты</Link>
          {CONTACTS.phone && <a href={`tel:${CONTACTS.phone}`}>{CONTACTS.phoneLabel}</a>}
          {CONTACTS.email && <a href={`mailto:${CONTACTS.email}`}>{CONTACTS.email}</a>}
          <a href={CONTACTS.telegram} rel="noopener">
            {CONTACTS.telegramLabel}
          </a>
          <a href={CONTACTS.github} rel="noopener">
            {CONTACTS.githubLabel}
          </a>
          <a href={SERVICES_CATALOG_URL} rel="noopener">
            Сервисы Малмыжа&nbsp;↗
          </a>
        </div>
      </div>
    </footer>
  );
}
