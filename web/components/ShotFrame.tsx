import type { Shot } from '@/content/works';
import { SHOT_VARIANTS } from '@/content/shots-generated';

/**
 * `sizes` — не украшение: без него браузер считает картинку шириной во весь вьюпорт
 * и берёт из srcset самый крупный файл, то есть ровно тот, от которого мы уходим.
 * Числа взяты из вёрстки (globals.css), а не на глаз:
 *
 * - карточка работы: сетка `.works` — `minmax(min(100%, 330px), 1fr)` внутри `.wrap`
 *   (max 1120px, padding clamp(16,4vw,32)); у кадра в карточке ещё поля 9px с боков;
 * - широкий кадр на странице работы: `.work-layout` с 900px становится
 *   `minmax(0,1fr) 300px` при gap clamp(26,4vw,44) — колонка прозы упирается в 712px;
 * - телефонный кадр: `.shots-phone` — `repeat(auto-fit, minmax(200px, 240px))`,
 *   шире 240px он не бывает никогда.
 */
export const SHOT_SIZES = {
  card: '(max-width: 719px) calc(100vw - 50px), 340px',
  wide: '(max-width: 899px) calc(100vw - 32px), (max-width: 1183px) calc(100vw - 380px), 712px',
  phone: '240px',
} as const;

/**
 * Рамка со снимком. Пропорция фиксирована, поэтому сайты и программы любой длины
 * дают ровную сетку карточек. Шапка браузера рисуется только там, где есть адрес:
 * у настольной программы адреса нет, и рисовать браузер вокруг неё было бы враньём.
 */
export function ShotFrame({
  dir,
  asOf,
  shot,
  title,
  eager = false,
  withCaption = false,
  sizes,
}: {
  dir: string;
  /** ISO-дата съёмки из каталога: из неё берётся год в `alt`. */
  asOf: string;
  shot: Shot;
  title: string;
  eager?: boolean;
  withCaption?: boolean;
  /** Ширина кадра в вёрстке — берётся из `SHOT_SIZES`, см. комментарий там. */
  sizes: string;
}) {
  // Год — из каталога, а не числом в коде. «Снимок 2026 года» стояло здесь одинаковым
  // для всех кадров и никогда бы само не обновилось: первая пересъёмка в 2027-м сделала
  // бы подпись ложной разом у всех работ, не уронив ни сборку, ни тесты.
  const shotYear = asOf.slice(0, 4);
  const wide = shot.ratio === 'wide';

  // Размеры и набор копий — из манифеста, который собирается из самих файлов
  // (`scripts/gen-shots.mjs`). Раньше здесь стояли 1280×800 и 750×1440 числами, и у
  // кадров Матрицы 1600×1000 это было просто неправдой — пропорция совпадала, потому
  // и не замечали. Кадра нет в манифесте — валим сборку, а не отдаём битый srcset.
  const key = `${dir}/${shot.file}`;
  const variant = SHOT_VARIANTS[key];
  if (!variant) {
    throw new Error(
      `Кадр ${key} не сгенерирован: запустите scripts/gen-shots.mjs (его зовёт pnpm build).`,
    );
  }
  const frame = (
    <div className={wide ? 'shot' : 'shot shot--phone'}>
      {shot.address && (
        <div className="shot__chrome">
          <span className="shot__dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className="shot__addr">{shot.address}</span>
        </div>
      )}
      <img
        src={`/shots/${dir}/${shot.file}`}
        srcSet={variant.srcset}
        sizes={sizes}
        alt={`${title}: ${shot.caption.toLowerCase()}. Снимок ${shotYear} года`}
        width={variant.w}
        height={variant.h}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
      />
    </div>
  );

  if (!withCaption) return frame;

  /*
    В карточке работы снимок ещё и открывается в полном размере отдельной вкладкой.
    Колонка прозы у́же 700 px, а на этих экранах ценность именно в деталях — таблицы
    учётной системы в такой ширине не читаются. Ссылка, а не лайтбокс: у сайта static
    export, и тащить ради этого JS в браузер незачем.
  */
  return (
    <figure className="shot-fig">
      <a className="shot-fig__link" href={`/shots/${dir}/${shot.file}`} target="_blank" rel="noopener">
        {frame}
        <span className="shot-fig__zoom">Открыть в полном размере&nbsp;↗</span>
      </a>
      <figcaption>{shot.caption}</figcaption>
    </figure>
  );
}
