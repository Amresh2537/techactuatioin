import type { Metadata } from "next";
import Link from "next/link";
import { RequirementBuilder } from "./requirement-builder";
export const metadata: Metadata = {
  title: "Screw Jack Requirement Form – Tech Actuation Industries",
  description: "Configure your screw jack requirement: select type, orientation, head, load capacity, accessories and special options, then send your enquiry to Tech Actuation Industries.",
};
export default function RequirementPage() {
  return <main id="main">
    <section className="inner-hero req-hero"><div className="container">
      <div className="breadcrumb"><Link href="/">Home</Link><span>/</span> Requirement</div>
      <div className="eyebrow light">YOUR APPLICATION. OUR ENGINEERING. <i /></div>
      <h1>Build your screw jack requirement.</h1>
    </div></section>
    <RequirementBuilder />
  </main>;
}
