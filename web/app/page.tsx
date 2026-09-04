import Link from 'next/link';
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
        <p className="note note--plain">
          {NO_PUBLIC_URL.map((w) => w.title).join(', ')} тоже работают, но публичного адреса не
          имеют: заводская учётная система, внутренний сервис и личное приложение. Их разборы —
          в каталоге работ, со схемами вместо скриншотов.
        </p>
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
            использовалась. Форм, собирающих ваши данные, здесь нет и не будет: у сайта нет
            сервера, отправлять их некуда. Посещаемость с 22.08.2026 считает Яндекс.Метрика — она
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
