"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import companyLogo from "../public/images/company-logo.webp";
import { companyContact, products } from "./data";
import { Arrow, Icon } from "./icons";

const navigation = [
  ["Home", "/"], ["Industries", "/#industries"], ["About Us", "/about"], ["Contact Us", "/contact"],
];

export function SiteHeader() {
  const headerRef = useRef<HTMLElement>(null);
  function closeMenus() {
    headerRef.current?.querySelectorAll("details[open]").forEach(menu => menu.removeAttribute("open"));
  }
  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (event.target instanceof Node && !headerRef.current?.contains(event.target)) closeMenus();
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        const openMenu = headerRef.current?.querySelector("details[open]");
        openMenu?.querySelector("summary")?.focus();
        closeMenus();
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return <>
    <div className="utility-bar"><div className="container utility-inner">
      <span><span className="utility-dot" />Precision engineering. Made in India.</span>
      <div><a href={`mailto:${companyContact.email}`}><Icon name="mail" />{companyContact.email}</a><a href={companyContact.phones[0].href}><Icon name="phone" />{companyContact.phones[0].label}</a></div>
    </div></div>
    <header className="site-header" ref={headerRef} onClick={event => {
      if (event.target instanceof Element && event.target.closest("a")) closeMenus();
    }}>
      <div className="container site-nav-inner">
        <Link href="/" className="site-logo" aria-label="Tech Actuation Industries home"><Image src={companyLogo} fill sizes="(max-width: 600px) 205px, 260px" alt="Tech Actuation Industries — Innovate, Automate, Elevate" preload /></Link>
        <nav className="site-desktop-nav" aria-label="Main navigation">
          <Link href="/">Home</Link>
          <details className="site-products-menu"><summary>Products <Icon name="chevron" /></summary>
            <div className="site-products-panel">
              <div className="site-products-intro"><span className="eyebrow">OUR EXPERTISE</span><h2>Engineered<br />for motion.</h2><p>Find the right components for your next application.</p><Link href="/worm-gear-screw-jacks">Explore screw jacks <Arrow /></Link></div>
              <div className="site-products-links">{products.filter(product => !product.slug.includes("#")).map(product => <Link href={`/${product.slug}`} key={product.slug}><span>{product.category}</span><strong>{product.name}</strong><Arrow /></Link>)}</div>
            </div>
          </details>
          {navigation.slice(1).map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
        </nav>
        <Link href="/requirement" className="button site-quote">Get a Quote <Arrow /></Link>
        <details className="site-mobile-menu"><summary aria-label="Toggle navigation"><span className="menu-bars"><i /><i /><i /></span><span className="menu-label">Menu</span></summary>
          <nav aria-label="Mobile navigation"><span className="mobile-nav-kicker">EXPLORE TECH ACTUATION</span>{navigation.map(([label, href]) => <Link key={href} href={href}>{label}<Arrow /></Link>)}<details className="mobile-products"><summary>Our Products <Icon name="chevron" /></summary><div><Link href="/worm-gear-screw-jacks">All Screw Jacks</Link>{products.filter(product => !product.slug.includes("#")).map(product => <Link key={product.slug} href={`/${product.slug}`}>{product.name}</Link>)}</div></details><Link href="/requirement" className="button">Build Your Requirement <Arrow /></Link><a className="mobile-nav-phone" href={companyContact.phones[0].href}><Icon name="phone" />{companyContact.phones[0].label}</a></nav>
        </details>
      </div>
    </header>
  </>;
}
