import { absoluteUrl, CONTACTS, PERSON, SITE_ORIGIN } from '@/content/site';
import { WORKS } from '@/content/works';

// Машиночитаемые факты одним файлом: генерируются ИЗ works.ts, а не наоборот —
// разъехаться с сайтом не могут. Каждый факт несёт дату замера и признак проверяемости.
export const dynamic = 'force-static';

export function GET(): Response {
  const payload = {
    person: {
      name: PERSON.name,
      jobTitle: PERSON.jobTitle,
      url: absoluteUrl('/'),
      contacts: {
        ...(CONTACTS.phone ? { phone: CONTACTS.phone } : {}),
        ...(CONTACTS.email ? { email: CONTACTS.email } : {}),
        telegram: CONTACTS.telegram,
        github: CONTACTS.github,
      },
    },
    site: SITE_ORIGIN,
    works: WORKS.map((work) => ({
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
