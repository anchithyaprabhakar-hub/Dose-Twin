import { GoogleGenAI } from "@google/genai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const ai = new GoogleGenAI({
  apiKey: API_KEY,
});

const STORAGE_KEY = "dosetwin_medicines";

/* =========================================================
   GET MEDICINES
========================================================= */

function getMedicines() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Medicine data error:", error);
    return [];
  }
}


/* =========================================================
   BUILD DOSETWIN CONTEXT
========================================================= */

function buildDoseTwinContext() {
  const medicines = getMedicines();

  if (medicines.length === 0) {
    return `
DOSETWIN MEDICATION DATA:

The user currently has no medicines stored.

Do not invent any medicines or medication information.
`;
  }

  const takenCount = medicines.filter(
    (medicine) => medicine.taken
  ).length;

  const adherence = Math.round(
    (takenCount / medicines.length) * 100
  );

  const medicationList = medicines
    .map(
      (medicine, index) => `
Medicine ${index + 1}:
Name: ${medicine.name || "Not specified"}
Dosage: ${medicine.dosage || "Not specified"}
Schedule: ${medicine.schedule || "Not specified"}
Time: ${medicine.time || "Not specified"}
Instructions: ${
        medicine.instructions || "Not specified"
      }
Status: ${medicine.taken ? "Taken" : "Pending"}
`
    )
    .join("\n");

  return `
DOSETWIN MEDICATION DATA

${medicationList}

ADHERENCE:

${takenCount} of ${medicines.length} medicines
are marked as taken today.

Current adherence: ${adherence}%

RULES:

- Use the medication data above when answering medication questions.
- Never invent medicines.
- Never change a dosage.
- Never change a schedule.
- If information is unavailable, say so.
- Do not diagnose medical conditions.
- For serious medical concerns, recommend consulting a qualified healthcare professional.
`;
}


/* =========================================================
   ASK GEMINI
========================================================= */

export async function askGemini(userPrompt) {
  try {

    if (!API_KEY) {
      console.error(
        "VITE_GEMINI_API_KEY is missing."
      );

      return `
DoseTwin AI is not configured correctly.

Please check your VITE_GEMINI_API_KEY in the .env file and restart the Vite server.
`;
    }


    const medicationContext =
      buildDoseTwinContext();


    const prompt = `
You are DoseTwin AI.

You are an intelligent medication-aware assistant
inside the DoseTwin Smart Medication Platform.

${medicationContext}

USER QUESTION:

${userPrompt}

ANSWERING RULES:

1. Answer the user's question directly.
2. Use their DoseTwin medication data when relevant.
3. Keep the answer clear and concise.
4. Never invent medication information.
5. Never modify medication dosage or schedule.
6. Do not claim to be a doctor.
7. If the user asks about their current medicines, use the exact medicines provided above.
8. If there is no medication data, clearly say that no medication data is available.
`;


    const response =
      await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
      });


    return response.text;

  } catch (error) {

    console.error(
      "DOSETWIN GEMINI ERROR:",
      error
    );


    const message =
      error?.message || "";


    if (
      message.includes("API key")
      ||
      message.includes("401")
      ||
      message.includes("403")
    ) {
      return `
DoseTwin AI could not authenticate with Gemini.

Please check your Gemini API key.
`;
    }


    if (
      message.includes("429")
    ) {
      return `
DoseTwin AI has reached the current API usage limit.

Please try again later.
`;
    }


    if (
      message.includes("404")
      ||
      message.includes("model")
    ) {
      return `
The Gemini model is currently unavailable.

Please try again later.
`;
    }


    return `
DoseTwin AI could not connect to Gemini.

Please check the browser console for the exact error.
`;
  }
}