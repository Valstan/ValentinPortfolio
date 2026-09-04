import type { MetadataRoute } from 'next';
import { BRIEF_AS_OF } from '@/content/brief';
import { GOTCHAS } from '@/content/gotchas';
import { absoluteUrl } from '@/content/site';
import { TASKS } from '@/content/tasks';
import { VISIBLE_WORKS, type Work } from '@/content/works';

/**
 * `lastModified` берётся из самого свежего замера работы, а НЕ из даты сборки.
 * Дата сборки менялась бы от любой правки вёрстки и обещала бы поисковику
 * обновление там, где содержание не двигалось: краулер, которого обманули так
 * несколько раз, начинает ходить реже. `asOf` двигается только когда сведения
 * действительно пересматривали.
 */
function lastVerified(work: Work): string | undefined {
  const dates = work.facts.map((fact) => fact.asOf).sort();
  return dates.length > 0 ? dates[dates.length - 1] : undefined;
}

/** Самый свежий замер по всему каталогу — дата для сводных страниц. */
const CATALOG_UPDATED = VISIBLE_WORKS.map(lastVerified)
  .filter((d): d is string => Boolean(d))
  .sort()
  .at(-1);

// ⚠️ G12: строго в корне app/. После сборки проверять строку `/sitemap.xml` в route-таблице.

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: absoluteUrl('/'), changeFrequency: 'monthly', priority: 1, lastModified: CATALOG_UPDATED },
    {
      url: absoluteUrl('/raboty/'),
      changeFrequency: 'monthly',
      priority: 0.9,
      lastModified: CATALOG_UPDATED,
    },
    { url: absoluteUrl('/uslugi/'), changeFrequency: 'monthly', priority: 0.8 },
    { url: absoluteUrl('/kontakty/'), changeFrequency: 'yearly', priority: 0.7 },
    {
      url: absoluteUrl('/tehzadanie/'),
      changeFrequency: 'monthly' as const,
      priority: 0.85,
      lastModified: BRIEF_AS_OF,
    },
    {
      url: absoluteUrl('/grabli/'),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
      lastModified: GOTCHAS.map((g) => g.metAt).sort().at(-1),
    },
    ...GOTCHAS.map((gotcha) => ({
      url: absoluteUrl(`/grabli/${gotcha.slug}/`),
      changeFrequency: 'yearly' as const,
      priority: 0.6,
      lastModified: gotcha.metAt,
    })),
    {
      url: absoluteUrl('/zadachi/'),
      changeFrequency: 'monthly' as const,
      priority: 0.9,
      lastModified: CATALOG_UPDATED,
    },
    ...TASKS.map((task) => ({
      url: absoluteUrl(`/zadachi/${task.slug}/`),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...VISIBLE_WORKS.map((work) => ({
      url: absoluteUrl(`/raboty/${work.slug}/`),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
      lastModified: lastVerified(work),
    })),
  ];
}
