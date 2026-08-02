import { absoluteUrl, CONTACTS, PERSON, SITE_HOST_DISPLAY } from '@/content/site';
import type { Work } from '@/content/works';

// Граф JSON-LD связывается через @id (#051): валидаторы мёржат все скрипты страницы в один граф,
// поэтому Person/WebSite описываются один раз, а остальные узлы на них ссылаются.

export const PERSON_ID = absoluteUrl('/#person');
export const SITE_ID = absoluteUrl('/#website');

type JsonLdNode = Record<string, unknown>;

export function personNode(): JsonLdNode {
  const sameAs = [CONTACTS.github, CONTACTS.telegram].filter(Boolean);
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: PERSON.name,
    alternateName: PERSON.alternateName,
    jobTitle: PERSON.jobTitle,
    url: absoluteUrl('/'),
    knowsAbout: [
      'Next.js',
      'React',
      'TypeScript',
      'Node.js',
      'Electron',
      'PostgreSQL',
      'Python',
      'FastAPI',
      'Payload CMS',
      'CI/CD',
      'Progressive Web Apps',
      'OIDC / SSO',
    ],
    ...(sameAs.length > 0 ? { sameAs } : {}),
    ...(CONTACTS.email ? { email: CONTACTS.email } : {}),
  };
}

export function websiteNode(): JsonLdNode {
  return {
    '@type': 'WebSite',
    '@id': SITE_ID,
    url: absoluteUrl('/'),
    name: `${PERSON.name} — ${PERSON.jobTitle.toLowerCase()}`,
    alternateName: SITE_HOST_DISPLAY,
    inLanguage: 'ru-RU',
    author: { '@id': PERSON_ID },
    publisher: { '@id': PERSON_ID },
  };
}

export function creativeWorkNode(work: Work): JsonLdNode {
  return {
    '@type': 'CreativeWork',
    '@id': absoluteUrl(`/raboty/${work.slug}/#work`),
    name: work.title,
    headline: work.tagline,
    description: work.whatItGives,
    url: absoluteUrl(`/raboty/${work.slug}/`),
    inLanguage: 'ru-RU',
    creator: { '@id': PERSON_ID },
    author: { '@id': PERSON_ID },
    // Стек как ключевые слова — машиночитаемый факт, который LLM может процитировать.
    keywords: work.stack,
    ...(work.prodUrl ? { sameAs: new URL(work.prodUrl).href } : {}),
  };
}

export function breadcrumbNode(items: { name: string; path: string }[]): JsonLdNode {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function profilePageNode(): JsonLdNode {
  return {
    '@type': 'ProfilePage',
    '@id': absoluteUrl('/#profile'),
    url: absoluteUrl('/'),
    mainEntity: { '@id': PERSON_ID },
    isPartOf: { '@id': SITE_ID },
  };
}

/** Собирает документ графа. Все узлы страницы — одним скриптом. */
export function graph(...nodes: JsonLdNode[]): string {
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': nodes });
}
