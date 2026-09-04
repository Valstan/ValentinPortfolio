import { absoluteUrl, CONTACTS, PERSON, SITE_HOST_DISPLAY, SITE_ORIGIN } from '@/content/site';
import { SERVICES } from '@/content/services';
import { TASKS } from '@/content/tasks';
import { VISIBLE_WORKS, workBySlug } from '@/content/works';

// Машиночитаемые факты одним файлом: генерируются ИЗ works.ts, а не наоборот —
// разъехаться с сайтом не могут. Каждый факт несёт дату замера и признак проверяемости.
export const dynamic = 'force-static';

export function GET(): Response {
  const payload = {
    person: {
      name: PERSON.name,
      jobTitle: PERSON.jobTitle,
      // Регион — машиночитаемо. Без него на вопрос «кто делает сайты в Кировской
      // области» этот файл не отвечал ничем, хотя ответ у сайта есть.
      areaServed: PERSON.areaServed,
      url: absoluteUrl('/'),
      contacts: {
        ...(CONTACTS.phone ? { phone: CONTACTS.phone } : {}),
        ...(CONTACTS.email ? { email: CONTACTS.email } : {}),
        telegram: CONTACTS.telegram,
        github: CONTACTS.github,
      },
    },
    // Хост в обеих формах: punycode — чтобы по нему ходить, юникод — чтобы его
    // процитировать. Раньше отдавался только punycode, и ассистент, отвечая
    // «сайт такой-то», вставлял в ответ нечитаемую строку `xn--…`.
    site: { url: SITE_ORIGIN, host: SITE_HOST_DISPLAY },
    tasks: TASKS.map((task) => ({
      slug: task.slug,
      question: task.question,
      page: absoluteUrl(`/zadachi/${task.slug}/`),
      timeline: task.timeline,
      proof: task.proof
        .map((slug) => workBySlug(slug))
        .filter((work) => work !== undefined)
        .map((work) => work.title),
    })),
    services: SERVICES.map((service) => ({
      id: service.id,
      title: service.title,
      need: service.need,
      body: service.body,
      areaServed: PERSON.areaServed,
    })),
    works: VISIBLE_WORKS.map((work) => ({
      slug: work.slug,
      title: work.title,
      tagline: work.tagline,
      status: work.status,
      page: absoluteUrl(`/raboty/${work.slug}/`),
      // Домен показываем в обеих формах: юникод — для чтения, punycode — для перехода.
      prodUrlUnicode: work.prodLabel ?? null,
      prodUrl: work.prodUrl ? new URL(work.prodUrl).href : null,
      stack: work.stack,
      facts: work.facts.map((fact) => ({
        claim: fact.claim,
        asOf: fact.asOf,
        verify: fact.verify,
      })),
    })),
  };

  return new Response(JSON.stringify(payload, null, 2), {
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}
