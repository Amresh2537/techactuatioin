export function Arrow(){return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M4 12h15M13 5l7 7-7 7"/></svg>;}
export function Icon({name}:{name:string}) {
 const paths: Record<string,React.ReactNode> = {
 target:<><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><path d="M12 1v5m0 12v5M1 12h5m12 0h5"/></>,
 shield:<><path d="M12 2 3 6v6c0 5 9 10 9 10s9-5 9-10V6z"/><path d="m8 12 3 3 5-6"/></>,
 settings:<><path d="m9 3 1-2h4l1 2 3 2 3 1v4l-2 2 2 3v3l-4 1-2 3h-5l-2-3-4-1v-4l2-2-2-3V6l3-1z"/><circle cx="12" cy="12" r="4"/></>,
 support:<><path d="M4 13v-2a8 8 0 0 1 16 0v6a4 4 0 0 1-4 4h-4"/><rect x="2" y="10" width="4" height="7" rx="2"/><rect x="18" y="10" width="4" height="7" rx="2"/></>,
 pin:<><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
 factory:<><path d="M2 21V10l7-4v6l7-4v6h6v7ZM18 14V3h3v11M5 17h2m4 0h2m4 0h2"/></>,
 boxes:<><path d="m12 2 6 3-6 3-6-3 6-3Zm-6 3v6l6 3 6-3V5M6 11l-5 3 6 3 5-3 5 3 6-3-5-3M1 14v6l6 3 5-3 5 3 6-3v-6M7 17v6m5-9v6m5-3v6M12 8v6"/></>,
 lift:<><path d="M3 21h18M6 21V8m12 13V8M3 8h18M7 3h10v5H7zM9 13h6v5H9zM12 8v5"/></>,
 automation:<><circle cx="7" cy="11" r="3"/><circle cx="16" cy="5" r="2"/><path d="m8 8 6-4m-5 9 6-6m3-2 4 5-3 3-3-3M7 14l-3 6h9l-3-6M2 23h13"/></>,
 chevron:<path d="m6 9 6 6 6-6"/>,
 chat:<path d="M21 11.5a9 9 0 0 1-13.3 7.9L3 21l1.6-4.7A9 9 0 1 1 21 11.5Z"/>,
 mail:<><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 6 10 7L22 6"/></>,
 globe:<><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/></>,
 receipt:<><path d="M5 2h14v20l-3-2-4 2-4-2-3 2V2Z"/><path d="M8 7h8M8 11h8M8 15h5"/></>,
 phone:<path d="m7 2 3 5-3 3c2 4 3 5 7 7l3-3 5 3-2 5C10 23 1 14 2 4Z"/>,
 };
 return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]||paths.settings}</svg>;
}
