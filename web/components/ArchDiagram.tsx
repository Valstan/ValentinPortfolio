/**
 * Схема архитектуры вместо скриншота — для систем, экраны которых публиковать нельзя.
 * Инлайн-SVG в тех же габаритах, что и рамка со снимком: ритм сетки не рвётся, дыры не видно.
 * Ноль внешних запросов, цвета — из тех же переменных, что и остальной сайт.
 */

export type DiagramNode = { label: string; sub?: string };

const DIAGRAMS: Record<string, { nodes: DiagramNode[]; caption: string }> = {
  'matrica-rmz': {
    caption: 'Клиент работает офлайн, журнал догоняет сервер при связи',
    nodes: [
      { label: 'Клиент на заводе', sub: 'Electron + SQLite' },
      { label: 'Журнал транзакций', sub: 'шифрование' },
      { label: 'Сервер', sub: 'Node + PostgreSQL' },
      { label: 'Резерв', sub: 'secondary' },
    ],
  },
  sarafan: {
    caption: 'Источники → отбор → расписание → каналы публикации',
    nodes: [
      { label: '1000+ сообществ', sub: 'сбор постов' },
      { label: 'Отбор', sub: 'ИИ + ключевые слова' },
      { label: 'Очередь', sub: 'Celery + Redis' },
      { label: 'ВК · Telegram · сайты', sub: 'публикация' },
    ],
  },
  karman: {
    caption: 'Займы и графики → воркер → напоминание с кнопкой в Telegram',
    nodes: [
      { label: 'Займы и графики', sub: 'PostgreSQL' },
      { label: 'Воркер', sub: 'без зависимостей' },
      { label: 'Бот', sub: 'Telegram' },
      { label: 'Отметка платежа', sub: 'кнопкой в чате' },
    ],
  },
};

export function ArchDiagram({
  slug,
  note,
  compact = false,
}: {
  slug: string;
  note?: string;
  compact?: boolean;
}) {
  const diagram = DIAGRAMS[slug];
  if (!diagram) {
    return (
      <div className="shot shot--empty">
        <span>{note}</span>
      </div>
    );
  }

  const { nodes, caption } = diagram;

  // В карточке 330px полноразмерная схема сжимается до нечитаемых волосков —
  // там показываем ту же цепочку текстом, а сам чертёж живёт на странице работы.
  if (compact) {
    return (
      <div className="shot shot--chain">
        <div className="chain">
          <span className="chain__kicker">схема вместо снимка</span>
          {nodes.map((node, i) => (
            <span key={node.label} className="chain__node">
              {i > 0 && <span className="chain__arrow" aria-hidden="true">↓</span>}
              {node.label}
            </span>
          ))}
        </div>
      </div>
    );
  }
  const w = 640;
  const h = 400;
  const boxW = 250;
  const boxH = 62;
  const gapY = (h - 60 - nodes.length * boxH) / (nodes.length - 1);
  const x = (w - boxW) / 2;

  return (
    <div className="shot shot--diagram">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        role="img"
        aria-label={`Схема: ${nodes.map((n) => n.label).join(' → ')}. ${caption}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {nodes.map((node, i) => {
          const y = 20 + i * (boxH + gapY);
          return (
            <g key={node.label}>
              {i > 0 && (
                <path
                  d={`M ${w / 2} ${y - gapY} L ${w / 2} ${y - 7}`}
                  className="diagram__arrow"
                  markerEnd="url(#arrowhead)"
                />
              )}
              <rect x={x} y={y} width={boxW} height={boxH} rx="8" className="diagram__box" />
              <text x={w / 2} y={y + (node.sub ? 26 : 36)} className="diagram__label">
                {node.label}
              </text>
              {node.sub && (
                <text x={w / 2} y={y + 45} className="diagram__sub">
                  {node.sub}
                </text>
              )}
            </g>
          );
        })}
        <defs>
          <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
            <path d="M0,1 L6,4 L0,7 z" className="diagram__arrowhead" />
          </marker>
        </defs>
      </svg>
      {note && <p className="shot__note">{note}</p>}
    </div>
  );
}
