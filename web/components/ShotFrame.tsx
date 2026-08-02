/**
 * Рамка со снимком: минимальная шапка браузера с настоящим адресом.
 * Единственный декоративный элемент сайта — и тот несёт факт, а не украшение.
 * Пропорция фиксирована, поэтому сайты любой длины дают ровную сетку карточек.
 */
export function ShotFrame({
  dir,
  variant = 'desktop',
  domain,
  title,
  eager = false,
}: {
  dir: string;
  variant?: 'desktop' | 'mobile';
  domain?: string;
  title: string;
  eager?: boolean;
}) {
  const isDesktop = variant === 'desktop';
  return (
    <div className={isDesktop ? 'shot' : 'shot shot--phone'}>
      {domain && isDesktop && (
        <div className="shot__chrome">
          <span className="shot__dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className="shot__addr">{domain}</span>
        </div>
      )}
      <img
        src={`/shots/${dir}/${variant}.jpg`}
        alt={`Главная страница сайта ${domain ?? title}, снимок 1 августа 2026, вид ${
          isDesktop ? 'на компьютере' : 'на телефоне'
        }`}
        width={isDesktop ? 1280 : 750}
        height={isDesktop ? 800 : 1440}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
      />
    </div>
  );
}
