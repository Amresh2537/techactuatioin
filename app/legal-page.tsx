import Link from "next/link";
import { address } from "./data";

type LegalSection = { id: string; title: string; content: React.ReactNode };
export function LegalPage({ title, introduction, sections }: { title: string; introduction: string; sections: LegalSection[] }) {
  return <main id="main">
    <section className="inner-hero legal-hero"><div className="container">
      <div className="breadcrumb"><Link href="/">Home</Link><span>/</span>{title}</div>
      <div className="eyebrow light">TECH ACTUATION INDUSTRIES <i /></div>
      <h1>{title}</h1><p>{introduction}</p>
    </div></section>
    <div className="container legal-layout">
      <aside className="legal-contents"><h2>On this page</h2><nav aria-label={`${title} contents`}>{sections.map((section, index) => <a href={`#${section.id}`} key={section.id}><span>{String(index + 1).padStart(2, "0")}</span>{section.title}</a>)}<a href="#legal-contact"><span>{String(sections.length + 1).padStart(2, "0")}</span>Contact us</a></nav></aside>
      <article className="legal-content"><p className="legal-updated">Last updated: 24 November 2026</p>
        {sections.map(section => <section id={section.id} key={section.id}><h2>{section.title}</h2>{section.content}</section>)}
        <section id="legal-contact" className="legal-contact"><h2>Contact us</h2><p>For questions about this {title === "Privacy Policy" ? "policy or your personal information" : "website or these terms"}, contact Tech Actuation Industries.</p><dl><div><dt>Contact person</dt><dd>Kamlesh</dd></div><div><dt>Phone</dt><dd><a href="tel:+919311742040">+91 9311742040</a></dd></div><div><dt>Address</dt><dd>{address}</dd></div></dl><Link href="/contact" className="text-link">Visit our contact page →</Link></section>
        <div className="legal-related"><Link href="/terms-and-conditions">Terms &amp; Conditions</Link><Link href="/privacy-policy">Privacy Policy</Link></div>
      </article>
    </div>
  </main>;
}
