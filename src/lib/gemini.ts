import type { Dose } from "../types/dose";

// Lite models first: much bigger free daily limit.
const MODELS = ["gemini-3.5-flash-lite", "gemini-3.1-flash-lite", "gemini-3.8-flash"];
const TIMEOUT_MS = 45000;

const getKey = () => {
  const key = (process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? "").trim();
  if (!key) throw new Error("Gemini key is missing from .env");
  return key;
};

async function callGemini(model: string, key: string, body: string) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body,
        signal: controller.signal,
      }
    );
  } finally {
    clearTimeout(timer);
  }
}

export async function readPrescription(base64: string): Promise<Dose[]> {
  const key = getKey();

  const prompt =
    "You are reading a photo of a medical prescription. It may be handwritten, " +
    "Indian, and may contain Bengali or Hindi text. List every medicine prescribed. " +
    "Return ONLY a JSON array. Each item has: medicine (string), dosage (string, " +
    "like '500 mg' or '1 tablet'), time (string, 24-hour HH:MM for each daily dose; " +
    "make one item per dose, so a twice-daily medicine becomes two items, e.g. " +
    "morning 08:00, afternoon 14:00, night 21:00), note (string, e.g. 'after food', " +
    "or empty). If you cannot read something, make your best guess and add " +
    "'unclear' to the note. If there are no medicines, return [].";

  const body = JSON.stringify({
    contents: [
      {
        parts: [
          { text: prompt },
          { inline_data: { mime_type: "image/jpeg", data: base64 } },
        ],
      },
    ],
    generationConfig: { responseMimeType: "application/json" },
  });

  let lastStatus = 0;
  let timedOut = false;

  for (const model of MODELS) {
    let res: Response;
    try {
      res = await callGemini(model, key, body);
    } catch {
      timedOut = true;
      continue;
    }

    if (res.ok) {
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "[]";
      const clean = text.replace(/```json|```/g, "").trim();
      let items: any[] = [];
      try {
        const parsed = JSON.parse(clean);
        items = Array.isArray(parsed) ? parsed : [];
      } catch {
        throw new Error("Gemini returned an unreadable answer. Try a clearer photo.");
      }
      return items.map((d, i) => ({
        id: String(Date.now()) + "-" + i,
        medicine: String(d.medicine ?? ""),
        dosage: String(d.dosage ?? ""),
        time: String(d.time ?? "08:00"),
        note: d.note ? String(d.note) : undefined,
      }));
    }

    lastStatus = res.status;
    if ([404, 429, 500, 502, 503, 504].includes(res.status)) continue;
    throw new Error("Gemini error " + res.status);
  }

  if (timedOut && !lastStatus) {
    throw new Error("The connection is too slow or timed out. Please try again.");
  }
  if (lastStatus === 429) {
    throw new Error("Free Gemini limit reached for now. Wait a few minutes and try again.");
  }
  throw new Error("Gemini is unavailable right now (status " + lastStatus + "). Try again shortly.");
}

export async function askGemini(question: string, context?: string): Promise<string> {
  const key = getKey();

  const systemPrompt =
    "You are VitaPilot AI, a warm personal health and wellness assistant. " +
    "Keep answers friendly, concise, and easy to read on mobile, with short bullet points. " +
    "Always remind users to consult their doctor or pharmacist for prescription decisions.";

  const prompt = context
    ? `${systemPrompt}\n\nApp Context:\n${context}\n\nUser Question: ${question}`
    : `${systemPrompt}\n\nUser Question: ${question}`;

  const body = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { maxOutputTokens: 600 },
  });

  let lastStatus = 0;
  for (const model of MODELS) {
    try {
      const res = await callGemini(model, key, body);
      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text.trim();
      }
      lastStatus = res.status;
    } catch {
      continue;
    }
  }
  throw new Error(
    lastStatus
      ? `Gemini request failed (status ${lastStatus}). Try again in a minute.`
      : "Could not reach Gemini. Please check your internet connection."
  );
}