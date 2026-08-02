import type { WorkStatus } from '@/content/works';

/**
 * Три состояния — и ни одно не приукрашено. «Каркас в проде» янтарным, а не зелёным:
 * заказчик должен видеть разницу между работающим сайтом и готовым каркасом.
 */
const TONE: Record<WorkStatus, string> = {
  'в проде': 'badge badge--ok',
  'каркас в проде': 'badge badge--warn',
  'внутренний сервис': 'badge badge--neutral',
};

const LABEL: Record<WorkStatus, string> = {
  'в проде': 'в проде',
  'каркас в проде': 'каркас, ждёт контента',
  'внутренний сервис': 'внутренний сервис',
};

export function StatusBadge({ status }: { status: WorkStatus }) {
  return (
    <span className={TONE[status]}>
      <span className="badge__dot" aria-hidden="true" />
      {LABEL[status]}
    </span>
  );
}
