import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/content/site';
import { TASKS } from '@/content/tasks';
import { VISIBLE_WORKS } from '@/content/works';

// ⚠️ G12: строго в корне app/. После сборки проверять строку `/sitemap.xml` в route-таблице.

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: absoluteUrl('/'), changeFrequency: 'monthly', priority: 1 },
    { url: absoluteUrl('/raboty/'), changeFrequency: 'monthly', priority: 0.9 },
    { url: absoluteUrl('/uslugi/'), changeFrequency: 'monthly', priority: 0.8 },
    { url: absoluteUrl('/kontakty/'), changeFrequency: 'yearly', priority: 0.7 },
    { url: absoluteUrl('/zadachi/'), changeFrequency: 'monthly' as const, priority: 0.9 },
    ...TASKS.map((task) => ({
      url: absoluteUrl(`/zadachi/${task.slug}/`),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...VISIBLE_WORKS.map((work) => ({
      url: absoluteUrl(`/raboty/${work.slug}/`),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];
}
