import { normalizeConfiguration, validateStep, STEPS } from "../../requirement/configuration";

const DEFAULT_SCRIPT_URL = "https://script.google.com/a/macros/timeequipment.co.in/s/AKfycbxcRKzTGFfqqBHwGOxMGe9k5qdlZSCZ93iukkrqdbQnuJmuZqtmlqcDfSoL_qcfQ67e/exec";

export async function POST(request: Request) {
  const json = (body: object, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
  const fail = (code: string, detail: string) => {
    // Log only integration diagnostics; never log the enquiry or credentials.
    console.error(`[requirements] ${code}: ${detail}`);
    return json({
      error: "We couldn’t confirm that your requirement was saved. Your selections are still here. Please retry, or call +91 9311742040.",
      code,
      ...(process.env.NODE_ENV === "development" ? { detail } : {}),
    }, 502);
  };
  let input: Record<string, unknown>;
  try {
    if (Number(request.headers.get("content-length")) > 16000) return json({ error: "Your requirement is too long. Please shorten the notes." }, 413);
    const text = await request.text();
    if (text.length > 16000) return json({ error: "Your requirement is too long. Please shorten the notes." }, 413);
    input = JSON.parse(text);
  } catch { return json({ error: "Please submit a valid requirement." }, 400); }
  const data = normalizeConfiguration(input);
  if (!data || data.website || typeof input.requestId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input.requestId)) return json({ error: "Please submit a valid requirement." }, 400);
  for (let step = 0; step < STEPS.length; step++) {
    const error = validateStep(step, data);
    if (error) return json({ error }, 400);
  }
  try {
    const endpoint = new URL(process.env.GOOGLE_APPS_SCRIPT_URL || DEFAULT_SCRIPT_URL);
    if (endpoint.protocol !== "https:" || endpoint.hostname !== "script.google.com" || !endpoint.pathname.endsWith("/exec")) throw new Error("Invalid integration endpoint");
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, requestId: input.requestId, secret: process.env.GOOGLE_APPS_SCRIPT_SECRET || "" }),
      redirect: "follow",
      cache: "no-store",
      signal: AbortSignal.timeout(25000),
    });
    if (!response.ok) return fail("UPSTREAM_HTTP_ERROR", `Google returned HTTP ${response.status}. Check web-app deployment access.`);
    let result;
    try { result = await response.json(); }
    catch { return fail("UPSTREAM_NOT_JSON", "Google returned a page instead of JSON. Check doPost deployment and web-app access."); }
    if (result?.success !== true) {
      const reason = typeof result?.error === "string" ? result.error : "";
      if (reason.includes("headers do not match")) return fail("SHEET_HEADERS_MISMATCH", "Enquiries headers do not match the deployed script. Deploy the updated Code.gs, which accepts Orientation and Screw Orientation in column D.");
      if (reason.includes("Run setup") || reason.includes("target Google Sheet")) return fail("SHEET_SETUP_REQUIRED", "Run setup() in the Sheet-bound Apps Script editor, then update its deployment.");
      if (reason.includes("Invalid website credentials")) return fail("SCRIPT_SECRET_MISMATCH", "The server secret and Apps Script WEBSITE_SECRET do not match.");
      return fail("UPSTREAM_REJECTED", "Apps Script did not accept the enquiry. Check its execution logs.");
    }
    if (typeof result.enquiryId !== "string" || !/^SJ-[A-Z0-9-]{8,64}$/i.test(result.enquiryId)) return fail("INVALID_CONFIRMATION", "Apps Script returned no valid enquiry reference.");
    return json({ success: true, enquiryId: result.enquiryId });
  } catch {
    return fail("INTEGRATION_CONNECTION_FAILED", "Could not reach Apps Script or the request timed out. Check server connectivity and endpoint configuration.");
  }
}
