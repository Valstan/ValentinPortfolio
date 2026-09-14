import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { JsonLd } from '@/components/JsonLd';
import { Metrika } from '@/components/Metrika';
import { absoluteUrl, OG_IMAGE, PERSON, SITE_ORIGIN } from '@/content/site';
import { graph, personNode, websiteNode } from '@/lib/jsonld';

const title = `${PERSON.name} — ${PERSON.jobTitle.toLowerCase()}`;

/**
 * Заголовок главной отличается от бренд-строки намеренно (14.09, п. 3 чек-листа
 * SEO/GEO Мозга от 12.09). «Full-cycle разработчик» — как владелец себя называет, и
 * это остаётся в h1, в `jobTitle` и в JSON-LD. Но искать так не будут: живой запрос,
 * названный владельцем, — «разработчик сайтов Малмыж». В `<title>` нужны слова из
 * запроса, поэтому здесь — ремесло и место, а самоназвание живёт на странице.
 */
const seoTitle = `${PERSON.name} — разработчик сайтов и учётных систем, Малмыж`;

/**
 * География — в самом описании, а не только в поле `areaServed`: по запросу вида
 * «разработчик сайтов Кировская область» сайту раньше было нечем совпасть ни в
 * заголовке, ни в описании ни на одной из страниц.
 */
const description =
  'Проектирую, пишу и вывожу в прод рабочие продукты целиком: сайты и порталы с админкой, настольные учётные системы, сервисы автоматизации, мобильные PWA. Заказчики — учреждения и бизнес Малмыжа и Кировской области, работаю и удалённо по России. Ниже — системы, которые уже работают.';

export const metadata: Metadata = {
  // Все относительные URL в метаданных резолвятся от punycode-origin (G133/G134).
  metadataBase: new URL(SITE_ORIGIN),
  title: { default: seoTitle, template: `%s — ${PERSON.name}` },
  description,
  applicationName: title,
  authors: [{ name: PERSON.name, url: absoluteUrl('/') }],
  creator: PERSON.name,
  alternates: {
    canonical: '/',
    // Машинные выходы сайта объявлены ссылкой в <head>. Раньше на /llms.txt и
    // /facts.json не вело ничего: найти их можно было только угадав адрес, а
    // ИИ-краулеры адреса не угадывают — они ходят по объявленным.
    types: {
      'text/plain': absoluteUrl('/llms.txt'),
      'application/json': absoluteUrl('/facts.json'),
    },
  },
  openGraph: {
    type: 'profile',
    locale: 'ru_RU',
    url: absoluteUrl('/'),
    siteName: title,
    title,
    description,
    images: [OG_IMAGE],
  },
  twitter: { card: 'summary_large_image', title, description, images: [OG_IMAGE.url] },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <div className="page-atmosphere" aria-hidden="true">
          <span className="page-atmosphere__orb page-atmosphere__orb--one" />
          <span className="page-atmosphere__orb page-atmosphere__orb--two" />
          <span className="page-atmosphere__sigil page-atmosphere__sigil--one" />
          <span className="page-atmosphere__sigil page-atmosphere__sigil--two" />
        </div>
        <a className="skip-link" href="#main">
          К основному содержанию
        </a>
        <div className="page">
          <Header />
          <main id="main">{children}</main>
          <Footer />
        </div>
        {/* Person + WebSite описываются один раз на весь сайт; остальные узлы ссылаются по @id. */}
        <JsonLd json={graph(personNode(), websiteNode())} />
        <Metrika />
      </body>
    </html>
  );
}
