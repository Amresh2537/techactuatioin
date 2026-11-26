This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
# techactuatioin

## Blog and admin

- Public journal: `/blog`. Published articles appear immediately; drafts remain private.
- Publishing dashboard: `/admin`. Create, edit, preview text, publish, unpublish (save as Draft), or delete posts. Deletion requires confirmation.
- Existing navigation includes the Blog link on desktop, mobile and in the footer.

Set `MONGODB_URI` and `MONGODB_DB` in `.env`. Add `BLOG_ADMIN_PASSWORD` (a long, unique password) and `BLOG_SESSION_SECRET` (at least 32 random characters; generate using `openssl rand -hex 32`). See `integrations/blog.env.example`. Configure the same variables in the hosting environment and restart the application. Never use `NEXT_PUBLIC_` for these secrets. Admin login stays disabled until both admin variables are set.

The MongoDB user needs read/write and index creation access. Posts and cover images persist in `blog_posts`; login throttling uses `blog_login_limits` with an expiry index. Allow the deployment's network access in MongoDB Atlas. Login uses an HttpOnly cookie, an eight-hour signed session and a shared limit of 20 attempts per 15-minute window. Changing the password or session secret invalidates existing sessions. Production hosting must use HTTPS.

Cover images support JPG, PNG and WebP up to 1 MB, stored in MongoDB so uploads survive deployments. Use blank lines between paragraphs, `## Heading` and `### Subheading` in the body. HTML is rendered as plain text. Choose an ASCII URL slug (even for Hindi article titles). Keep published URLs stable when editing. The dashboard loads the latest 200 posts and the public listing the latest 100; older published articles remain accessible at their URLs.
