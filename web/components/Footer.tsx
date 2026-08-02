import Link from 'next/link';
import { CONTACTS, FOOTER_SIGNATURE, SERVICES_CATALOG_URL } from '@/content/site';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap site-footer__inner">
        <div>
          {/* Та же подпись, что несут все сайты экосистемы; у себя — без ссылки на себя. */}
          <div className="site-footer__sig">{FOOTER_SIGNATURE}</div>
          <p className="site-footer__note">
            Проектирование, разработка и вывод в прод целиком — от базы данных до сервера с сертификатом.
          </p>
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
