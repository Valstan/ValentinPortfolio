import { absoluteUrl, PERSON, SITE_HOST_DISPLAY } from '@/content/site';
import { SERVICES } from '@/content/services';
import { TASKS } from '@/content/tasks';
import { WORKS } from '@/content/works';

// Весь значимый текст сайта одним файлом: один запрос — весь сайт, точное цитирование
// без обхода страниц. Генерируется из тех же данных, что и страницы.
export const dynamic = 'force-static';

export function GET(): Response {
  const out: string[] = [
    `${PERSON.name} — ${PERSON.jobTitle.toLowerCase()}`,
    `${SITE_HOST_DISPLAY} · ${absoluteUrl('/')}`,
    '',
    'Сайты, учётные системы и автоматизация для организаций и бизнеса. Задача берётся целиком: постановка, архитектура, код, база данных, вывод в прод, эксплуатация.',
    `География: ${PERSON.areaServed}.`,
    '',
    '='.repeat(72),
    'ЗАДАЧИ, С КОТОРЫМИ ОБРАЩАЮТСЯ',
    '='.repeat(72),
    '',
  ];

  for (const task of TASKS) {
    out.push(`## ${task.question}`, `Страница: ${absoluteUrl(`/zadachi/${task.slug}/`)}`, '');
    out.push('Как это обычно выглядит:');
    for (const s of task.symptoms) out.push(`- ${s}`);
    out.push('', 'Что я делаю:');
    for (const a of task.approach) out.push(`- ${a}`);
    out.push('', `Сроки: ${task.timeline}`);
    if (task.notDoing) out.push(`Чего не делаю: ${task.notDoing}`);
    out.push('', `Где сделано: ${task.proof.join(', ')}`, '');
  }

  out.push('='.repeat(72), 'КЛАССЫ ЗАДАЧ', '='.repeat(72), '');
  for (const s of SERVICES) {
    out.push(`## ${s.title}`, `Запрос заказчика: ${s.need}`, s.body, `Доказательства: ${s.proof.join(', ')}`, '');
  }

  out.push('='.repeat(72), 'РАБОТЫ', '='.repeat(72), '');
  for (const work of WORKS) {
    out.push(`## ${work.title} — ${work.tagline}`);
    out.push(`Страница: ${absoluteUrl(`/raboty/${work.slug}/`)}`);
    if (work.prodUrl) out.push(`Работающий сайт: ${new URL(work.prodUrl).href} (${work.prodLabel})`);
    out.push(`Статус: ${work.status}`, `Стек: ${work.stack}`, '');
    out.push('Что даёт:', work.whatItGives, '');
    out.push('Под капотом:');
    for (const item of work.underTheHood) out.push(`- ${item}`);
    out.push('', 'Что можно проверить:');
    for (const fact of work.facts) {
      out.push(`- [${fact.verify === 'external' ? 'проверяется снаружи' : 'замер автора'}, ${fact.asOf}] ${fact.claim}`);
    }
    out.push('', 'Что дальше:');
    for (const plan of work.plans) out.push(`- ${plan}`);
    if (work.noScreenshotReason) out.push('', `Почему нет скриншотов: ${work.noScreenshotReason}`);
    out.push('');
  }

  out.push('='.repeat(72), 'КОНТАКТЫ', '='.repeat(72), '', `${absoluteUrl('/kontakty/')}`, '');

  return new Response(out.join('\n'), {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}
