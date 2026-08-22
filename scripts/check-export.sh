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

for f in index.html robots.txt sitemap.xml llms.txt facts.json \
         raboty/index.html zadachi/index.html kontakty/index.html; do
  test -s "$OUT/$f" || { echo "::error::нет или пуст $OUT/$f"; exit 1; }
done

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

echo "экспорт полон: $(find "$OUT" -name '*.html' | wc -l) html-страниц"
