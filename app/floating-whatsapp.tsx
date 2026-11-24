"use client";

import { usePathname } from "next/navigation";

export function FloatingWhatsApp() {
  const pathname = usePathname();
  if (pathname === "/requirement" || pathname.startsWith("/requirement/")) return null;

  return (
    <a
      className="whatsapp-contact-button"
      href="https://wa.me/919311742040?text=Hello%20Tech%20Actuation%20Industries%2C%20I%20would%20like%20to%20discuss%20my%20requirement."
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Tech Actuation Industries on WhatsApp (opens in a new tab)"
      title="Chat with us on WhatsApp"
      style={{
        position: "fixed",
        right: "max(20px, env(safe-area-inset-right, 0px))",
        bottom: "calc(20px + env(safe-area-inset-bottom, 0px))",
        top: "auto",
        left: "auto",
        zIndex: 1000,
        display: "grid",
        placeItems: "center",
        width: 58,
        height: 58,
        minWidth: 58,
        minHeight: 58,
        margin: 0,
        padding: 0,
        border: "2px solid #fff",
        borderRadius: "50%",
        background: "linear-gradient(145deg, #2cdb78, #0aab53)",
        color: "#fff",
        boxShadow: "0 7px 24px #06733855, 0 0 0 5px #25d3661a",
        textDecoration: "none",
      }}
    >
      <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ display: "block", width: 30, height: 30, flexShrink: 0 }}>
            <path d="M20.52 3.48A11.9 11.9 0 0 0 12.05 0C5.46 0 .1 5.36.1 11.95c0 2.11.55 4.17 1.6 5.99L0 24l6.21-1.63a11.97 11.97 0 0 0 5.83 1.49h.01c6.59 0 11.95-5.36 11.95-11.95 0-3.19-1.24-6.19-3.48-8.43ZM12.05 21.84a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.69.97.98-3.6-.24-.37a9.88 9.88 0 0 1-1.52-5.3c0-5.48 4.46-9.94 9.95-9.94 2.65 0 5.15 1.04 7.02 2.92a9.88 9.88 0 0 1 2.91 7.03c0 5.48-4.46 9.94-9.94 9.94Zm5.45-7.44c-.3-.15-1.77-.87-2.04-.97-.28-.1-.48-.15-.68.15-.2.3-.77.97-.95 1.17-.17.2-.35.23-.65.08-.3-.15-1.26-.46-2.41-1.49-.9-.8-1.5-1.78-1.68-2.08-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.68-1.62-.93-2.22-.24-.58-.49-.5-.68-.51H7.76c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.49 0 1.47 1.07 2.89 1.22 3.09.15.2 2.1 3.2 5.08 4.49.71.31 1.27.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z" />
          </svg>
    </a>
  );
}
