import type { Metadata } from 'next';
import Link from 'next/link';

/**
 * 404 обязана быть исключена из индекса и не тянуть canonical корня.
 * Без этого блока она наследовала `alternates.canonical: '/'` и `robots.index: true`
 * из корневого layout: страница-ошибка объявляла себя копией главной и просила
 * себя проиндексировать. При static export это `404.html`.
 */
export const metadata: Metadata = {
  title: 'Страница не найдена',
  description: 'Такого адреса на сайте нет — начните с каталога работ.',
  alternates: { canonical: null },
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <section className="wrap section section--flush">
      <div className="section__head">
        <h1>Страница не найдена</h1>
        <p className="section__lede">
          Такого адреса на сайте нет. Возможно, ссылка устарела — начните с каталога работ.
        </p>
      </div>
      <div className="hero__actions">
        <Link href="/raboty/" className="btn btn--primary">
          К работам
        </Link>
        <Link href="/" className="btn btn--ghost">
          На главную
        </Link>
      </div>
    </section>
  );
}
