// Единый источник фактов о сайте и его владельце (#051: факты в одном месте — нет дрейфа между страницами).

/** Канонический хост — только punycode (G133/G134: юникод-IDN ломает сниппеты при шаринге). */
export const SITE_ORIGIN = 'https://xn--80adkmnnb2b.xn--80adkdyec4j.xn--p1ai';

/** Человекочитаемая форма домена — только для отображения, никогда в href. */
export const SITE_HOST_DISPLAY = 'валентин.вмалмыже.рф';

export const PERSON = {
  name: 'Валентин Савиных',
  jobTitle: 'Full-cycle разработчик',
  alternateName: '@valstan',
  areaServed: 'Кировская область и удалённо по России',
} as const;

/**
 * Публичные каналы связи. Сервера у сайта нет (static export) — формы отправлять некуда,
 * поэтому лид приходит только по прямому каналу.
 *
 * ⚠️ ПЕРЕД GO-LIVE: владелец подтверждает состав. `email` намеренно пуст — личный адрес
 * не публикуется без явного решения; заполнить рабочим адресом либо оставить пустым
 * (тогда блок email не рендерится).
 */
export const CONTACTS = {
  telegram: 'https://t.me/valstan',
  telegramLabel: '@valstan',
  github: 'https://github.com/Valstan',
  githubLabel: 'github.com/Valstan',
  email: '',
} as const;

/** Каталог сервисов Малмыжа — стандарт онбординга сервиса (директива brain 2026-07-26). */
export const SERVICES_CATALOG_URL = 'https://xn--b1ae3a1a.xn--80adkdyec4j.xn--p1ai/services';

export const FOOTER_SIGNATURE = 'Сделано программистом Валентином Савиных';

/**
 * Абсолютный URL в punycode-форме. Прогонять через него ВСЕ исходящие абсолютные ссылки:
 * `new URL()` каноникализирует хост в punycode и percent-кодирует юникод в пути.
 */
export function absoluteUrl(path = '/'): string {
  return new URL(path, SITE_ORIGIN).href;
}
