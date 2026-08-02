import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/JsonLd';
import { WorkCard } from '@/components/WorkCard';
import { GROUP_ORDER, GROUP_TITLES, WORKS } from '@/content/works';
import { breadcrumbNode, graph } from '@/lib/jsonld';

export const metadata: Metadata = {
  title: 'Работы',
  description:
    'Каталог систем, доведённых до прода: сайты и порталы на Next.js и Payload CMS, настольная ERP на Electron, сервисы автоматизации на Python, мобильное PWA с пуш-уведомлениями.',
  alternates: { canonical: '/raboty/' },
};

export default function WorksPage() {
  return (
    <>
      <div className="wrap crumbs">
        <Link href="/">Главная</Link>
        <span>/</span>
        <span>Работы</span>
      </div>

      <section className="wrap section section--flush">
        <div className="section__head">
          <h1>Работы</h1>
          <p className="section__lede">
            {WORKS.length} систем: у каждой — что она даёт заказчику, как устроена внутри и в каком
            состоянии находится сейчас. Там, где сайт публичный, есть ссылка — можно открыть и
            проверить.
          </p>
        </div>
      </section>

      {GROUP_ORDER.map((group) => {
        const works = WORKS.filter((work) => work.group === group);
        if (works.length === 0) return null;
        return (
          <section key={group} className="wrap section">
            <div className="section__head">
              <h2>{GROUP_TITLES[group]}</h2>
            </div>
            <div className="works">
              {works.map((work) => (
                <WorkCard key={work.slug} work={work} />
              ))}
            </div>
          </section>
        );
      })}

      <JsonLd
        json={graph(
          breadcrumbNode([
            { name: 'Главная', path: '/' },
            { name: 'Работы', path: '/raboty/' },
          ]),
        )}
      />
    </>
  );
}
