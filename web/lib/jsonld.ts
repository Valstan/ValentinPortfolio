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
    // География — на самом узле, а не только внутри contactPoint (там она была
    // спрятана от любого, кто читает граф по сущности «человек»). Без этого модели
    // нечем связать имя автора с регионом: на вопрос «разработчик в Кировской
    // области» сайту было нечем совпасть. `address`/`homeLocation` намеренно НЕ
    // добавлены: точного адреса у частного исполнителя нет, а выдуманный хуже
    // отсутствующего.
    areaServed: PERSON.areaServed,
    knowsLanguage: 'ru-RU',
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
    ...(CONTACTS.phone ? { telephone: CONTACTS.phone } : {}),
    // ContactPoint — то, что ассистент цитирует, когда его спрашивают «как связаться»
    ...(CONTACTS.phone || CONTACTS.email
      ? {
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'Обсуждение задачи',
            areaServed: 'RU',
            availableLanguage: 'ru',
            ...(CONTACTS.phone ? { telephone: CONTACTS.phone } : {}),
            ...(CONTACTS.email ? { email: CONTACTS.email } : {}),
          },
        }
      : {}),
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

/**
 * Самый свежий замер работы — он же дата последнего обновления сведений о ней.
 *
 * Берётся из `facts[].asOf`, а не из даты сборки: сборка меняется от любой правки
 * вёрстки, а `dateModified` должен означать «сведения проверялись», иначе он врёт
 * бодрым числом на невычитанной карточке.
 */
function lastVerified(work: Work): string | undefined {
  const dates = work.facts.map((f) => f.asOf).sort();
  return dates.length > 0 ? dates[dates.length - 1] : undefined;
}

export function creativeWorkNode(work: Work): JsonLdNode {
  const verified = lastVerified(work);
  // Первый кадр — обложка работы. Без image ассистенты и поиск показывают карточку
  // без картинки, а у нас кадры прода лежат готовыми.
  const cover = work.shots?.items[0]
    ? absoluteUrl(`/shots/${work.shots.dir}/${work.shots.items[0].file}`)
    : undefined;

  return {
    // Тип по существу работы, а не «всё подряд CreativeWork»: настольная учётная
    // система, устанавливаемое приложение и сайт — разные сущности, и модель,
    // отвечая «чем автор занимается», разбирает их по-разному.
    '@type': work.schemaType ?? 'CreativeWork',
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
    ...(cover ? { image: cover } : {}),
    ...(verified ? { dateModified: verified } : {}),
    ...(work.prodUrl ? { sameAs: new URL(work.prodUrl).href } : {}),
  };
}

/**
 * Каталог как список — иначе для машины страница `/raboty/` просто текст, и порядок
 * с составом работ приходится угадывать из вёрстки.
 */
export function itemListNode(
  id: string,
  items: { name: string; path: string }[],
): JsonLdNode {
  return {
    '@type': 'ItemList',
    '@id': absoluteUrl(id),
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      url: absoluteUrl(item.path),
    })),
  };
}

/**
 * Услуги как предложения. До этого шесть классов задач существовали только текстом:
 * на вопрос «что этот человек делает и для кого» в графе не было ни одного узла.
 * `areaServed` повторён на каждой услуге осознанно — фрагмент должен быть
 * самодостаточным, ассистент цитирует одну услугу, а не всю страницу.
 */
export function offerCatalogNode(
  services: { id: string; title: string; need: string; body: string }[],
): JsonLdNode {
  return {
    '@type': 'OfferCatalog',
    '@id': absoluteUrl('/uslugi/#catalog'),
    name: 'Классы задач',
    url: absoluteUrl('/uslugi/'),
    numberOfItems: services.length,
    itemListElement: services.map((service, index) => ({
      '@type': 'Offer',
      position: index + 1,
      itemOffered: {
        '@type': 'Service',
        '@id': absoluteUrl(`/uslugi/#${service.id}`),
        name: service.title,
        description: `${service.need}. ${service.body}`,
        serviceType: service.title,
        areaServed: PERSON.areaServed,
        provider: { '@id': PERSON_ID },
        inLanguage: 'ru-RU',
      },
    })),
  };
}

/**
 * Страница задач — готовый вопрос-ответ: шесть формулировок словами заказчика и
 * ответ по каждой. `FAQPage` — тот тип, который генеративные движки цитируют
 * охотнее всего, потому что вопрос и ответ в нём уже разделены за них.
 */
export function faqPageNode(
  items: { question: string; answer: string; path: string }[],
): JsonLdNode {
  return {
    '@type': 'FAQPage',
    '@id': absoluteUrl('/zadachi/#faq'),
    url: absoluteUrl('/zadachi/'),
    inLanguage: 'ru-RU',
    isPartOf: { '@id': SITE_ID },
    about: { '@id': PERSON_ID },
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      url: absoluteUrl(item.path),
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
        url: absoluteUrl(item.path),
      },
    })),
  };
}

/**
 * Запись журнала грабель как техническая статья.
 *
 * `TechArticle` — а не общий `Article`: у записи есть узкая тема, названная версия
 * инструмента и проверка. Это тот вид ответа, который генеративные движки цитируют
 * с указанием источника, потому что заменить его пересказом из своих весов нельзя.
 */
export function techArticleNode(gotcha: {
  slug: string;
  symptom: string;
  where: string;
  cause: string;
  fix: string;
  metAt: string;
}): JsonLdNode {
  return {
    '@type': 'TechArticle',
    '@id': absoluteUrl(`/grabli/${gotcha.slug}/#article`),
    headline: gotcha.symptom,
    name: gotcha.symptom,
    description: gotcha.cause,
    articleSection: gotcha.where,
    about: gotcha.where,
    url: absoluteUrl(`/grabli/${gotcha.slug}/`),
    datePublished: gotcha.metAt,
    dateModified: gotcha.metAt,
    inLanguage: 'ru-RU',
    author: { '@id': PERSON_ID },
    publisher: { '@id': PERSON_ID },
    isPartOf: { '@id': SITE_ID },
    proficiencyLevel: 'Expert',
    // Вопрос-ответ внутри статьи: симптом — это запрос, которым её найдут.
    mainEntity: {
      '@type': 'Question',
      name: gotcha.symptom,
      acceptedAnswer: { '@type': 'Answer', text: `${gotcha.cause} ${gotcha.fix}` },
    },
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
