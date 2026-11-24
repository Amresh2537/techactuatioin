# Connect the requirement page to the existing Enquiries sheet

The website page is `/requirement`. Its server endpoint, `/api/requirements`, sends validated JSON to your existing Apps Script deployment. A success message appears only after Apps Script confirms the saved enquiry ID. Failed submissions keep the form filled in. A stable request ID prevents retries from creating duplicate rows.

## Update the existing Apps Script

1. Open your original Google Sheet → Extensions → Apps Script.
2. Replace `Code.gs` with the accompanying `Code.gs`. Keep your existing `Index.html` file. The old sample continues to use `submitEnquiry`.
3. Run `setup()` once from the editor. This records the bound spreadsheet ID and creates `Enquiries` only if needed. It preserves the existing 13 columns and rows. If headers differ, it stops instead of overwriting them.
4. Deploy → Manage deployments → Edit the existing web app → New version. The Next.js server must be able to call the web app without signing into a Google account. The intake web app should execute as the sheet owner and permit anonymous submissions. This allows new enquiries to be added; it does not share the spreadsheet itself. If your Workspace policy does not allow this, use an authenticated Sheets backend instead.
5. Keep the existing deployment URL. If a new URL is issued, set `GOOGLE_APPS_SCRIPT_URL` in `.env.local` and your hosting environment. Restart the development server after changing environment variables.
6. Submit one labelled test enquiry through `/requirement` and verify the row in `Enquiries` before going live.

Optional server-to-script credential: set the same random value as Script Property `WEBSITE_SECRET` and server environment variable `GOOGLE_APPS_SCRIPT_SECRET`. Never prefix this variable with `NEXT_PUBLIC_`. The original Apps Script HTML form continues using its existing `google.script.run` call.

## Preserved sheet columns

Submitted At · Enquiry ID · Screw Jack Type · Screw Orientation · Head Type · Load Capacity (Ton) · Quantity · Customer Name · Company Name · Mobile / WhatsApp · Email · Special Requirements · Status

Accessories, special options, optional stroke length and application notes are saved together in **Special Requirements**. Head 5, Head 6 and capacities 2.5 / 20 ton were added from the supplied sketches; 3 ton is retained from the supplied script. Requested configurations are subject to engineering confirmation.

The provided deployment is configured as the default server endpoint. Until the script is updated and callable by the Next.js server, saving will return a visible error rather than showing a false success.

References: [Apps Script web apps](https://developers.google.com/apps-script/guides/web), [Content Service](https://developers.google.com/apps-script/guides/content).
