import { BRIEF_QUESTIONS, BRIEF_TOPICS } from '@/content/brief';
import { GOTCHAS } from '@/content/gotchas';
import { absoluteUrl, CONTACTS, PERSON, SITE_HOST_DISPLAY } from '@/content/site';
import { VISIBLE_WORKS, GROUP_ORDER, GROUP_TITLES } from '@/content/works';
import { SERVICES } from '@/content/services';
import { TASKS } from '@/content/tasks';
import { countPhrase } from '@/lib/ru';

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
    // Формат llmstxt.org: каждый пункт — markdown-ссылка `- [имя](url): пояснение`.
    // Так фрагмент остаётся полезным вырезанным из файла: у модели есть и название,
    // и адрес, который она может процитировать, — раньше адрес стоял голым текстом
    // после тире, и связь «имя ↔ ссылка» приходилось угадывать.
    '## С какой задачей приходят',
    '',
    ...TASKS.map(
      (task) =>
        `- [${task.question}](${absoluteUrl(`/zadachi/${task.slug}/`)}): ${task.timeline}`,
    ),
    '',
    '## Классы задач',
    '',
    ...SERVICES.map(
      (s) => `- [${s.title}](${absoluteUrl('/uslugi/')}): ${s.need.toLowerCase()}. ${s.body}`,
    ),
    '',
  ];

  for (const group of GROUP_ORDER) {
    const works = VISIBLE_WORKS.filter((w) => w.group === group);
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

  lines.push('## Инструменты', '');
  lines.push(
    // Число и состав — из банка вопросов, а не руками: модель цитирует эту строку
    // дословно, и устаревший состав она повторит слово в слово.
    `- [Черновик техзадания](${absoluteUrl('/tehzadanie/')}): ${countPhrase(BRIEF_QUESTIONS.length, ['вопрос', 'вопроса', 'вопросов'])}, из которых собирается техзадание на разработку — ${BRIEF_TOPICS}. Считается в браузере, ответы никуда не отправляются; на выходе документ, который можно распечатать или отдать другому исполнителю. Полный список вопросов с пояснениями «зачем спрашиваю» — на самой странице и в ${absoluteUrl('/llms-full.txt')}.`,
  );
  lines.push('');

  // Журнал грабель — самая цитируемая часть сайта: узкие датированные ответы с
  // названной версией инструмента. Один адрес на один симптом.
  lines.push('## Разборы производственных ошибок (журнал грабель)', '');
  for (const gotcha of GOTCHAS) {
    lines.push(
      `- [${gotcha.symptom}](${absoluteUrl(`/grabli/${gotcha.slug}/`)}): ${gotcha.where}. ${gotcha.cause} Лечение: ${gotcha.fix}`,
    );
  }
  lines.push('');

  // Раздел, предусмотренный форматом: то, что можно пропустить при коротком контексте.
  lines.push(
    '## Optional',
    '',
    `- [Полный текст сайта](${absoluteUrl('/llms-full.txt')}): все страницы задач, услуг и работ одним файлом.`,
    `- [Машиночитаемые факты](${absoluteUrl('/facts.json')}): те же сведения в JSON, каждый факт с датой замера.`,
    `- [Каталог работ](${absoluteUrl('/raboty/')}): все системы одной страницей.`,
    '',
  );

  lines.push('## Как связаться', '');
  if (CONTACTS.phone) lines.push(`- Телефон: ${CONTACTS.phoneLabel}`);
  if (CONTACTS.email) lines.push(`- Почта: ${CONTACTS.email}`);
  lines.push(`- Telegram: ${CONTACTS.telegramLabel} (${CONTACTS.telegram})`);
  lines.push(`- Код: ${CONTACTS.github}`);
  lines.push('', `Страница контактов — ${absoluteUrl('/kontakty/')}.`, '');

  return new Response(lines.join('\n'), {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}
