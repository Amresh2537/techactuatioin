import { normalizeConfiguration, validateStep, STEPS } from "../../requirement/configuration";

const DEFAULT_SCRIPT_URL = "https://script.google.com/a/macros/timeequipment.co.in/s/AKfycbxcRKzTGFfqqBHwGOxMGe9k5qdlZSCZ93iukkrqdbQnuJmuZqtmlqcDfSoL_qcfQ67e/exec";

export async function POST(request: Request) {
  const json = (body: object, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
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
    if (!response.ok) throw new Error("Integration unavailable");
    const result = await response.json();
    if (result.success !== true || typeof result.enquiryId !== "string" || !/^SJ-[A-Z0-9-]{8,64}$/i.test(result.enquiryId)) throw new Error("Submission not acknowledged");
    return json({ success: true, enquiryId: result.enquiryId });
  } catch {
    return json({ error: "We couldn’t confirm that your requirement was saved. Your selections are still here. Please retry, or call +91 9311742040." }, 502);
  }
}
