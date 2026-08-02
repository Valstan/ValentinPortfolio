import Link from 'next/link';
import { JsonLd } from '@/components/JsonLd';
import { StatusBadge } from '@/components/StatusBadge';
import { WorkCard } from '@/components/WorkCard';
import { TASKS } from '@/content/tasks';
import { GROUP_ORDER, GROUP_TITLES, WORKS, workBySlug } from '@/content/works';
import { graph, profilePageNode } from '@/lib/jsonld';

/** Дата, на которую сняты все числа первого экрана. */
const AS_OF = '1 августа 2026';

const LIVE = WORKS.filter((w) => w.prodUrl && w.status === 'в проде');
const PENDING = WORKS.filter((w) => w.status === 'каркас в проде');
const NO_PUBLIC_URL = WORKS.filter((w) => !w.prodUrl);

/**
 * Числа первого экрана считаются ИЗ каталога, а не набиваются руками:
 * добавилась работа — цифра обновилась сама, разъехаться не может.
 */
const COUNTERS = [
  { num: String(WORKS.length), label: 'систем доведено до прода' },
  { num: String(LIVE.length), label: 'адресов можно открыть прямо сейчас' },
  { num: '128', label: 'страниц перенесено за один день без потери позиций' },
  { num: '13', label: 'лет летописи собрано в один архив' },
];

export default function HomePage() {
  return (
    <>
      <section className="wrap hero">
        <h1 className="hero__title">
          {WORKS.length} систем в проде. {LIVE.length} можно открыть прямо сейчас
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
          Числа сняты {AS_OF}, каждое можно проверить по ссылке ниже. Прилагательных вроде
          «качественный» и «современный» на этом сайте нет — только то, что открывается и работает.
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
            {PENDING.map((w) => w.prodLabel).join(' и ')} — каркасы в проде, ждут контента от
            учреждений. На {AS_OF} они не отвечали, поэтому в счёт открытых адресов я их не беру.
          </p>
        )}
        <p className="note note--plain">
          {NO_PUBLIC_URL.map((w) => w.title).join(', ')} тоже работают, но публичного адреса не
          имеют: заводская учётная система, внутренний сервис и личное приложение. Их разборы —
          в каталоге работ, со схемами вместо скриншотов.
        </p>
      </section>

      {GROUP_ORDER.map((group) => {
        const works = WORKS.filter((work) => work.group === group);
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
            сделано. Скриншотов заводской ERP и личного финансового сервиса нет намеренно: на их
            экранах данные живых людей и организаций, и публиковать их я не буду. Вместо них —
            схемы устройства. Счётчиков посещаемости, cookie и форм, отправляющих ваши данные
            куда-либо, на этом сайте тоже нет.
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
