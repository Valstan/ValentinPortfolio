#!/usr/bin/env node
/**
 * Пережатие кадров витрины под srcset.
 *
 * Зачем: телефон качал мастера в полном размере. Телефонные кадры 750×1440
 * рисуются сеткой `.shots-phone` шириной 200–240 px, широкие 1600×1000 — колонкой
 * прозы не шире 712 px. То есть до правки в трубу уходило кратно больше байт, чем
 * попадало на экран; на странице Матрицы это девять файлов общим весом 1,32 МБ.
 *
 * Мастера лежат в `web/public/shots/<dir>/<file>.jpg` и остаются нетронутыми —
 * они же самый крупный кандидат в srcset и они же открываются по ссылке
 * «в полном размере». Копии пишутся в `web/public/shots/_r/` и НЕ коммитятся:
 * generated-бинарники в публичном репозитории удвоили бы его вес, а разойтись с
 * мастером они не могут, раз собираются из него на каждой сборке.
 *
 * Манифест `web/content/shots-generated.ts` — наоборот, коммитится: `pnpm typecheck`
 * в CI идёт ДО `pnpm build`, и без файла в репозитории проверка типов падала бы на
 * отсутствующем импорте. На сборке он перезаписывается, поэтому в выхлоп всегда
 * попадают настоящие числа, даже если коммит устарел.
 *
 * Пути резолвятся от расположения скрипта, а не от cwd — урок check-export.sh:
 * захардкоженный относительный путь работал только при запуске из одного каталога.
 *
 * Лежит в `web/scripts/`, а не рядом с `check-export.sh` в корне, по технической
 * причине: ESM ищет `sharp` от каталога САМОГО модуля, а не от cwd, и из корня
 * репозитория он не нашёлся бы — зависимости живут в `web/node_modules`.
 *
 * ⚠️ Вызывается явной командой в `package.json`, а не хуком `prebuild`: pnpm с
 * версии 7 НЕ исполняет pre/post-скрипты по умолчанию (`enable-pre-post-scripts`
 * по умолчанию false). Хук молча не запустился бы, сборка прошла бы зелёной, а
 * srcset ссылался бы на несуществующие файлы.
 */
import { mkdir, readdir, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const WEB_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SHOTS = join(WEB_ROOT, 'public', 'shots');
const OUT_DIR = join(SHOTS, '_r');
const MANIFEST = join(WEB_ROOT, 'content', 'shots-generated.ts');

/** Каталог копий — единственное, что скрипт создаёт в public/; он же в .gitignore. */
const GENERATED_DIRNAME = '_r';

/**
 * Лестницы ширин. Верхняя ступень — сам мастер, его пережимать незачем.
 * Широкие: колонка прозы ≤ 712 px, на 2× это ~1424 — поэтому 1280 и 1600 имеют смысл.
 * Телефонные: сетка ≤ 240 px, на 2× это 480; 750 остаётся мастером для «в полном размере».
 */
const LADDER_WIDE = [360, 540, 720, 960, 1280];
const LADDER_PHONE = [240, 360, 480];

/** q82 — та же планка, что у кадров витрины в assets/screenshots/README.md. */
const JPEG = { quality: 82, progressive: true, mozjpeg: true };

async function* walkMasters(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (entry.name === GENERATED_DIRNAME) continue; // свои же копии не пережимаем
      yield* walkMasters(join(dir, entry.name));
    } else if (entry.name.endsWith('.jpg')) {
      yield join(dir, entry.name);
    }
  }
}

/** Свежая копия — та, что новее мастера. Локально это экономит время, в CI всё собирается заново. */
async function isFresh(out, master) {
  if (!existsSync(out)) return false;
  const [a, b] = await Promise.all([stat(out), stat(master)]);
  return a.mtimeMs >= b.mtimeMs;
}

async function main() {
  if (!existsSync(SHOTS)) {
    console.error(`::error::нет каталога кадров ${SHOTS}`);
    process.exit(1);
  }

  const manifest = {};
  let written = 0;
  let skipped = 0;

  for await (const master of walkMasters(SHOTS)) {
    const key = relative(SHOTS, master).split(/[\\/]/).join('/');
    const { width, height } = await sharp(master).metadata();
    if (!width || !height) {
      console.error(`::error::не читаются размеры ${key}`);
      process.exit(1);
    }

    // Телефон отличаем по пропорции, а не по имени файла: имена у кадров разные
    // (mobile.jpg, tablet.jpg), а форма — единственный честный признак.
    const ladder = height > width ? LADDER_PHONE : LADDER_WIDE;
    const widths = ladder.filter((w) => w < width);

    const variants = [];
    for (const w of widths) {
      const outPath = join(OUT_DIR, key.replace(/\.jpg$/, `-${w}.jpg`));
      variants.push(w);
      if (await isFresh(outPath, master)) {
        skipped += 1;
        continue;
      }
      await mkdir(dirname(outPath), { recursive: true });
      await sharp(master).resize({ width: w }).jpeg(JPEG).toFile(outPath);
      written += 1;
    }

    manifest[key] = { w: width, h: height, variants };
  }

  const entries = Object.keys(manifest)
    .sort()
    .map((key) => {
      const { w, h, variants } = manifest[key];
      // Кандидаты: копии из _r плюс сам мастер последней ступенью.
      const srcset = [
        ...variants.map((v) => `/shots/${GENERATED_DIRNAME}/${key.replace(/\.jpg$/, `-${v}.jpg`)} ${v}w`),
        `/shots/${key} ${w}w`,
      ].join(', ');
      return `  '${key}': { w: ${w}, h: ${h}, srcset: '${srcset}' },`;
    })
    .join('\n');

  const ts = `// СГЕНЕРИРОВАНО scripts/gen-shots.mjs — руками не править, перезаписывается на каждой сборке.
//
// Коммитится намеренно: \`pnpm typecheck\` в CI идёт до \`pnpm build\`, и без этого
// файла в репозитории проверка типов упала бы на отсутствующем импорте. Числа здесь
// могут отстать от кадров — на сборке они пересчитываются, а гейт экспорта проверяет,
// что каждый URL из srcset реально лежит файлом в выхлопе.

export type ShotVariant = { w: number; h: number; srcset: string };

export const SHOT_VARIANTS: Record<string, ShotVariant> = {
${entries}
};
`;
  await writeFile(MANIFEST, ts, 'utf8');

  console.log(
    `кадры: ${Object.keys(manifest).length} мастеров, копий пережато ${written}, свежих пропущено ${skipped}`,
  );
}

await main();
