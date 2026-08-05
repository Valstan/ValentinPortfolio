import type { Shot } from '@/content/works';

/**
 * Рамка со снимком. Пропорция фиксирована, поэтому сайты и программы любой длины
 * дают ровную сетку карточек. Шапка браузера рисуется только там, где есть адрес:
 * у настольной программы адреса нет, и рисовать браузер вокруг неё было бы враньём.
 */
export function ShotFrame({
  dir,
  shot,
  title,
  eager = false,
  withCaption = false,
}: {
  dir: string;
  shot: Shot;
  title: string;
  eager?: boolean;
  withCaption?: boolean;
}) {
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
        alt={`${title}: ${shot.caption.toLowerCase()}. Снимок 2026 года`}
        width={wide ? 1280 : 750}
        height={wide ? 800 : 1440}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
      />
    </div>
  );

  if (!withCaption) return frame;

  return (
    <figure className="shot-fig">
      {frame}
      <figcaption>{shot.caption}</figcaption>
    </figure>
  );
}
