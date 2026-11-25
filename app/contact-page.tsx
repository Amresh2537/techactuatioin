import Image from "next/image";
import Link from "next/link";
import { address, companyContact } from "./data";
import { Arrow, Icon } from "./icons";
import { QuoteForm } from "./quote-form";

export function ContactPage() {
  const directions = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  return <main id="main" className="contact-page">
    <section className="contact-hero"><div className="container">
      <div className="breadcrumb"><Link href="/">Home</Link><span>/</span>Contact Us</div>
      <div className="contact-hero-grid"><div><div className="eyebrow light">LET’S BUILD SOMETHING THAT MOVES <i /></div><h1>Your next solution<br />starts with <span>a conversation.</span></h1><p>From a single screw jack to a complete actuation system, tell us what you need. We’ll help you find the right configuration.</p><a href="#enquiry" className="button">Discuss Your Project <Arrow /></a></div>
        <div className="contact-hero-visual"><Image src="/images/Precision Components in a Modern CNC Workshop-3.png" alt="Precision components in an industrial engineering workshop" fill sizes="(max-width: 850px) 100vw, 40vw" /><div className="contact-visual-caption"><span>TECH ACTUATION INDUSTRIES</span><strong>Real engineering.<br />Personal attention.</strong><span><Icon name="pin" /> FARIDABAD, HARYANA</span></div></div>
      </div>
    </div></section>

    <section className="contact-body"><div className="container">
      <div className="contact-methods">
        <div className="contact-method"><span className="contact-method-icon"><Icon name="phone" /></span><div><span className="contact-kicker">CALL OUR TEAM</span><h2>Talk to Kamlesh</h2>{companyContact.phones.map(phone => <a key={phone.href} href={phone.href}>{phone.label}</a>)}</div></div>
        <div className="contact-method"><span className="contact-method-icon"><Icon name="mail" /></span><div><span className="contact-kicker">PRODUCT & TECHNICAL ENQUIRIES</span><h2>Write to us</h2><a href={`mailto:${companyContact.email}`}>{companyContact.email}</a><p>Share drawings and application details.</p></div></div>
        <a className="contact-method contact-method-whatsapp" href="https://wa.me/919311742040" target="_blank" rel="noreferrer"><span className="contact-method-icon"><Icon name="chat" /></span><div><span className="contact-kicker">LET’S CONNECT</span><h2>Chat on WhatsApp <Arrow /></h2><p>Start a conversation with our team.</p></div></a>
      </div>

      <div className="contact-enquiry-grid" id="enquiry"><div className="contact-project-copy"><div className="eyebrow">ENGINEERED AROUND YOU <i /></div><h2>A few details.<br />A better starting point.</h2><p>Tell us about your application so we can discuss a solution that fits your installation.</p><ol className="contact-project-steps"><li><span>01</span><div><h3>Tell us the application</h3><p>What needs to lift, move or be positioned?</p></div></li><li><span>02</span><div><h3>Share the essentials</h3><p>Load, stroke, speed, mounting and quantity help us understand your requirements.</p></div></li><li><span>03</span><div><h3>Discuss the right configuration</h3><p>Our team can help with product selection and application-specific options.</p></div></li></ol><div className="contact-requirement-link"><Icon name="settings" /><div><h3>Already have the specifications?</h3><p>Use our detailed form to configure your screw jack requirement.</p><Link href="/requirement">Build your requirement <Arrow /></Link></div></div></div>
        <div className="contact-form-panel"><div className="contact-form-label"><span className="utility-dot" /> LET’S TALK ABOUT YOUR PROJECT</div><QuoteForm /></div>
      </div>

      <section className="contact-location" aria-labelledby="location-heading"><div className="contact-location-art" aria-hidden="true"><div className="location-grid" /><span className="location-pin"><Icon name="pin" /></span><span className="location-city">FARIDABAD</span><span className="location-region">HARYANA · INDIA</span></div><div className="contact-location-copy"><div className="eyebrow">FIND US <i /></div><h2 id="location-heading">Engineering motion.<br />From Faridabad.</h2><p>{address}</p><a className="button" href={directions} target="_blank" rel="noreferrer">Get Directions <Arrow /></a><dl className="contact-business-details"><div><dt>GSTIN</dt><dd>{companyContact.gstin}</dd></div><div><dt>Website</dt><dd><a href={companyContact.websiteUrl}>{companyContact.website}</a></dd></div></dl></div></section>
    </div></section>
  </main>;
}
