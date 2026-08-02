import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { JsonLd } from '@/components/JsonLd';
import { absoluteUrl, PERSON, SITE_ORIGIN } from '@/content/site';
import { graph, personNode, websiteNode } from '@/lib/jsonld';

const title = `${PERSON.name} — ${PERSON.jobTitle.toLowerCase()}`;
const description =
  'Проектирую, пишу и вывожу в прод рабочие продукты целиком: сайты и порталы с админкой, настольные учётные системы, сервисы автоматизации, мобильные PWA. Ниже — системы, которые уже работают.';

export const metadata: Metadata = {
  // Все относительные URL в метаданных резолвятся от punycode-origin (G133/G134).
  metadataBase: new URL(SITE_ORIGIN),
  title: { default: title, template: `%s — ${PERSON.name}` },
  description,
  applicationName: title,
  authors: [{ name: PERSON.name, url: absoluteUrl('/') }],
  creator: PERSON.name,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'profile',
    locale: 'ru_RU',
    url: absoluteUrl('/'),
    siteName: title,
    title,
    description,
  },
  twitter: { card: 'summary_large_image', title, description },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
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
      </body>
    </html>
  );
}
