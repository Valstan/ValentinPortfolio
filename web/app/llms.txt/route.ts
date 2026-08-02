import { absoluteUrl, PERSON, SITE_HOST_DISPLAY } from '@/content/site';
import { WORKS, GROUP_ORDER, GROUP_TITLES } from '@/content/works';
import { SERVICES } from '@/content/services';
import { TASKS } from '@/content/tasks';

// Карта сайта для ИИ-краулеров (#051). Генерируется из тех же данных, что и страницы, —
// расходиться с сайтом не может. force-static: при output:'export' роут запекается в файл.
export const dynamic = 'force-static';

export function GET(): Response {
  const lines: string[] = [
    `# ${PERSON.name} — ${PERSON.jobTitle.toLowerCase()}`,
    '',
    `> Портфолио разработчика: системы, которые работают в проде. Сайт: ${SITE_HOST_DISPLAY} (${absoluteUrl('/')}).`,
    '> Проектирование, разработка и вывод в прод целиком: архитектура, фронтенд и бэкенд, база данных, CI/CD, эксплуатация на российских серверах.',
    `> География: ${PERSON.areaServed}.`,
    '> Все факты ниже снабжены датой замера. verify=external — читатель может проверить сам; verify=measured — замер автора.',
    `> Машиночитаемые факты: ${absoluteUrl('/facts.json')}. Полный текст сайта: ${absoluteUrl('/llms-full.txt')}.`,
    '',
    '## С какой задачей приходят',
    '',
    ...TASKS.map((task) => `- **${task.question}** — ${absoluteUrl(`/zadachi/${task.slug}/`)}`),
    '',
    '## Классы задач',
    '',
    ...SERVICES.map((s) => `- **${s.title}** — ${s.need.toLowerCase()}. ${s.body}`),
    '',
  ];

  for (const group of GROUP_ORDER) {
    const works = WORKS.filter((w) => w.group === group);
    if (works.length === 0) continue;
    lines.push(`## ${GROUP_TITLES[group]}`, '');
    for (const work of works) {
      lines.push(`### ${work.title} — ${work.tagline}`);
      lines.push('');
      lines.push(`- Страница: ${absoluteUrl(`/raboty/${work.slug}/`)}`);
      if (work.prodUrl) {
        lines.push(`- Работающий сайт: ${new URL(work.prodUrl).href} (${work.prodLabel})`);
      }
      lines.push(`- Статус: ${work.status}`);
      lines.push(`- Стек: ${work.stack}`);
      lines.push(`- Что даёт: ${work.whatItGives}`);
      for (const fact of work.facts) {
        const kind = fact.verify === 'external' ? 'проверяется снаружи' : 'замер автора';
        lines.push(`- Факт (${kind}, ${fact.asOf}): ${fact.claim}`);
      }
      if (work.noScreenshotReason) {
        lines.push(`- Почему нет скриншотов: ${work.noScreenshotReason}`);
      }
      lines.push('');
    }
  }

  lines.push('## Как связаться', '', `Контакты — ${absoluteUrl('/kontakty/')}.`, '');

  return new Response(lines.join('\n'), {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}
