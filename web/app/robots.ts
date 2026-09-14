import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/content/site';

// ⚠️ G12: metadata-роуты обязаны лежать в КОРНЕ app/, не в route-group — иначе молча не генерятся.
// После сборки проверять строку `/robots.txt` в route-таблице.

/** ИИ-боты пускаются явно: половина поиска исполнителя идёт через LLM, а они цитируют, а не ранжируют (#051). */
const AI_BOTS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-Web',
  'PerplexityBot',
  'Google-Extended',
  'Applebot-Extended',
  'YandexAdditional',
];

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      ...AI_BOTS.map((userAgent) => ({ userAgent, allow: '/' })),
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    // `Host:` не ставим намеренно: Яндекс отменил директиву в 2018 году и с тех пор
    // определяет главное зеркало по 301 и `rel=canonical`. Строка в robots.txt ничего
    // не решает, но читается как действующая настройка — и разойдётся с реальностью
    // молча, если главное имя когда-нибудь сменится.
  };
}
