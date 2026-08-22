import { METRIKA_COUNTER_ID } from '@/content/site';

/**
 * Счётчик Яндекс.Метрики (мандат brain 2026-08-09, решение владельца D-017).
 *
 * Серверный компонент, как и `JsonLd`: разметка уезжает в HTML на сборке. У нас
 * static export — рантайм-переключателя счётчика заводить не надо и негде, это
 * просто скрипт в разметке.
 *
 * Тело взято из кабинета as-is; от себя подставлен только номер из единого
 * источника `site.ts`, чтобы он не разъехался с информером в подвале. Инициализация
 * (`webvisor`, `clickmap`, `trackLinks`, `accurateTrackBounce`) — та, что кабинет
 * сгенерировал под включённые в нём опции; менять её здесь, не меняя настроек
 * счётчика, значит развести код и кабинет.
 */
export function Metrika() {
  const code = `
   (function(m,e,t,r,i,k,a){
       m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
       m[i].l=1*new Date();
       for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
       k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
   })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=${METRIKA_COUNTER_ID}', 'ym');

   ym(${METRIKA_COUNTER_ID}, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", referrer: document.referrer, url: location.href, accurateTrackBounce:true, trackLinks:true});
`;

  return (
    <>
      <script type="text/javascript" dangerouslySetInnerHTML={{ __html: code }} />
      <noscript>
        <div>
          <img
            src={`https://mc.yandex.ru/watch/${METRIKA_COUNTER_ID}`}
            style={{ position: 'absolute', left: '-9999px' }}
            alt=""
          />
        </div>
      </noscript>
    </>
  );
}
