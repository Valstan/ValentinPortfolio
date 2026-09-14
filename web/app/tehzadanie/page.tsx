import type { Metadata } from 'next';
import Link from 'next/link';
import { BriefBuilder } from '@/components/BriefBuilder';
import { JsonLd } from '@/components/JsonLd';
import { BRIEF_AS_OF, BRIEF_QUESTIONS, BRIEF_TOPICS } from '@/content/brief';
import { breadcrumbNode, graph, howToNode, webApplicationNode } from '@/lib/jsonld';
import { pageMetadata } from '@/lib/metadata';
import { capitalize, countPhrase } from '@/lib/ru';

const TITLE = 'Черновик техзадания';
// И число, и перечисление — из банка вопросов: набранные руками, они пережили бы
// девятый вопрос молча и продолжили обещать состав, которого уже нет.
const DESCRIPTION = `${capitalize(
  countPhrase(BRIEF_QUESTIONS.length, ['вопрос', 'вопроса', 'вопросов']),
)}, из которых собирается техзадание на разработку: ${BRIEF_TOPICS}. Считается в браузере, ответы никуда не отправляются.`;

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: '/tehzadanie/',
});

export default function BriefPage() {
  return (
    <>
      <div className="wrap crumbs">
        <Link href="/">Главная</Link>
        <span>/</span>
        <span>{TITLE}</span>
      </div>

      <section className="wrap section section--flush">
        <div className="section__head">
          <h1>Соберите черновик техзадания</h1>
          <p className="section__lede">
            Самое трудное в обращении к незнакомому разработчику — не найти его, а понять, что
            писать. Ответьте на несколько вопросов, и документ соберётся сам: что нужно, что
            уже есть, чего в этой задаче я не делаю и на какие вопросы нужен ответ до старта.
            Его можно распечатать, показать начальнику, приложить к заявке на финансирование —
            или отдать другому исполнителю. Мне писать не обязательно.
          </p>
        </div>

        <BriefBuilder />
      </section>

      <section className="wrap section">
        <div className="section__head">
          <span className="section__kicker">Состав вопросов от {BRIEF_AS_OF}</span>
          <h2>Те же вопросы списком — и зачем я каждый задаю</h2>
          <p className="section__lede">
            Это не «поля формы», а порядок разговора, которым я начинаю любую задачу. Забирайте
            и пользуйтесь, даже если работать будете не со мной: половина проваленных проектов
            проваливается именно на этих вопросах, не заданных вовремя.
          </p>
        </div>

        <div className="prose">
          {BRIEF_QUESTIONS.map((question, index) => (
            <div key={question.id} id={`vopros-${index + 1}`}>
              <h3>
                {index + 1}. {question.ask}
              </h3>
              <p>
                <strong>Зачем спрашиваю.</strong> {question.why}
              </p>
              <ul>
                {question.options.map((option) => (
                  <li key={option.id}>
                    <strong>{option.label}</strong> — {option.line}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="wrap section">
        <div className="section__head">
          <h2>Что происходит с вашими ответами</h2>
        </div>
        <p className="note note--plain">
          Ответы никуда не отправляются. У сайта нет сервера: документ собирает ваш браузер, и он
          же хранит ответы — в адресной строке. Поэтому ссылку можно отправить коллеге, и он
          увидит тот же черновик. По той же причине единственное, чего здесь нет, — поля для
          свободного текста «своими словами»: он попал бы в ссылку вместе со всем, что вы писали
          для себя. Своими словами допишете уже в готовом документе.
        </p>
        <p className="note note--plain">
          Скрипт Яндекс.Метрики, который считает посещаемость остального сайта, на этой странице
          не запускается: ни ваши щелчки, ни ответы из адресной строки к нему не попадают.
        </p>
        <p className="note note--plain">
          Без включённых скриптов конструктор не соберёт документ — но список вопросов выше
          читается и так, и в нём вся суть.
        </p>
        <div className="hero__actions">
          <Link href="/zadachi/" className="btn btn--ghost">
            Разборы типовых задач
          </Link>
          <Link href="/kontakty/" className="btn btn--primary">
            Просто написать без черновика
          </Link>
        </div>
      </section>

      <JsonLd
        json={graph(
          breadcrumbNode([
            { name: 'Главная', path: '/' },
            { name: TITLE, path: '/tehzadanie/' },
          ]),
          webApplicationNode({ path: '/tehzadanie/', name: TITLE, description: DESCRIPTION }),
          howToNode({
            path: '/tehzadanie/',
            name: 'Как подготовить техзадание на разработку сайта или учётной системы',
            description: DESCRIPTION,
            steps: BRIEF_QUESTIONS.map((question) => ({ ask: question.ask, why: question.why })),
          }),
        )}
      />
    </>
  );
}
