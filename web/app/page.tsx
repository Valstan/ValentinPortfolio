import Link from 'next/link';
import { shownAs } from '@/components/ArchDiagram';
import { JsonLd } from '@/components/JsonLd';
import { StatusBadge } from '@/components/StatusBadge';
import { WorkCard } from '@/components/WorkCard';
import { TASKS } from '@/content/tasks';
import { GROUP_ORDER, GROUP_TITLES, VISIBLE_WORKS, workBySlug } from '@/content/works';
import { graph, profilePageNode } from '@/lib/jsonld';

/**
 * Дата замера — только для чисел, набранных руками. Числа, которые считаются из
 * каталога, датировать нельзя: они меняются вместе с ним, и любая проставленная
 * дата станет ложью на следующей же правке `works.ts` (так и вышло 04.09, когда
 * добавилась работа, а дата осталась августовской).
 */
const AS_OF_MANUAL = '5 августа 2026';

/** Всё, что открывается по своему адресу, — включая каркасы: они тоже отвечают. */
const LIVE = VISIBLE_WORKS.filter((w) => w.prodUrl);
const PENDING = VISIBLE_WORKS.filter((w) => w.status === 'каркас в проде');
const NO_PUBLIC_URL = VISIBLE_WORKS.filter((w) => !w.prodUrl);

/**
 * Работы без адреса главная описывает словами в двух местах. Абзац под «адресами»
 * собирается сам: название — из каталога, пояснение к нему — из этой карты по слагу,
 * так что перестановка работ пару не разорвёт. А раздел «Чего здесь нет» набран руками
 * и утверждает, кто из них показан кадрами, а кто схемой, — это и записано в `shown`.
 * Сборка падает, если каталог разошёлся с картой: у работы без адреса нет пояснения,
 * пояснение осталось у работы, получившей адрес, или показана она уже не тем, что
 * утверждает раздел. Так уже было: «со схемами вместо скриншотов» стояло над Матрицей
 * с девятью кадрами.
 */
const DESCRIBED_NO_URL: Record<string, { what: string; shown: 'кадры' | 'схема' }> = {
  'matrica-rmz': { what: 'заводская учётная система', shown: 'кадры' },
  sarafan: { what: 'внутренний сервис-редакция', shown: 'схема' },
  karman: { what: 'личное приложение', shown: 'схема' },
};

(function assertHomeClaims() {
  const fix = 'перепиши абзац под «адресами» и раздел «Чего здесь нет» в app/page.tsx';
  for (const work of NO_PUBLIC_URL) {
    const described = DESCRIBED_NO_URL[work.slug];
    if (!described) {
      throw new Error(`главная: «${work.title}» без публичного адреса, но словами не описана — ${fix}`);
    }
    const shown = shownAs(work);
    if (shown !== described.shown) {
      throw new Error(`главная: про «${work.title}» сказано «${described.shown}», а на витрине у неё «${shown}» — ${fix}`);
    }
  }
  for (const slug of Object.keys(DESCRIBED_NO_URL)) {
    if (!NO_PUBLIC_URL.some((w) => w.slug === slug)) {
      throw new Error(`главная: «${slug}» описана как работа без адреса, но в каталоге её такой нет — ${fix}`);
    }
  }
})();

/** «А», «А и Б», «А, Б и В». */
function listRu(items: string[]): string {
  if (items.length < 2) return items.join('');
  return `${items.slice(0, -1).join(', ')} и ${items[items.length - 1]}`;
}

const NO_URL_WHO = listRu(NO_PUBLIC_URL.map((w) => `${w.title} (${DESCRIBED_NO_URL[w.slug].what})`));
const NO_URL_HOW = (['кадры', 'схема'] as const)
  .map((form) => ({ form, titles: NO_PUBLIC_URL.filter((w) => shownAs(w) === form).map((w) => w.title) }))
  .filter((group) => group.titles.length > 0)
  .map((group) => `${listRu(group.titles)} — ${group.form === 'кадры' ? 'с экранами' : 'со схемами вместо скриншотов'}`)
  .join(', ');

/**
 * Числа первого экрана считаются ИЗ каталога, а не набиваются руками:
 * добавилась работа — цифра обновилась сама, разъехаться не может.
 */
const COUNTERS = [
  { num: String(VISIBLE_WORKS.length), label: 'систем доведено до прода' },
  { num: String(LIVE.length), label: 'адресов можно открыть прямо сейчас' },
  // «128 страниц перенесено за день» отсюда убрано 04.09: единственное доказательство —
  // сайт завода, а он скрыт с витрины до решения заказчика. Первый экран обещает
  // «каждое можно проверить по ссылке ниже», и число без открытой ссылки это обещание
  // нарушало. Утверждение живёт в разборе задачи о переносе как замер автора.
  { num: '13', label: 'лет летописи собрано в один архив' },
];

export default function HomePage() {
  return (
    <>
      <section className="wrap hero">
        <h1 className="hero__title">
          {VISIBLE_WORKS.length} систем в проде. {LIVE.length} можно открыть прямо сейчас
        </h1>
        <p className="hero__lede">
          Сайты, учётные системы и автоматизация для организаций и бизнеса. Беру задачу целиком:
          постановка, архитектура, код, база данных, вывод в прод, эксплуатация. Кировская область и
          удалённо по России.
        </p>
        <div className="hero__actions">
          <Link href="#zadachi" className="btn btn--primary">
            С какой задачей вы пришли
          </Link>
          <Link href="/tehzadanie/" className="btn btn--ghost">
            Собрать черновик техзадания
          </Link>
          <Link href="/kontakty/" className="btn btn--ghost">
            Написать
          </Link>
        </div>

        <ul className="proof">
          {COUNTERS.map((item) => (
            <li key={item.label} className="proof__item">
              <span className="proof__num">{item.num}</span>
              <span className="proof__label">{item.label}</span>
            </li>
          ))}
        </ul>
        <p className="note note--plain">
          Первые два числа сайт считает из каталога работ при сборке — разъехаться с витриной они
          не могут. Летопись — замер от {AS_OF_MANUAL}. Каждое можно проверить по ссылке ниже.
          Прилагательных вроде «качественный» и «современный» на этом сайте нет — только то, что
          открывается и работает.
        </p>
      </section>

      <section className="wrap section" id="zadachi">
        <div className="section__head">
          <span className="section__kicker">Начните отсюда</span>
          <h2>С какой задачей вы пришли</h2>
          <p className="section__lede">
            Шесть формулировок задач, а не список технологий. За каждой — система, которая уже
            работает.
          </p>
        </div>
        <div className="tasks">
          {TASKS.map((task) => {
            const first = workBySlug(task.proof[0]);
            return (
              <Link key={task.slug} href={`/zadachi/${task.slug}/`} className="task-tile">
                <span className="task-tile__q">{task.question}</span>
                <span className="task-tile__where">
                  где сделано: {task.proof.map((s) => workBySlug(s)?.title).filter(Boolean).join(' · ')}
                  {first ? '' : ''}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="wrap section">
        <div className="section__head">
          <h2>Откройте в соседней вкладке — это прод, а не демо</h2>
          <p className="section__lede">
            Ни одной ссылки на макет или тестовый стенд: всё ниже обслуживает реальных посетителей.
          </p>
        </div>
        <div className="live-grid">
          {LIVE.map((work) => (
            <a key={work.slug} href={new URL(work.prodUrl!).href} className="live-row" rel="noopener">
              <span className="live-row__domain">{work.prodLabel}</span>
              <StatusBadge status={work.status} />
            </a>
          ))}
        </div>
        {PENDING.length > 0 && (
          <p className="note">
            {PENDING.map((w) => w.prodLabel).join(' и ')} помечены янтарным намеренно: сайты
            открыты и работают, но учреждения ещё не наполнили их контентом. Показываю как есть,
            а не жду красивой картинки — заказчику полезнее видеть, с чего начинается такой сайт.
          </p>
        )}
        {NO_PUBLIC_URL.length > 0 && (
          <p className="note note--plain">
            {NO_URL_WHO} тоже работают, но публичного адреса не имеют. Их разборы — в каталоге
            работ: {NO_URL_HOW}.
          </p>
        )}
      </section>

      {GROUP_ORDER.map((group) => {
        const works = VISIBLE_WORKS.filter((work) => work.group === group);
        if (works.length === 0) return null;
        return (
          <section key={group} className="wrap section">
            <div className="section__head">
              <h2>{GROUP_TITLES[group]}</h2>
            </div>
            <div className="works">
              {works.map((work) => (
                <WorkCard key={work.slug} work={work} />
              ))}
            </div>
          </section>
        );
      })}

      <section className="wrap section">
        <div className="section__head">
          <span className="section__kicker">Чего здесь нет</span>
          <h2>Честный статус вместо обещаний</h2>
          <p className="section__lede">
            У каждой работы указан реальный статус и открытые планы — включая то, что ещё не
            сделано. Скриншотов внутреннего сервиса-редакции и личного финансового приложения нет
            намеренно: на их экранах данные живых людей и организаций, и публиковать их я не буду —
            вместо них схемы устройства. Заводская учётная система показана иначе: её экраны сняты
            на демонстрационном стенде, где база засеяна скриптом с нуля, а все фамилии,
            контрагенты, номера двигателей и суммы выдуманы; рабочая база завода не
            использовалась. Форм, которые отправляли бы ваши данные мне, здесь нет: у сайта нет
            сервера. Черновик техзадания собирается в вашем браузере, ответы остаются у вас, и
            отправляете его вы сами — если захотите. Посещаемость с 22.08.2026 считает Яндекс.Метрика — она
            ставит свои cookie, а число посетителей видно внизу любой страницы, не только мне в
            кабинете.
          </p>
        </div>
        <div className="hero__actions">
          <Link href="/kontakty/" className="btn btn--primary">
            Обсудить задачу
          </Link>
          <Link href="/raboty/" className="btn btn--ghost">
            Все работы
          </Link>
        </div>
      </section>

      <JsonLd json={graph(profilePageNode())} />
    </>
  );
}
