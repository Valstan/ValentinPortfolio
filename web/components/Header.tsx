import Link from 'next/link';
import { PERSON, SERVICES_CATALOG_URL } from '@/content/site';

export function Header() {
  return (
    <header className="site-header">
      <div className="wrap site-header__inner">
        <Link href="/" className="brand">
          <span className="brand__mark" aria-hidden="true">VS</span>
          <span className="brand__copy">
            {PERSON.name}
            <span>{PERSON.jobTitle.toLowerCase()}</span>
          </span>
        </Link>
        <nav className="nav" aria-label="Основная навигация">
          <Link href="/zadachi/">Задачи</Link>
          <Link href="/raboty/">Работы</Link>
          <Link href="/uslugi/">Услуги</Link>
          <Link href="/kontakty/">Контакты</Link>
          {/* Стандарт онбординга сервиса: кнопка каталога сервисов Малмыжа */}
          <a href={SERVICES_CATALOG_URL} rel="noopener">
            Сервисы Малмыжа&nbsp;↗
          </a>
        </nav>
      </div>
    </header>
  );
}
