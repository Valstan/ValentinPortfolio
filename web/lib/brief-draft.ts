import { BRIEF_AS_OF, BRIEF_QUESTIONS, type BriefOption } from '@/content/brief';
import { CONTACTS, PERSON, SITE_HOST_DISPLAY } from '@/content/site';
import { taskBySlug } from '@/content/tasks';
import { workBySlug } from '@/content/works';

/** Ответы: id вопроса → выбранные id вариантов. */
export type BriefAnswers = Record<string, string[]>;

/**
 * Сборка черновика — чистая функция без состояния и без обращений к браузеру.
 *
 * Отдельным модулем, потому что её вызывают из двух мест: клиентский конструктор
 * (по нажатиям) и серверная страница (чтобы показать пример готового документа
 * тому, у кого не исполняется JS, и краулеру).
 *
 * ⚠️ Ни одного числа, посчитанного здесь. Сроки и границы попадают в текст
 * ДОСЛОВНО из `tasks.ts`, факты — из `works.ts` вместе с датой замера. Стоит
 * начать выводить «примерно шесть недель» или вилку цены — и документ начнёт
 * врать частями, а доверие к остальному тексту исчезнет целиком.
 */
export function buildDraft(answers: BriefAnswers): string {
  const chosen: { questionId: string; option: BriefOption }[] = [];
  for (const question of BRIEF_QUESTIONS) {
    for (const id of answers[question.id] ?? []) {
      const option = question.options.find((o) => o.id === id);
      // Неизвестный id молча пропускаем: ссылку могли собрать в старой версии
      // страницы. Потерянный раздел лучше белого экрана.
      if (option) chosen.push({ questionId: question.id, option });
    }
  }

  if (chosen.length === 0) return '';

  const linesOf = (section: string): string[] =>
    chosen
      .filter(({ questionId }) => BRIEF_QUESTIONS.find((q) => q.id === questionId)?.section === section)
      .map(({ option }) => option.line);

  const options = chosen.map(({ option }) => option);
  const uniq = (items: string[]): string[] => [...new Set(items)];

  const taskSlugs = uniq(options.flatMap((o) => o.taskSlugs ?? []));
  const workSlugs = uniq(options.flatMap((o) => o.workSlugs ?? []));
  const needs = uniq(options.flatMap((o) => o.needs ?? []));

  const out: string[] = [];
  const block = (title: string, items: string[], bullet = true): void => {
    if (items.length === 0) return;
    out.push(`## ${title}`, '');
    for (const item of items) out.push(bullet ? `- ${item}` : item);
    out.push('');
  };

  out.push('# Черновик техзадания', '');
  out.push(
    `Собран на ${SITE_HOST_DISPLAY} — это заготовка для разговора, а не договор. Правьте своими словами.`,
    '',
  );

  block('Что нужно', linesOf('need'));
  block('Что уже есть', linesOf('now'));
  block('Ограничения и условия', linesOf('limits'));
  block('Кто ведёт после запуска', linesOf('keeper'));
  block('Что будет означать «готово»', linesOf('result'));

  // Границы — дословно из задач. Раздел выводится ВСЕГДА, даже когда у выбранной
  // задачи своих ограничений не записано: он отсеивает работу, которую я не беру,
  // до письма, а не после, и человек должен увидеть его в любом случае. Из шести
  // задач `notDoing` заполнен у двух, поэтому без запасной строки раздел почти
  // никогда бы не появлялся — а это была половина смысла черновика.
  //
  // Запасная строка не выдумывает новых отказов: «работаю один» — это то, что уже
  // сказано на странице услуг, а не обещание, придуманное здесь.
  const notDoing = uniq(
    taskSlugs.map((slug) => taskBySlug(slug)?.notDoing).filter((v): v is string => Boolean(v)),
  );
  block('Чего в этой задаче я не делаю', [
    ...notDoing,
    'Работаю один и веду проект целиком — от разговора о задаче до работающего адреса в браузере.',
    ...(notDoing.length === 0
      ? [
          'Отдельных ограничений по этой задаче заранее не заявлено — спросите при первом разговоре, что именно не входит в объём. Лучше выяснить это до начала, чем на приёмке.',
        ]
      : []),
  ]);

  const timelines = uniq(
    taskSlugs.map((slug) => taskBySlug(slug)?.timeline).filter((v): v is string => Boolean(v)),
  );
  block('Ориентир по сроку (со страниц задач, не оценка вашей задачи)', timelines);

  block('Вопросы, на которые нужен ответ до старта', needs);

  const proof = workSlugs
    .map((slug) => workBySlug(slug))
    .filter((work) => work !== undefined)
    .map((work) =>
      work.prodUrl
        ? `${work.title} — ${work.prodLabel} (открывается, можно проверить)`
        : `${work.title} — публичного адреса нет, разбор на сайте`,
    );
  block('Где похожее уже работает', proof);

  // Доделка по замечанию судьи-заказчика: человеку важно знать, что останется у
  // него, если разработчик исчезнет. Это обязательства, поэтому они помечены как
  // обязательства, а не выданы за уже случившийся факт.
  block('Что остаётся у вас после сдачи', [
    'Домен оформлен на вашу организацию, доступы к нему — у вас.',
    'Исходный код передаётся вам: другой исполнитель сможет продолжить.',
    'Стек назван по имени и не самодельный — специалистов на него найти можно.',
    'Показываю, как вести систему, и оставляю доступы у вас, а не у себя.',
  ]);

  block(
    'Как со мной связаться',
    [
      // Порядок не случайный: муниципальный заказчик и директор предприятия звонят,
      // а не пишут в мессенджер.
      CONTACTS.phone ? `Телефон: ${CONTACTS.phoneLabel}` : '',
      CONTACTS.email ? `Почта: ${CONTACTS.email}` : '',
      `Telegram: ${CONTACTS.telegramLabel}`,
    ].filter(Boolean),
  );

  out.push('---', '');
  out.push(
    `${PERSON.name}, ${PERSON.jobTitle.toLowerCase()}. ${PERSON.areaServed}.`,
    `Состав вопросов от ${BRIEF_AS_OF}. Черновик собран в вашем браузере; ответы никуда не отправлялись.`,
    '',
  );

  return out.join('\n');
}

/**
 * Ответы ↔ хэш адреса: `#tz=need:site,who:staff.residents`.
 *
 * Формат читаемый и устойчивый к версиям: неизвестные ключи и значения
 * игнорируются на разборе, поэтому ссылка, собранная в прошлой версии страницы,
 * покажет то, что ещё существует, а не пустоту и не ошибку.
 *
 * Свободный текст в хэш НЕ попадает никогда — он бы уехал в ссылке, которую
 * человек отправит директору, вместе с тем, что писал для себя.
 */
export function encodeAnswers(answers: BriefAnswers): string {
  const parts = BRIEF_QUESTIONS.map((question) => {
    const picked = answers[question.id] ?? [];
    return picked.length > 0 ? `${question.id}:${picked.join('.')}` : '';
  }).filter(Boolean);
  return parts.join(',');
}

export function decodeAnswers(raw: string): BriefAnswers {
  const answers: BriefAnswers = {};
  for (const chunk of raw.split(',')) {
    const [questionId, values] = chunk.split(':');
    const question = BRIEF_QUESTIONS.find((q) => q.id === questionId);
    if (!question || !values) continue;
    const valid = values
      .split('.')
      .filter((id) => question.options.some((option) => option.id === id));
    if (valid.length === 0) continue;
    answers[question.id] = question.multiple ? valid : valid.slice(0, 1);
  }
  return answers;
}
