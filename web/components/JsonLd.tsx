/** Серверный компонент: разметка уезжает в HTML на сборке, в браузер не едет ни байта JS. */
export function JsonLd({ json }: { json: string }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
