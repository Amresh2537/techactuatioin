import type { Metadata } from "next";
import { Suspense } from "react";
import { Header, Footer } from "./ui";
import { FloatingWhatsApp } from "./floating-whatsapp";
import "./globals.css";
export const metadata: Metadata = {
 title: "Worm Gear Screw Jack Manufacturer in India – Tech Actuation Industries",
 description: "Tech Actuation Industries is a Faridabad-based manufacturer of worm gear screw jacks, industrial hydraulic cylinders and customized actuation solutions in India.",
 keywords: ["Worm Gear Screw Jack Manufacturer", "Screw Jack Manufacturer in India", "Industrial Hydraulic Cylinder", "Mechanical Screw Jack", "Translating Screw Jack", "Rotating Screw Jack", "Industrial Bevel Gearbox", "Screw Jack Accessories", "Industrial Actuation Solutions", "Screw Jack Manufacturer in Faridabad", "Industrial Lifting Solutions", "Custom Screw Jack Manufacturer"],
 icons: { icon: "/icon.svg" },
};
export default function RootLayout({ children }: {children: React.ReactNode}) {
 return <html lang="en"><body><a className="skip-link" href="#main">Skip to content</a><Header />{children}<Footer /><Suspense fallback={null}><FloatingWhatsApp /></Suspense></body></html>;
}
