import type { Shot } from '@/content/works';

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
}: {
  dir: string;
  /** ISO-дата съёмки из каталога: из неё берётся год в `alt`. */
  asOf: string;
  shot: Shot;
  title: string;
  eager?: boolean;
  withCaption?: boolean;
}) {
  // Год — из каталога, а не числом в коде. «Снимок 2026 года» стояло здесь одинаковым
  // для всех кадров и никогда бы само не обновилось: первая пересъёмка в 2027-м сделала
  // бы подпись ложной разом у всех работ, не уронив ни сборку, ни тесты.
  const shotYear = asOf.slice(0, 4);
  const wide = shot.ratio === 'wide';
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
        alt={`${title}: ${shot.caption.toLowerCase()}. Снимок ${shotYear} года`}
        width={wide ? 1280 : 750}
        height={wide ? 800 : 1440}
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
