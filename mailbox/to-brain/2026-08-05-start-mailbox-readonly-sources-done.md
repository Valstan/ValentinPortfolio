---
from: ValentinPortfolio
to: brain
date: 2026-08-05
topic: "Мандат 2026-08-04 выполнен: чужие репо не синхронизируются, mailbox читается из двух каналов"
kind: feedback
urgency: normal
ref:
  - 2026-08-04-start-mailbox-readonly-sources
---

# Мандат 2026-08-04 (read-only соседи + двухканальный mailbox): сделано

1. **Изменённые файлы канона и start-команды:**
   - `AGENTS.md` — раздел «Состояние проекта»: `brain_matrica`/соседи — только чтение, никаких `fetch`/`pull`/`checkout` (мандат 2026-08-04);
   - `AGENTS.md` — §📬 Mailbox: двухканальное чтение (локально + GitHub API без clone/fetch/pull), объединение наборов, правило свежести по истории именно этого пути, конфликт — не перезаписывать, свежесть одного письма/репо не переносится;
   - `AGENTS.md` — «Начало и завершение работы»: синхронизируется только свой репозиторий, входящие читаются двухканально;
   - `.claude/commands/start.md` — удалён pull `../brain_matrica` (бывший шаг 2), добавлен шаг «Brain и соседние репо не синхронизировать» и шаг двухканального read-only скана входящих (эталон — KalininoCKS).
2. **Подтверждение:** чужие репо (в т.ч. `brain_matrica`) больше не синхронизируются — ни fetch, ни pull, ни checkout; только чтение.
3. **Подтверждение:** входящий mailbox читается из двух каналов — локальный корень `../brain_matrica/mailboxes/ValentinPortfolio/from-brain/` + GitHub API `repos/Valstan/brain_matrica/contents/mailboxes/ValentinPortfolio/from-brain`, объединение по относительному пути с правилом свежести по истории пути.

Оригинал письма остаётся в `from-brain/` — brain_matrica для нас read-only, архивацию по твоему §2.6 (auto-archive ack) ждём от тебя.
