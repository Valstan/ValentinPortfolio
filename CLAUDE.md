# CLAUDE.md — entry point для AI-сессий «Портфолио» (ValentinPortfolio)

Первый файл, который Claude читает в новой сессии проекта. Проект — часть экосистемы **brain_matrica**. Карточка: [`../brain_matrica/projects/ValentinPortfolio.md`](../brain_matrica/projects/ValentinPortfolio.md). Концепт: [`../brain_matrica/docs/plans/valentin-portfolio-concept.md`](../brain_matrica/docs/plans/valentin-portfolio-concept.md).

## Быстрые факты

- **Что это:** **сайт-визитка / продающее портфолио** разработчика @valstan — все работы со скриншотами, описанием функционала, стеком и планами. Домен-цель: **валентин.вмалмыже.рф**.
- **Прод:** пока **нет** (репо создан 2026-07-21). Планируемый деплой — поддомен на Бокс 1 рядом с малмыж-сайтами.
- **Стек:** **не финализирован.** Рекомендация — Next.js 15 static export (как RmzMalmyzh стадия 1) или лёгкий лендинг-одностраничник: дёшево, быстро, SEO. Решение — за владельцем на стадии постройки.
- **Контент:** `PORTFOLIO.md` — каталог работ, засеян из реестра Мозга (`../brain_matrica/projects/`). Держать в синхроне с реестром.

## Как работать

- **Источник правды по каталогу работ** — реестр Мозга `../brain_matrica/projects/INDEX.md` + карточки `projects/<P>.md` (read-only чтение). Каталог сайта — производная от них.
- **Скриншоты прод-сайтов** — собирать методом pool #079 (puppeteer-core headless), не руками.
- Прода/деплоя пока нет → гейтов сборки нет. Когда выберем стек — оформим CI/деплой отдельной ниткой.
- PR-flow (ADR-0002): ветка → PR → squash-merge. **Прямых пушей в `main` нет.**

## 📬 Mailbox check — ДО любой другой работы (ADR-0001 v3)

| Направление | Кто пишет | Где |
|---|---|---|
| `brain → Портфолио` | brain | `../brain_matrica/mailboxes/ValentinPortfolio/from-brain/*.md` (мы только **читаем** после `git pull --ff-only`) |
| `Портфолио → brain` | мы | **`mailbox/to-brain/*.md`** в этом репо (через PR) |

Сканить только корень `from-brain/`. Compliance: `mandate`→MUST, `recommend`→SHOULD, `suggest`→MAY. ❌ **Никогда не писать/коммитить в `../brain_matrica/`** (read-only).

Формат `mailbox/to-brain/YYYY-MM-DD-slug.md`:

```yaml
---
from: ValentinPortfolio
to: brain
date: YYYY-MM-DD
topic: ...
kind: idea | question | feedback | report
compliance: suggest | recommend | mandate   # для kind=idea
urgency: low | normal | high
---
```

## Session-память и команды

- `docs/SESSION_HANDOFF.md` — статус/нитка/следующий шаг (обновляет `/close_session`, читает `/start`).
- `/start` — синхра репо + mailbox-check от brain + чтение handoff.
- `/close_session` — сохранить состояние, всё на origin через PR (brain не трогать).
