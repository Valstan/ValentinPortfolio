import type { Metadata } from 'next';
import { absoluteUrl, OG_IMAGE, PERSON } from '@/content/site';

/**
 * Метаданные страницы одним вызовом.
 *
 * Почему хелпер, а не `metadata` руками на каждой странице: Next **не сливает
 * `openGraph` глубоко**. Если дочерняя страница задала `title`/`description`, но не
 * задала `openGraph`, она наследует родительский блок ЦЕЛИКОМ — вместе с `og:title`
 * и `og:url` главной. До 04.09 так и было на пяти типах страниц из семи: при шаринге
 * любой внутренней страницы и в ответах ИИ-ассистентов всплывал заголовок главной,
 * а ссылка вела на корень. Ошибка тихая — в разметке всё «есть», просто не то.
 *
 * Поэтому единственный способ не наступить на это снова — не писать `openGraph`
 * руками нигде, а собирать его здесь из `path`.
 */
export function pageMetadata({
  title,
  description,
  path,
  ogTitle,
  index = true,
}: {
  title: string;
  description: string;
  /** Путь со слэшем на конце — он же canonical и og:url. */
  path: string;
  /** Заголовок для соцсетей, если он должен отличаться от `<title>`. */
  ogTitle?: string;
  /** false — страница не для индекса (например, 404). */
  index?: boolean;
}): Metadata {
  // Тот же вид, что даёт корневой шаблон `%s — Имя`: og:title шаблон не применяет,
  // поэтому полное имя собирается здесь явно.
  const fullTitle = ogTitle ?? `${title} — ${PERSON.name}`;
  const url = absoluteUrl(path);

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'article',
      locale: 'ru_RU',
      url,
      siteName: `${PERSON.name} — ${PERSON.jobTitle.toLowerCase()}`,
      title: fullTitle,
      description,
      // images тоже не наследуются при заданном openGraph — без этой строки
      // внутренние страницы теряли бы картинку, которую только что получила главная.
      images: [OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [OG_IMAGE.url],
    },
    ...(index ? {} : { robots: { index: false, follow: true } }),
  };
}
