import Link from "next/link";

type DetailSection = { title: string; items: { title: string; text: string }[] };

const rotating: DetailSection[] = [
  { title: "How it works", items: [
    { title: "Input drive", text: "A motor or handwheel turns the horizontal worm shaft." },
    { title: "Fixed screw rotation", text: "The lifting screw is keyed or fastened to the internal worm gear. As the worm shaft drives the gear, the screw rotates on its own axis while remaining fixed axially; it does not move up or down through the housing." },
    { title: "Traveling nut motion", text: "A bronze nut or ball nut is attached to the load. With the load guided to prevent the nut from rotating, the spinning screw drives the nut and attached load along its threads." },
  ] },
  { title: "Key advantages over translating jacks", items: [
    { title: "No bottom clearance needed", text: "The screw never passes through the gearbox, so no unused screw length projects below the housing. This removes the need for a lower stem cover tube or pit space for screw travel." },
    { title: "Easier load attachment", text: "A traveling nut with a flanged housing and mounting holes can be bolted directly to a platform, carriage or door." },
    { title: "Supported long strokes", text: "An end bearing can support the far tip of the rotating screw. A correctly engineered support arrangement improves resistance to buckling and can enable longer strokes; screw speed, alignment and critical speed must also be checked." },
  ] },
  { title: "Key trade-offs to watch for", items: [
    { title: "Exposed screw threads", text: "The threaded length remains exposed as the nut travels. Specify suitable bellows boots or other protection for dust, debris and washdown environments." },
    { title: "Guide rails are critical", text: "Guide the load and restrain the traveling nut against rotation. Without this restraint, the nut can turn with the screw instead of moving linearly. External guides should carry side loads." },
    { title: "Confirm load-holding requirements", text: "Trapezoidal (Acme) versions may be self-locking, depending on screw lead, gear ratio, lubrication, load and operating conditions. Confirm this for the selected model. High-efficiency ball screw versions suit faster travel and higher duty cycles but require an external brake or appropriate holding arrangement." },
  ] },
  { title: "Common applications", items: [
    { title: "Compact lifting systems", text: "AGV lifting mechanisms and scissor lift tables where vertical installation space is limited." },
    { title: "Guided doors and assembly lines", text: "Vertical or horizontal doors, sluice gates and factory assembly lines where the nut moves along a fixed track." },
    { title: "Long travel equipment", text: "Packaging machines and steel-working equipment requiring long, supported strokes." },
  ] },
];

const translating: DetailSection[] = [
  { title: "How it works", items: [
    { title: "Input drive", text: "A handwheel, electric motor or hydraulic motor rotates the horizontal worm shaft." },
    { title: "Gear reduction", text: "The worm shaft meshes with the internal worm wheel, reducing rotational speed and multiplying torque." },
    { title: "Linear translation", text: "Internal threads in the worm gear act as a rotating nut. When the lifting screw is prevented from rotating, the spinning gear forces the screw to extend or retract through the gearbox, directly pushing or pulling the load." },
  ] },
  { title: "Two main variations", items: [
    { title: "Standard translating", text: "The screw is not internally keyed. Bolt or pin its end to a suitably guided load, or engineer a linked multiple-jack arrangement that restrains screw rotation. Thread friction will otherwise tend to turn the screw." },
    { title: "Keyed for non-rotation", text: "A key inside the housing engages a milled keyway along the lifting screw, preventing rotation while allowing linear travel. This suits single-jack arrangements with an unattached or free-standing load. The key prevents rotation; external guidance is still needed wherever the load requires lateral support." },
  ] },
  { title: "Key characteristics and advantages", items: [
    { title: "Load holding", text: "Many trapezoidal (Acme) configurations resist back-driving, but self-locking depends on the actual design and operating conditions. Confirm the selected model's holding capability. Ball screw versions offer greater efficiency and speed and require a brake or other holding arrangement." },
    { title: "Load capacity and precision", text: "Screw jacks provide accurate, repeatable positioning across a broad range of lifting requirements. Select capacity for the actual load, stroke, mounting and duty cycle, and confirm the model rating with our team." },
    { title: "Mechanical synchronization", text: "Multiple jacks can be linked with drive shafts, couplings and bevel gearboxes to raise large platforms together. Check load distribution, alignment and drive sizing for the complete system." },
    { title: "Protection tube and clearance", text: "The unused screw length extends below the gearbox during travel. Allow adequate clearance and fit a stem cover or protection tube to shield the screw from dust and help retain grease." },
  ] },
  { title: "Common applications", items: [
    { title: "Lifting and leveling", text: "Industrial platforms, stage lifts and heavy machinery requiring controlled height adjustment." },
    { title: "Roller adjustment", text: "Positioning feed rollers in printing presses and steel mills." },
    { title: "Gates, dampers and valves", text: "Opening and closing large sluice gates, industrial dampers and valves." },
    { title: "Tracking and positioning", text: "Positioning solar trackers and satellite antennas." },
  ] },
];

export function ScrewJackDetails({ slug }: { slug: string }) {
  const sections = slug === "rotating-screw-jacks" ? rotating : slug === "translating-screw-jacks" ? translating : null;
  if (!sections) return null;
  return <div className="screw-details">{sections.map((section, index) => <section key={section.title} aria-labelledby={`jack-detail-${index}`}>
    <h2 id={`jack-detail-${index}`}>{section.title}</h2>
    <dl className="screw-detail-grid">{section.items.map(item => <div key={item.title}><dt>{item.title}</dt><dd>{item.text}</dd></div>)}</dl>
  </section>)}</div>;
}

export function ScrewJackSelectionGuide() {
  return <section className="section selection-guide"><div className="container">
    <div className="eyebrow">SCREW JACK SELECTION GUIDE <i /></div>
    <h2>Choose the motion your application needs.</h2>
    <p>Screw jacks lift, lower, push, pull and position loads. Start with the required movement, then match the screw and drive design to the load, speed and operating conditions.</p>
    <div className="selection-table-wrap"><table className="selection-table"><caption>Three main screw jack configurations</caption><thead><tr><th scope="col">Configuration</th><th scope="col">What moves?</th><th scope="col">Installation requirement</th></tr></thead><tbody>
      <tr><th scope="row"><Link href="/translating-screw-jacks">Standard translating</Link></th><td>The lifting screw travels through the housing.</td><td>Restrain screw rotation through the guided load and allow clearance below the housing.</td></tr>
      <tr><th scope="row"><Link href="/translating-screw-jacks">Keyed translating</Link></th><td>The lifting screw travels; an internal key prevents rotation.</td><td>Useful with free-standing loads or a pivoting screw end. Allow screw travel clearance and guide the load as required.</td></tr>
      <tr><th scope="row"><Link href="/rotating-screw-jacks">Rotating / traveling nut</Link></th><td>The screw spins in place; the nut carries the load along it.</td><td>Attach the load to the nut and prevent nut rotation. Suitable where bottom clearance is limited.</td></tr>
    </tbody></table></div>
    <div className="selection-points"><div><h3>Match the screw and drive</h3><p>Worm gear machine screw jacks commonly use Acme or trapezoidal threads for general lifting and positioning. Ball screw jacks offer higher efficiency for faster travel and higher duty cycles. Bevel gear screw jacks provide another drive option for faster lifting and linked systems; they are distinct from the bevel gearboxes used to connect multiple jacks.</p></div><div><h3>Share your selection criteria</h3><p>Specify load per jack, stroke, travel speed, duty cycle, required positioning accuracy, mounting orientation, available clearance and operating environment. Include guidance, end support, synchronization and braking requirements when discussing your system.</p></div></div>
    <p className="selection-note">Efficiency and self-locking depend on the design, lead, ratio, lubrication, load and operating conditions. Confirm holding requirements for the selected jack with our team.</p>
    <Link href="/requirement" className="text-link">Build your screw jack requirement →</Link>
  </div></section>;
}
