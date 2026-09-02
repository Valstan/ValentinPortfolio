---
description: Закрыть сессию «Портфолио» — сохранить состояние в SESSION_HANDOFF и запушить всё через PR-flow
---

# /close_session — финализация сессии «Портфолио» (ValentinPortfolio)

Цель: оставить pointer «куда шли» в `docs/SESSION_HANDOFF.md` и убедиться, что **всё на `origin`**, brain не тронут.
Правила — в `AGENTS.md` (§Начало и завершение работы, §Git, §Текст — файлом); здесь только шаги.

## Когда вызывать / НЕ вызывать

- ✅ Когда шаг нитки сделан словами в чате и в файлы не попал; перед пересадкой на другую машину; когда handoff распух и пора наследовать хвосты.
- ❌ Если последний PR смержен и после него ничего не обсуждали — закрывать нечего: handoff уехал тем же PR (D-066). Просто скажи, что состояние чистое.
- ❌ После короткой консультации без правок.

## Шаг 1. Контекст

```bash
git branch --show-current; git status --short; git log --oneline -10; gh pr list --state open
```

## Шаг 2. Незакоммиченная работа → через PR-flow (НЕ в `main` напрямую)

Ветка `feat/ fix/ chore/ docs/` → коммит → `git push -u origin <ветка>` → `gh pr create --body-file <файл>` → гейт `gates` зелёный → `gh pr merge --squash --delete-branch`.
⚠️ **Мерж кода (`web/**`) в `main` авто-деплоит на прод** (`deploy.yml`). Локальный гейт перед PR, если трогался код: `corepack pnpm typecheck && corepack pnpm build` в `web/` (линт не настроен осознанно, см. `ci.yml`).

## Шаг 3. Шеринг находки в brain (условный, pool #009)

Переносимый инсайт? → `mailbox/to-brain/YYYY-MM-DD-slug.md` (`kind`, `compliance`, `urgency`) **в этом репо**. ❌ Никогда не писать в `../brain_matrica/`. Тишина = норма.

## Шаг 4. Записать `docs/SESSION_HANDOFF.md`

Абсолютные даты: **Статус**, **Updated**, **Где мы**, **Следующий шаг**, **Открытые вопросы владельцу**. Если незакоммиченная работа есть — handoff едет **в том же PR**, что и она (шаг 2), отдельный docs-PR не нужен.

## Шаг 5. Handoff отдельным docs-PR (только если шаг 2 был пуст)

Commit message и body PR — файлом в scratchpad, не в `-m`/`--body` (D-046: кириллица и переносы в аргументе ломаются).

```bash
git checkout -b docs/handoff-<slug>
git add docs/SESSION_HANDOFF.md
git commit -F <scratchpad>/msg.txt
git push -u origin docs/handoff-<slug>
gh pr create --body-file <scratchpad>/body.md
gh pr merge --squash --delete-branch
git checkout main && git pull --ff-only
```

## Шаг 6. Sync-гейт

```bash
git status --short                  # пусто
git rev-parse HEAD @{u}             # совпадают
git stash list                      # пусто
```

## Что НЕ делать

- ❌ `git push origin main` напрямую; `--force` / `reset --hard` по `main`.
- ❌ Писать/коммитить/синхронизировать `../brain_matrica/`.
- ❌ Оставлять незапушенные ветки/коммиты или висящий `git stash`.
- ❌ Спрашивать владельца «мержить?» при зелёном гейте — мерж по зелёному (постулат 30).
