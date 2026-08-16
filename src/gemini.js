import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.warn(
    "VITE_GEMINI_API_KEY is not configured."
  );
}

const ai = new GoogleGenAI({
  apiKey,
});


/* =========================================================
   MODELS
========================================================= */

const PRIMARY_MODEL =
  "gemini-3.6-flash";

const FALLBACK_MODEL =
  "gemini-3.5-flash-lite";


/* =========================================================
   HELPER
========================================================= */

function sleep(ms) {
  return new Promise(
    (resolve) => setTimeout(resolve, ms)
  );
}


/* =========================================================
   GEMINI REQUEST WITH FALLBACK
========================================================= */

async function generateWithFallback(
  contents,
  config = {}
) {

  try {

    return await ai.models.generateContent({
      model: PRIMARY_MODEL,
      contents,
      config,
    });

  } catch (primaryError) {

    console.warn(
      `${PRIMARY_MODEL} failed. Trying fallback model...`,
      primaryError
    );


    /*
      Gemini can temporarily return 503
      when a model is under heavy demand.

      Wait briefly before trying the
      fallback model.
    */

    if (
      primaryError?.status === 503 ||
      primaryError?.code === 503 ||
      primaryError?.message?.includes(
        "high demand"
      )
    ) {

      await sleep(1500);

      return await ai.models.generateContent({
        model: FALLBACK_MODEL,
        contents,
        config,
      });

    }


    throw primaryError;
  }
}


/* =========================================================
   TEXT GENERATION
========================================================= */

export async function askGemini(
  prompt
) {

  try {

    const response =
      await generateWithFallback(
        prompt
      );

    return response.text || "";

  } catch (error) {

    console.error(
      "Gemini API error:",
      error
    );

    throw error;
  }
}


/* =========================================================
   PRESCRIPTION ANALYSIS
========================================================= */

export async function analyzePrescription(
  prescription
) {

  if (!prescription) {
    throw new Error(
      "No prescription was provided."
    );
  }


  if (!prescription.data) {
    throw new Error(
      "Prescription file data is missing."
    );
  }


  if (!prescription.type) {
    throw new Error(
      "Prescription file type is missing."
    );
  }


  /*
    Convert the stored data URL:

    data:image/jpeg;base64,ABC123...

    into:

    ABC123...
  */

  const base64Data =
    prescription.data.includes(",")
      ? prescription.data.split(",")[1]
      : prescription.data;


  /* =======================================================
     PROMPT
  ======================================================= */

  const prompt = `
You are DoseTwin's prescription analysis AI.

Analyze the uploaded prescription carefully.

Your job is to extract ONLY information that
can be confidently identified from the prescription.

Do NOT invent information.

Return ONLY valid JSON.

Use exactly this structure:

{
  "medicines": [
    {
      "name": "",
      "dosage": "",
      "form": "",
      "frequency": "",
      "doseTimes": [],
      "prescribedQuantity": 0,
      "startDate": "",
      "endDate": "",
      "instructions": ""
    }
  ],
  "doctorName": "",
  "patientName": "",
  "prescriptionDate": "",
  "notes": ""
}

IMPORTANT RULES:

1. Do not invent missing information.

2. Use an empty string when information
   cannot be confidently identified.

3. Use 0 when prescribed quantity is
   unavailable.

4. Keep medicine names as written in
   the prescription whenever possible.

5. Preserve dosage units such as:
   mg, mcg, g, mL, IU, etc.

6. Convert clearly stated frequencies
   into readable values such as:

   "Once daily"
   "Twice daily"
   "Three times daily"
   "Four times daily"
   "As needed"

7. If exact dose times are explicitly
   written, return them in HH:MM format.

8. If exact dose times are NOT written,
   leave doseTimes as an empty array.

9. Do not make medical recommendations.

10. Do not change the doctor's prescription.

11. Do not infer a medicine from context.

12. If handwriting is unclear, leave the
    relevant field empty instead of guessing.

13. If multiple medicines are present,
    return each medicine separately.

14. Quantity must only be included when
    explicitly stated.

15. Dates must only be included when
    explicitly stated.

16. The uploaded document is the source
    of truth.

Analyze the prescription now.
`;


  /* =======================================================
     GEMINI CONTENT
  ======================================================= */

  const contents = [

    {
      text: prompt,
    },

    {
      inlineData: {
        mimeType:
          prescription.type,

        data:
          base64Data,
      },
    },

  ];


  /* =======================================================
     API REQUEST
  ======================================================= */

  try {

    const response =
      await generateWithFallback(
        contents,
        {
          responseMimeType:
            "application/json",
        }
      );


    const text =
      response.text || "{}";


    console.log(
      "Gemini prescription response:",
      text
    );


    const parsed =
      JSON.parse(text);


    return parsed;

  } catch (error) {

    console.error(
      "Prescription analysis error:",
      error
    );

    throw error;
  }
}


export default ai;