import type { Fact } from '@/content/works';

const MONTHS = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
];

/** Дата замера словами — без неё факт на витрину не попадает. */
export function formatAsOf(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

function FactItem({ fact }: { fact: Fact }) {
  return (
    <li>
      {fact.claim}
      <time className="fact__asof" dateTime={fact.asOf}>
        замер {formatAsOf(fact.asOf)}
      </time>
    </li>
  );
}

/**
 * Два столбца с разными подписями, и это принципиально: читатель должен видеть,
 * что он может проверить сам, а где ему предлагается поверить мне на слово.
 */
export function FactColumns({ facts }: { facts: Fact[] }) {
  const external = facts.filter((f) => f.verify === 'external');
  const measured = facts.filter((f) => f.verify === 'measured');

  return (
    <div className="proof-columns">
      {external.length > 0 && (
        <div className="proof-col proof-col--external">
          <div className="proof-col__head proof-col__head--external">Проверяется снаружи</div>
          <ul>
            {external.map((fact) => (
              <FactItem key={fact.claim} fact={fact} />
            ))}
          </ul>
        </div>
      )}
      {measured.length > 0 && (
        <div className="proof-col proof-col--measured">
          <div className="proof-col__head proof-col__head--measured">Мой замер</div>
          <ul>
            {measured.map((fact) => (
              <FactItem key={fact.claim} fact={fact} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
