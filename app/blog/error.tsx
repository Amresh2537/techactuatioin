'use client';
export default function BlogError({ reset }: { reset: () => void }) { return <main id="main" className="container section"><h1>Articles are temporarily unavailable.</h1><p>Please try again shortly.</p><button className="button" onClick={reset}>Try again</button></main>; }
