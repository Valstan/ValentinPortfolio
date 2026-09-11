'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { BRIEF_QUESTIONS } from '@/content/brief';
import { CONTACTS } from '@/content/site';
import {
  buildDraft,
  decodeAnswers,
  encodeAnswers,
  type BriefAnswers,
} from '@/lib/brief-draft';

/** Префикс в хэше: чужие якоря на странице не должны толковаться как ответы. */
const HASH_KEY = 'tz=';

/**
 * Первый и единственный клиентский компонент сайта.
 *
 * Всё остальное здесь — статика, которая физически не может сломаться в браузере.
 * Поэтому поверхность отказа локализована одним маршрутом, а страница остаётся
 * полезной и без исполнения скриптов: полный список вопросов с пояснениями
 * отрендерен сервером ниже конструктора. Собрать документ без скриптов нельзя —
 * об этом на странице сказано прямо, а не замаскировано.
 */
export function BriefBuilder() {
  const [answers, setAnswers] = useState<BriefAnswers>({});
  const [copied, setCopied] = useState(false);
  const draftRef = useRef<HTMLPreElement>(null);

  // На конструктор приходят только полной загрузкой страницы: все ссылки на него —
  // обычные <a>, не Link. Скрипт Метрики решает, запускаться ли, один раз — при
  // загрузке документа, по её адресу, — и на документе конструктора не запускается
  // вовсе (см. Metrika.tsx). Приди человек сюда переходом без перезагрузки, над
  // ответами продолжила бы работать запись, запущенная на предыдущей странице. Если
  // такая ссылка всё же появится, страница перезагрузится сама — до того, как в
  // конструкторе что-то выбрано. Сравнение с текущим адресом, а не с литералом:
  // переименование маршрута не превратит проверку в бесконечную перезагрузку.
  useEffect(() => {
    const [nav] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (nav && new URL(nav.name).pathname !== window.location.pathname) {
      window.location.reload();
    }
  }, []);

  // Хэш читаем только после монтирования: сервер его не видит, и чтение при
  // первом рендере дало бы расхождение разметки с гидрацией.
  useEffect(() => {
    const raw = window.location.hash.replace(/^#/, '');
    if (raw.startsWith(HASH_KEY)) {
      setAnswers(decodeAnswers(decodeURIComponent(raw.slice(HASH_KEY.length))));
    }
  }, []);

  const draft = useMemo(() => buildDraft(answers), [answers]);
  const filled = Object.values(answers).some((picked) => picked.length > 0);

  // Ссылка обновляется через replaceState: push плодил бы историю на каждый
  // щелчок, и кнопка «назад» перестала бы уводить со страницы.
  useEffect(() => {
    const encoded = encodeAnswers(answers);
    const next = encoded ? `#${HASH_KEY}${encoded}` : window.location.pathname;
    window.history.replaceState(null, '', next);
  }, [answers]);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2500);
    return () => window.clearTimeout(timer);
  }, [copied]);

  function toggle(questionId: string, optionId: string, multiple: boolean): void {
    setAnswers((prev) => {
      const picked = prev[questionId] ?? [];
      if (!multiple) {
        // Повторный щелчок по выбранному снимает выбор: иначе ответ нельзя отменить.
        return { ...prev, [questionId]: picked[0] === optionId ? [] : [optionId] };
      }
      return {
        ...prev,
        [questionId]: picked.includes(optionId)
          ? picked.filter((id) => id !== optionId)
          : [...picked, optionId],
      };
    });
  }

  async function copyDraft(): Promise<void> {
    try {
      await navigator.clipboard.writeText(draft);
      setCopied(true);
    } catch {
      // Незащищённый контекст или старый браузер: clipboard недоступен. Выделяем
      // текст, чтобы человек скопировал сам, — молча не отказываем.
      const node = draftRef.current;
      if (!node) return;
      const range = document.createRange();
      range.selectNodeContents(node);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }

  function downloadDraft(): void {
    const blob = new Blob([draft], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'chernovik-tehzadaniya.md';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  // Длинный mailto молча обрезается частью почтовых клиентов, поэтому кнопка
  // появляется только когда тело гарантированно доедет целиком.
  const mailtoHref =
    CONTACTS.email && draft.length < 1500
      ? `mailto:${CONTACTS.email}?subject=${encodeURIComponent('Черновик техзадания')}&body=${encodeURIComponent(draft)}`
      : null;

  return (
    <div className="brief">
      <div className="brief__questions">
        {BRIEF_QUESTIONS.map((question) => {
          const picked = answers[question.id] ?? [];
          return (
            <div key={question.id} className="brief__q">
              <h3 className="brief__ask">
                {question.ask}
                {question.multiple && <span className="brief__hint"> — можно несколько</span>}
              </h3>
              <p className="brief__why">{question.why}</p>
              <div className="brief__opts">
                {question.options.map((option) => {
                  const on = picked.includes(option.id);
                  return (
                    <button
                      key={option.id}
                      type="button"
                      className={on ? 'brief__opt brief__opt--on' : 'brief__opt'}
                      aria-pressed={on}
                      onClick={() => toggle(question.id, option.id, Boolean(question.multiple))}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <aside className="brief__side">
        <div className="brief__draft-head">
          <h3>Черновик</h3>
          <p className="brief__why">
            Собирается прямо здесь, в вашем браузере. Ответы никуда не уходят — отправляете их
            вы сами, если захотите.
          </p>
        </div>

        {filled ? (
          <>
            {/* id нужен печати: на бумагу уходит только черновик, без вопросов и кнопок. */}
            <pre className="brief__draft" id="brief-draft" ref={draftRef}>
              {draft}
            </pre>
            <div className="brief__actions">
              <button type="button" className="btn btn--primary" onClick={() => window.print()}>
                Распечатать или сохранить в PDF
              </button>
              <button type="button" className="btn btn--ghost" onClick={copyDraft}>
                {copied ? 'Скопировано ✓' : 'Скопировать текст'}
              </button>
              <button type="button" className="btn btn--ghost" onClick={downloadDraft}>
                Скачать файлом
              </button>
            </div>
            <p className="note note--plain">
              Ссылка в адресной строке уже содержит ваши ответы — её можно отправить директору
              или в администрацию, и они откроют ровно этот же черновик.
            </p>
            <div className="brief__contacts">
              {CONTACTS.phone && (
                <a className="btn btn--ghost" href={`tel:${CONTACTS.phone}`}>
                  Позвонить {CONTACTS.phoneLabel}
                </a>
              )}
              {mailtoHref && (
                <a className="btn btn--ghost" href={mailtoHref}>
                  Отправить почтой
                </a>
              )}
              <a className="btn btn--ghost" href={CONTACTS.telegram} rel="noopener">
                Telegram {CONTACTS.telegramLabel} ↗
              </a>
            </div>
            <p className="note note--plain">
              В Telegram текст не подставляется сам — сначала нажмите «Скопировать текст», потом
              вставьте в сообщение.
            </p>
          </>
        ) : (
          <p className="note note--plain">
            Ответьте хотя бы на первый вопрос — черновик начнёт собираться здесь.
          </p>
        )}
      </aside>
    </div>
  );
}
