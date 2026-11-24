"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Arrow, Icon } from "../icons";
import { ACCESSORIES, CAPACITIES, HEADS, initialConfiguration, SPECIAL_OPTIONS, STEPS, summaryRows, TYPES, validateStep, type Configuration } from "./configuration";

const stepDescriptions = [
  "Choose how you want the lifting motion to work.",
  "Choose the screw and head orientation for your installation.",
  "Select a head option for your assembly. Our team will confirm the mounting details.",
  "Tell us the required load capacity and number of screw jacks.",
  "Select all the drive components and accessories you need. You can also continue without accessories.",
  "Add application-specific options, or continue with a standard configuration.",
  "Check your configuration and add your contact details so our team can discuss a suitable solution.",
];

const formGroups = [
  { title: "Product configuration", description: "Type, orientation & head", heading: "Choose your screw jack", icon: "settings", required: true },
  { title: "Technical requirements", description: "Capacity, quantity & stroke", heading: "Define your requirements", icon: "lift", required: true },
  { title: "Accessories & options", description: "Drive components & special options", heading: "Complete your assembly", icon: "boxes", required: false },
  { title: "Contact & review", description: "Your details & final review", heading: "Review and send your enquiry", icon: "support", required: true },
];

export function RequirementBuilder() {
  const [data, setData] = useState<Configuration>({ ...initialConfiguration, accessories: [], specialOptions: [] });
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [enquiryId, setEnquiryId] = useState("");
  const successHeadingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (!enquiryId) return;
    const heading = successHeadingRef.current;
    heading?.focus({ preventScroll: true });
    heading?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
  }, [enquiryId]);
  const requestId = useRef("");
  const sectionRefs = useRef<(HTMLFieldSetElement | null)[]>([]);
  const [errorSection, setErrorSection] = useState<number | null>(null);
  const update = <K extends keyof Configuration>(key: K, value: Configuration[K]) => {
    requestId.current = "";
    setData(previous => ({ ...previous, [key]: value }));
    setError("");
    setErrorSection(null);
  };
  const toggle = (key: "accessories" | "specialOptions", value: string) => {
    requestId.current = "";
    setData(previous => ({ ...previous, [key]: previous[key].includes(value) ? previous[key].filter(item => item !== value) : [...previous[key], value] }));
    setError("");
    setErrorSection(null);
  };
  const rows = summaryRows(data);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    for (let index = 0; index < STEPS.length; index++) {
      const message = validateStep(index, data);
      if (message) {
        setErrorSection(index);
        setError(message);
        requestAnimationFrame(() => {
          sectionRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "center" });
          sectionRefs.current[index]?.focus({ preventScroll: true });
        });
        return;
      }
    }
    if (!requestId.current) requestId.current = crypto.randomUUID();
    setPending(true); setError(""); setErrorSection(null);
    try {
      const response = await fetch("/api/requirements", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, requestId: requestId.current }),
        signal: AbortSignal.timeout(35000),
      });
      const result = await response.json();
      if (!response.ok || result.success !== true || typeof result.enquiryId !== "string") throw new Error(process.env.NODE_ENV === "development" && result.detail ? `${result.error} (${result.detail})` : result.error || "We couldn’t save your requirement. Please try again.");
      setEnquiryId(result.enquiryId);
    } catch (failure) {
      setError(failure instanceof Error && failure.name !== "TimeoutError" ? failure.message : "The connection timed out. Your selections are still here; please try again.");
    } finally { setPending(false); }
  }

  function choice(value: string, image: string, description?: string, key: "screwType" | "orientation" | "headType" = "screwType") {
    const selected = data[key] === value;
    return <label className={`req-choice ${selected ? "is-selected" : ""}`} key={value}>
      <input type="radio" name={key} value={value} checked={selected} onChange={() => update(key, value)} />
      <span className="req-choice-tick" aria-hidden="true">{selected ? "✓" : ""}</span>
      <span className="req-choice-image">{image ? <Image src={`/images/${image}`} alt="" width={300} height={240} sizes="(max-width: 600px) 40vw, 260px" /> : <span className="req-no-image"><Icon name="settings" /><span>Discuss this head with our team</span></span>}</span>
      <strong>{value}{key === "orientation" ? " facing" : ""}</strong>
      {description && <span className="req-choice-description">{description}</span>}
    </label>;
  }

  function section(index: number, children: React.ReactNode) {
    const titles = ["Screw jack type", "Screw & head orientation", "Head type", "Load capacity & quantity", "Drive & accessories", "Special options", "Your contact details"];
    return <fieldset
      id={`requirement-section-${index}`}
      className="req-fieldset req-form-section"
      disabled={pending}
      tabIndex={-1}
      ref={element => { sectionRefs.current[index] = element; }}
      aria-describedby={`requirement-description-${index}`}
    >
      <legend className="req-section-title">{titles[index]}<small className={`req-field-status ${![4, 5].includes(index) && validateStep(index, data) === null ? "is-filled" : ""}`}>{[4, 5].includes(index) ? "Optional" : validateStep(index, data) === null ? "✓ Complete" : "Required"}</small></legend>
      <p className="req-section-description" id={`requirement-description-${index}`}>{stepDescriptions[index]}</p>
      {error && errorSection === index && <p role="alert" className="req-error req-section-error">{error}</p>}
      {children}
    </fieldset>;
  }

  function groupHeader(index: number) {
    const group = formGroups[index];
    return <div className="req-panel-heading">
      <span className="req-panel-icon"><Icon name={group.icon} /></span>
      <div><div className="req-panel-kicker">{String(index + 1).padStart(2, "0")} / {group.title}</div><h2 id={`requirement-group-heading-${index}`}>{group.heading}</h2></div>
      <span className="req-panel-badge">{group.required ? "Required details" : "Optional"}</span>
    </div>;
  }

  if (enquiryId) return <section className="section req-success"><div className="container"><div className="req-success-card req-greeting">
    <div className="req-greeting-top">
      <span className="req-greeting-check" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none"><path d="m8 16 5 5 11-11" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg></span>
      <div className="eyebrow">SUCCESSFULLY SUBMITTED</div>
      <h2 ref={successHeadingRef} tabIndex={-1}>Thank you, {data.name.trim()}!</h2>
      <p className="req-greeting-message" role="status">We’ve received your requirement.</p>
      <p>Our team will review your specifications and contact you to discuss the next steps. We look forward to engineering a solution with you.</p>
      <div className="req-greeting-signature">— Team Tech Actuation Industries</div>
    </div>
    <div className="req-reference-box"><span>Your enquiry reference</span><strong>{enquiryId}</strong><small>Keep this reference for your discussion with our team.</small></div>
    <details className="req-submitted-details"><summary>View your submitted configuration</summary><dl className="req-summary-list">{rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></details>
    <div className="actions"><Link className="button" href="/">Back to Home <Arrow /></Link><button className="button req-secondary" onClick={() => { setData({ ...initialConfiguration, accessories: [], specialOptions: [] }); setEnquiryId(""); requestId.current = ""; setError(""); setErrorSection(null); window.scrollTo({ top: 0, behavior: "smooth" }); }}>New Requirement</button></div>
    <p className="req-greeting-contact">Need to add something? <a href="tel:+919311742040">Call +91 9311742040</a></p>
  </div></div></section>;

  return <section className="req-section"><div className="container">
    <div className="req-layout">
      <form onSubmit={submit} className="req-form req-organized-form" noValidate>
        <section className="req-panel" id="requirement-group-0" aria-labelledby="requirement-group-heading-0">
          {groupHeader(0)}
          <div className="req-product-setup">
        {section(0, <div className="req-choice-grid two">{TYPES.map(item => choice(item.value, item.image, item.description))}</div>)}
        {section(1, <div className="req-choice-grid two">{["Upward", "Downward"].map(value => choice(value, `${data.screwType === "Rotating Type" ? "rotating" : "translating"}-${value === "Upward" ? "upward" : "inverted"}.webp`, value === "Upward" ? "Upright installation" : "Inverted installation", "orientation"))}</div>)}
          </div>
        {section(2, <div className="req-choice-grid">{HEADS.map(item => choice(item.value, item.image, undefined, "headType"))}</div>)}
        </section>
        <section className="req-panel" id="requirement-group-1" aria-labelledby="requirement-group-heading-1">
          {groupHeader(1)}
        {section(3, <><div className="req-field-label">Load capacity <span>*</span><small>Required capacity in metric tons</small></div><div className="req-capacities">{CAPACITIES.map(value => <label key={value} className={data.capacity === value ? "is-selected" : ""}><input type="radio" name="capacity" value={value} checked={data.capacity === value} onChange={() => update("capacity", value)} /><strong>{value === "Other" ? "Other" : `${value} ton`}</strong></label>)}</div>{data.capacity === "Other" && <label className="req-field">Custom load capacity (ton) <span>*</span><input name="customCapacity" type="number" min="0.001" max="100000" step="any" placeholder="e.g. 15" value={data.customCapacity} onChange={event => update("customCapacity", event.target.value)} /></label>}<div className="req-fields-row"><label className="req-field">Quantity <span>*</span><input name="quantity" type="number" min="1" max="100000" step="1" value={data.quantity} onChange={event => update("quantity", event.target.value)} /></label><label className="req-field">Stroke length (mm) <small>Optional</small><input name="stroke" type="number" min="0.001" max="1000000" step="any" placeholder="e.g. 300" value={data.stroke} onChange={event => update("stroke", event.target.value)} /></label></div><p className="req-help">These are your requested specifications. Our team will confirm a suitable configuration for your application.</p></>)}
        </section>
        <section className="req-panel" id="requirement-group-2" aria-labelledby="requirement-group-heading-2">
          {groupHeader(2)}
        {section(4, <><div className="req-choice-grid">{ACCESSORIES.map(item => <label key={item.value} className={`req-choice ${data.accessories.includes(item.value) ? "is-selected" : ""}`}><input type="checkbox" name="accessories" value={item.value} checked={data.accessories.includes(item.value)} onChange={() => toggle("accessories", item.value)} /><span className="req-choice-tick" aria-hidden="true">{data.accessories.includes(item.value) ? "✓" : "+"}</span><span className="req-choice-image"><Image src={`/images/${item.image}`} width={260} height={200} alt="" sizes="(max-width: 600px) 40vw, 200px" /></span><strong>{item.value}</strong></label>)}</div><p className="req-help">Optional · Select multiple accessories, or leave all unselected.</p></>)}
        {section(5, <><div className="req-special-options">{SPECIAL_OPTIONS.map((value, index) => <label key={value} className={`req-special ${data.specialOptions.includes(value) ? "is-selected" : ""}`}><input type="checkbox" name="specialOptions" value={value} checked={data.specialOptions.includes(value)} onChange={() => toggle("specialOptions", value)} /><Icon name={index === 0 ? "shield" : "target"} /><span><strong>{value}</strong><small>{index === 0 ? "Request a provision to prevent screw rotation." : "Request an arrangement to reduce axial backlash."}</small></span><span className="req-special-check" aria-hidden="true">{data.specialOptions.includes(value) ? "✓" : "+"}</span></label>)}</div><p className="req-help">Optional · Availability and suitability will be confirmed by our engineering team.</p></>)}
        </section>
        <section className="req-panel" id="requirement-group-3" aria-labelledby="requirement-group-heading-3">
          {groupHeader(3)}
        {section(6, <><div className="req-fields-row"><label className="req-field">Your name <span>*</span><input name="name" autoComplete="name" maxLength={100} required value={data.name} onChange={event => update("name", event.target.value)} /></label><label className="req-field">Mobile / WhatsApp <span>*</span><input name="phone" type="tel" autoComplete="tel" maxLength={30} required placeholder="+91" value={data.phone} onChange={event => update("phone", event.target.value)} /></label></div><div className="req-fields-row"><label className="req-field">Company name <small>Optional</small><input name="company" autoComplete="organization" maxLength={120} value={data.company} onChange={event => update("company", event.target.value)} /></label><label className="req-field">Email <small>Optional</small><input name="email" type="email" autoComplete="email" maxLength={120} value={data.email} onChange={event => update("email", event.target.value)} /></label></div><label className="req-field">Application / special requirements <small>Optional</small><textarea name="notes" rows={4} maxLength={1500} placeholder="Application, mounting details, operating conditions or any other requirements…" value={data.notes} onChange={event => update("notes", event.target.value)} /></label><div className="req-honeypot" aria-hidden="true"><label>Leave this field empty<input name="website" tabIndex={-1} autoComplete="off" value={data.website} onChange={event => update("website", event.target.value)} /></label></div><p className="req-help">Submit your requirement so Tech Actuation Industries can contact you about this enquiry.</p><div className="req-review"><h3>Your configuration</h3><dl className="req-summary-list">{rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><a className="text-link" href="#requirement-section-0">Edit selections above <Arrow /></a></div></>)}
        {error && errorSection === null && <p role="alert" className="req-error">{error}</p>}
        <div className="req-form-actions req-single-submit">
          <p>Review your selections above, then send your requirement.</p>
          <button className="button" disabled={pending} type="submit">{pending ? "Saving your requirement…" : "Submit Requirement"}{!pending && <Arrow />}</button>
        </div>
        </section>
      </form>
      <aside className="req-sidebar"><div className="req-summary-card"><div className="eyebrow">YOUR REQUIREMENT</div><h3>Your configuration</h3><p className="req-summary-intro">Your selections update here as you fill in the form.</p><dl className="req-summary-list">{rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><div className="req-advice"><Icon name="support" /><div><strong>Need help choosing?</strong><a href="tel:+919311742040">Talk to Kamlesh<br />+91 9311742040</a></div></div></div></aside>
    </div>
  </div></section>;
}
