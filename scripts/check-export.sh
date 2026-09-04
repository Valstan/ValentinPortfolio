#!/usr/bin/env bash
# Приёмка static export: маршруты обязаны реально сгенериться в файлы.
#
# Общий шаг PR-гейта (`ci.yml`) и прод-сборки (`deploy.yml`) — один текст на две
# точки вызова, иначе гейт и деплой проверяют разное и расходятся молча.
#
# G12: metadata-роуты (`robots.ts`, `sitemap.ts`) и route-handler'ы при static
# export отваливаются беззвучно — сборка зелёная, файла нет. Проверяем файлами.
#
# Использование: bash ../scripts/check-export.sh [каталог-экспорта]  (по умолчанию out)
set -euo pipefail

OUT="${1:-out}"

test -d "$OUT" || { echo "::error::нет каталога экспорта $OUT"; exit 1; }

for f in index.html robots.txt sitemap.xml llms.txt llms-full.txt facts.json og.png \
         404.html raboty/index.html zadachi/index.html kontakty/index.html \
         uslugi/index.html grabli/index.html; do
  test -s "$OUT/$f" || { echo "::error::нет или пуст $OUT/$f"; exit 1; }
done

# Детальные страницы — самая многочисленная часть сайта и единственная, которую
# генерирует `generateStaticParams`. Сломайся он — сводные страницы остались бы на
# месте, и прежний гейт назвал бы экспорт полным. Проверяем по каталогу, а не
# списком имён: список пришлось бы править руками при каждой новой работе, и он
# разошёлся бы с `works.ts` молча.
works=$(find "$OUT/raboty" -mindepth 2 -name index.html | wc -l)
tasks=$(find "$OUT/zadachi" -mindepth 2 -name index.html | wc -l)
gotchas=$(find "$OUT/grabli" -mindepth 2 -name index.html | wc -l)
test "$works" -ge 1 || { echo "::error::не сгенерирована ни одна страница работы"; exit 1; }
test "$tasks" -ge 1 || { echo "::error::не сгенерирована ни одна страница задачи"; exit 1; }
test "$gotchas" -ge 1 || { echo "::error::не сгенерирована ни одна страница журнала грабель"; exit 1; }

expected_gotchas=$(grep -c "^    slug: '" web/content/gotchas.ts)
test "$gotchas" -eq "$expected_gotchas" || {
  echo "::error::страниц грабель в выхлопе $gotchas, а в журнале $expected_gotchas"
  exit 1
}

# Число страниц обязано совпасть с каталогом: если работа выпала из выхлопа, а
# остальные на месте, поштучная проверка этого не увидит.
expected_works=$(grep -c "^    slug: '" web/content/works.ts)
hidden_works=$(grep -c '^    hidden: true,' web/content/works.ts || true)
expected_visible=$((expected_works - hidden_works))
test "$works" -eq "$expected_visible" || {
  echo "::error::страниц работ в выхлопе $works, а видимых в каталоге $expected_visible"
  exit 1
}

grep -q 'xn--80adkmnnb2b' "$OUT/sitemap.xml" || { echo "::error::sitemap не в punycode"; exit 1; }

# G133/G134: юникод-хост в абсолютной ссылке ломает сниппет при шаринге.
#
# Без пайпа намеренно: `grep ... | head -1 | grep -q .` под `pipefail` возвращает
# non-zero из-за SIGPIPE у первого grep'а — то есть ровно при НАЙДЕННОМ нарушении
# условие читалось бы как «чисто», и проверка тихо инвертировалась бы.
#
# Код возврата различаем явно: 0 — нашли, 1 — чисто, >1 — сам grep не отработал
# (`-P` недоступен в этой сборке grep, локаль не UTF-8). Третий случай обязан
# падать, а не молчать: молчащая проверка хуже отсутствующей — она читается
# зелёной (#104).
set +e
bad=$(grep -rlP 'https?://[^"'"'"' ]*[^\x00-\x7F]' "$OUT" --include='*.html' 2>&1)
rc=$?
set -e
case "$rc" in
  0) echo "::error::в разметке есть абсолютный URL с юникод-хостом:"; echo "$bad"; exit 1 ;;
  1) : ;;
  *) echo "::error::проверка юникод-хостов не отработала (grep rc=$rc): $bad"; exit 1 ;;
esac

# Предохранитель D-038 на уровне выхлопа, а не только на уровне вычитки глазами.
#
# Журнал грабель — самый вероятный источник утечки: поучительнее всего именно те
# записи, где названы адреса и порты. Поэтому проверяем не лексику («бокс»,
# «сервер» — законные слова), а конкретные формы: адрес IPv4 и явный порт.
#
# Коды grep различаем так же, как выше: 0 — нашли, 1 — чисто, >1 — проверка не
# отработала и обязана падать.
set +e
# Порт ищем только в составе адреса (`//хост:3001`), а не любое `:NNNN`: в
# RSC-данных страниц полно пар вида `"width":1280`, и широкий шаблон краснел на них.
leak=$(grep -rEn '\b((25[0-5]|2[0-4][0-9]|1?[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1?[0-9]{1,2})\b|//[a-z0-9.-]+:[0-9]{2,5}\b' \
  "$OUT" --include='*.html' --include='*.txt' --include='*.json' 2>&1)
rc=$?
set -e
case "$rc" in
  0) echo "::error::в выхлоп попал адрес или порт (предохранитель D-038):"; echo "$leak"; exit 1 ;;
  1) : ;;
  *) echo "::error::проверка на адреса не отработала (grep rc=$rc): $leak"; exit 1 ;;
esac

echo "экспорт полон: $(find "$OUT" -name '*.html' | wc -l) html-страниц"
