import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { products, seoTitles } from "../data";
import { ProductGrid, CustomSection, Cylinder } from "../ui";
import { ContactPage } from "../contact-page";
import { ScrewJackDetails, ScrewJackSelectionGuide } from "../screw-jack-details";
import { Arrow } from "../icons";
export function generateStaticParams(){return Object.keys(seoTitles).map(slug=>({slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params;return {title:seoTitles[slug],description:products.find(p=>p.slug===slug)?.description||"Tech Actuation Industries — industrial actuation solutions, precision engineering and customized manufacturing in Faridabad, India."};}
type RouteProps = { params: Promise<{ slug: string }> };

export default function Page({ params }: RouteProps) {
 return (
  <Suspense fallback={<PagePlaceholder />}>
   <RouteContent params={params} />
  </Suspense>
 );
}

function PagePlaceholder() {
 return (
  <main id="main" aria-busy="true" style={{ minHeight: "60vh" }}>
   <section className="inner-hero">
    <div className="container" style={{ paddingTop: 40 }}>
     <div className="breadcrumb"><Link href="/">Home</Link></div>
     <p role="status" style={{ paddingTop: 24 }}>Loading page…</p>
    </div>
   </section>
  </main>
 );
}

async function RouteContent({ params }: RouteProps) {
 const {slug}=await params;if(!seoTitles[slug])notFound();
 if(slug==="contact")return <ContactPage />;
 const product=products.find(p=>p.slug===slug);
 const title=slug==="about"?"Engineering solutions built around you.":slug==="worm-gear-screw-jacks"?"Worm Gear Screw Jacks":product?.name;
 return <main id="main"><section className="inner-hero"><div className="container"><div className="breadcrumb"><Link href="/">Home</Link><span>/</span>{slug==="about"?"About Us":"Our Products"}</div><div className="eyebrow light">{slug==="about"?"TECH ACTUATION INDUSTRIES":"ENGINEERED FOR MOTION"}<i/></div><h1>{title}</h1><p>{product?.description||"Precision engineering, robust product design and application-specific solutions for industrial machinery and automation."}</p></div></section>
 {slug==="about"?<section className="section"><div className="container about-grid"><div className="about-visual"><Image src="/images/Precision Components in a Modern CNC Workshop-3.png" alt="Industrial engineering components and workshop" fill sizes="(max-width: 760px) 100vw, 50vw"/></div><div className="about-copy"><div className="eyebrow">INNOVATE • AUTOMATE • ELEVATE</div><h2>Engineering with purpose.</h2><p>Tech Actuation Industries is an industrial actuation solutions manufacturer based in Faridabad, Haryana, India. We specialize in worm gear screw jacks, industrial hydraulic cylinders and customized mechanical actuation solutions.</p><p>Our focus is on precision engineering, robust product design and application-specific solutions for industrial machinery and automation requirements.</p><p>From load capacity and stroke length to mounting arrangements, our team works with your requirements to discuss a suitable actuation solution.</p><Link href="/contact" className="button">Talk to Our Team <Arrow/></Link></div></div></section>:slug==="worm-gear-screw-jacks"?<section className="section"><div className="container"><div className="eyebrow">EXPLORE THE RANGE</div><h2 className="gallery-title">A configuration for your application.</h2><ProductGrid screwOnly/></div></section>:<section className="section"><div className="container"><div className="eyebrow">PRODUCT OVERVIEW <i/></div><h2 className="gallery-title">{product?.name}</h2>{product?.variants.length?<div className="variant-grid">{product.variants.map((img,i)=><figure key={img}><div><Image src={`/images/${img}`} alt={product.labels[i]} width={600} height={550} sizes="(max-width: 600px) 90vw, 30vw"/></div><figcaption>{product.labels[i]}</figcaption></figure>)}</div>:<div className="cylinder-detail"><Cylinder/><div><h3>Configured around your requirements.</h3><p>Share your application, load capacity, stroke length, mounting arrangement and quantity with our team for a technical discussion.</p><Link className="button" href="/contact">Request a Quote <Arrow/></Link></div></div>}{slug==="accessories"&&<div id="head-options" className="head-options"><div className="eyebrow">APPLICATION-SPECIFIC OPTIONS</div><h2 className="gallery-title">Screw Jack Head Options</h2><p>Discuss the head and mounting configuration suitable for your installation.</p><div className="variant-grid">{["head-1.webp","head-3.webp","head-4.webp","head-5.webp","head-6.webp"].map((img,i)=><figure key={img}><div><Image src={`/images/${img}`} alt={`Screw jack head option ${i+1}`} width={500} height={400}/></div><figcaption>Head option {i+1}</figcaption></figure>)}</div></div>}<ScrewJackDetails slug={slug} /><div className="technical-note"><h3>Let’s find a suitable solution.</h3><p>Send your load capacity, stroke length, operating arrangement and application details. Our team can discuss configurations and technical requirements with you.</p><Link href="/contact" className="text-link">Discuss technical requirements <Arrow/></Link></div></div></section>}
 {slug==="worm-gear-screw-jacks" && <ScrewJackSelectionGuide />}
 <CustomSection />
 </main>;
}
