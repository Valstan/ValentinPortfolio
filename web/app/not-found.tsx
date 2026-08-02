import Link from 'next/link';

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
