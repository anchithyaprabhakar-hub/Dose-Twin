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
   GEMINI MODEL
========================================================= */

const MODEL = "gemini-3.6-flash";


/* =========================================================
   TEXT GENERATION
========================================================= */

export async function askGemini(prompt) {
  try {
    const response =
      await ai.models.generateContent({
        model: MODEL,
        contents: prompt,
      });

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
   PRESCRIPTION SCHEMA
========================================================= */

const prescriptionSchema = {
  type: "object",

  properties: {

    medicines: {
      type: "array",

      items: {
        type: "object",

        properties: {

          name: {
            type: "string"
          },

          dosage: {
            type: "string"
          },

          form: {
            type: "string"
          },

          frequency: {
            type: "string"
          },

          doseTimes: {
            type: "array",

            items: {
              type: "string"
            }
          },

          prescribedQuantity: {
            type: "integer"
          },

          startDate: {
            type: "string"
          },

          endDate: {
            type: "string"
          },

          instructions: {
            type: "string"
          }

        },

        required: [
          "name",
          "dosage",
          "form",
          "frequency",
          "doseTimes",
          "prescribedQuantity",
          "startDate",
          "endDate",
          "instructions"
        ]
      }
    },

    doctorName: {
      type: "string"
    },

    patientName: {
      type: "string"
    },

    prescriptionDate: {
      type: "string"
    },

    notes: {
      type: "string"
    }

  },

  required: [
    "medicines",
    "doctorName",
    "patientName",
    "prescriptionDate",
    "notes"
  ]
};


/* =========================================================
   PRESCRIPTION PROMPT
========================================================= */

const prescriptionPrompt = `
You are DoseTwin's prescription
information extraction system.

Analyze the attached prescription document.

Extract ONLY information that is
clearly visible or explicitly stated.

This is an information extraction task.

DO NOT:

- diagnose the patient
- recommend medicines
- change the prescription
- invent missing information
- infer medical information that is not written
- alter dosage instructions

Extract the following:

- medicine name
- dosage
- medicine form
- frequency
- exact dose times
- prescribed quantity
- start date
- end date
- instructions
- doctor name
- patient name
- prescription date
- other relevant notes

Rules:

1. Keep medicine names exactly as written
   whenever possible.

2. Preserve dosage units such as:
   mg
   mcg
   g
   mL
   IU

3. Convert clearly stated frequencies into
   readable values such as:

   Once daily
   Twice daily
   Three times daily
   Four times daily
   As needed

4. If exact dose times are explicitly written,
   return them in HH:MM format.

5. If exact dose times are not written,
   return an empty array.

6. If prescribed quantity is unavailable,
   return 0.

7. If information is unavailable,
   return an empty string.

8. Never invent missing information.

9. Preserve the doctor's instructions.

10. If the document is unclear or unreadable,
    leave the uncertain field empty.

Return ONLY the requested JSON structure.
`;


/* =========================================================
   ANALYZE PRESCRIPTION FILE
========================================================= */

export async function analyzePrescription(
  prescriptionFile
) {

  try {

    if (!prescriptionFile) {
      throw new Error(
        "No prescription file was provided."
      );
    }


    if (!prescriptionFile.data) {
      throw new Error(
        "Prescription file data is missing."
      );
    }


    if (!prescriptionFile.type) {
      throw new Error(
        "Prescription file type is missing."
      );
    }


    /*
      The uploaded file is stored by
      Prescriptions.jsx as:

      data:image/jpeg;base64,AAAA...

      or

      data:application/pdf;base64,AAAA...
    */

    const dataUrl =
      prescriptionFile.data;


    const commaIndex =
      dataUrl.indexOf(",");


    if (commaIndex === -1) {
      throw new Error(
        "Invalid prescription file data."
      );
    }


    /*
      Extract only the Base64 portion.
    */

    const base64Data =
      dataUrl.substring(
        commaIndex + 1
      );


    /*
      Send the actual prescription file
      to Gemini.
    */

    const response =
      await ai.models.generateContent({

        model: MODEL,

        contents: [

          {
            inlineData: {
              mimeType:
                prescriptionFile.type,

              data:
                base64Data
            }
          },

          {
            text:
              prescriptionPrompt
          }

        ],

        config: {

          responseMimeType:
            "application/json",

          responseSchema:
            prescriptionSchema

        }

      });


    const text =
      response.text || "{}";


    const result =
      JSON.parse(text);


    return result;


  } catch (error) {

    console.error(
      "Prescription analysis error:",
      error
    );

    throw error;
  }
}


/* =========================================================
   DEFAULT EXPORT
========================================================= */

export default ai;