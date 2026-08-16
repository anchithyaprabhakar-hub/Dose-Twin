import { useState } from "react";

import {
  AlertCircle,
  CheckCircle2,
  Eye,
  FileText,
  Pill,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import {
  analyzePrescription as analyzePrescriptionFile,
} from "../gemini";

const STORAGE_KEY = "dosetwin_prescriptions";

const MEDICINE_STORAGE_KEY =
  "dosetwin_medicines";

const MEDICINE_EVENT =
  "dosetwin-medicines-updated";

/* =========================================================
   LOAD PRESCRIPTIONS
========================================================= */

function loadPrescriptions() {
  try {
    const stored =
      localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return [];
    }

    const parsed =
      JSON.parse(stored);

    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch (error) {
    console.error(
      "Could not load prescriptions:",
      error
    );

    return [];
  }
}

/* =========================================================
   SAVE PRESCRIPTIONS
========================================================= */

function savePrescriptions(
  prescriptions
) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(prescriptions)
  );
}

/* =========================================================
   LOAD MEDICINES
========================================================= */

function loadMedicines() {
  try {
    const stored =
      localStorage.getItem(
        MEDICINE_STORAGE_KEY
      );

    if (!stored) {
      return [];
    }

    const parsed =
      JSON.parse(stored);

    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch (error) {
    console.error(
      "Could not load medicines:",
      error
    );

    return [];
  }
}

/* =========================================================
   SAVE MEDICINES
========================================================= */

function saveMedicines(
  medicines
) {
  localStorage.setItem(
    MEDICINE_STORAGE_KEY,
    JSON.stringify(medicines)
  );

  /*
    Tell Medicines.jsx that the
    medicine data has changed.
  */

  window.dispatchEvent(
    new Event(MEDICINE_EVENT)
  );
}

/* =========================================================
   FORMAT TIME
========================================================= */

function formatTime(time) {
  if (!time) {
    return "";
  }

  const parts =
    time.split(":");

  if (parts.length < 2) {
    return "";
  }

  let hours =
    Number(parts[0]);

  const minutes =
    parts[1];

  if (
    Number.isNaN(hours)
  ) {
    return "";
  }

  const period =
    hours >= 12
      ? "PM"
      : "AM";

  hours =
    hours % 12 || 12;

  return `${hours}:${minutes} ${period}`;
}

/* =========================================================
   GET SCHEDULE
========================================================= */

function getSchedule(time) {
  if (!time) {
    return "Morning";
  }

  const hour =
    Number(
      time.split(":")[0]
    );

  if (
    Number.isNaN(hour)
  ) {
    return "Morning";
  }

  if (
    hour >= 5 &&
    hour < 12
  ) {
    return "Morning";
  }

  if (
    hour >= 12 &&
    hour < 17
  ) {
    return "Afternoon";
  }

  if (
    hour >= 17 &&
    hour < 21
  ) {
    return "Evening";
  }

  return "Night";
}

/* =========================================================
   NORMALIZE VALUE
========================================================= */

function normalizeText(
  value
) {
  return String(
    value || ""
  )
    .trim()
    .toLowerCase();
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

function Prescriptions() {
  const [
    prescriptions,
    setPrescriptions,
  ] = useState(
    loadPrescriptions
  );

  const [
    previewFile,
    setPreviewFile,
  ] = useState(null);

  const [
    analyzingId,
    setAnalyzingId,
  ] = useState(null);

  const [
    analyzedId,
    setAnalyzedId,
  ] = useState(null);

  const [
    analysisResults,
    setAnalysisResults,
  ] = useState({});

  /* =======================================================
     UPLOAD
  ======================================================= */

  const handleUpload = (
    event
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/webp",
    ];

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      alert(
        "Please upload a PDF or image file."
      );

      event.target.value = "";

      return;
    }

    /*
      Maximum file size:
      10 MB
    */

    if (
      file.size >
      10 * 1024 * 1024
    ) {
      alert(
        "Prescription file must be smaller than 10 MB."
      );

      event.target.value = "";

      return;
    }

    const reader =
      new FileReader();

    reader.onload = () => {
      const newPrescription = {
        id: Date.now(),

        name: file.name,

        type: file.type,

        size: file.size,

        data: reader.result,

        uploadedAt:
          new Date().toISOString(),

        analyzed: false,

        /*
          Keeps track of which medicines
          from this prescription were
          already added.
        */

        addedMedicineNames: [],
      };

      const updated = [
        newPrescription,
        ...prescriptions,
      ];

      setPrescriptions(
        updated
      );

      savePrescriptions(
        updated
      );
    };

    reader.readAsDataURL(file);

    /*
      Allow the same file to be
      uploaded again.
    */

    event.target.value = "";
  };

  /* =======================================================
     DELETE
  ======================================================= */

  const deletePrescription = (
    id
  ) => {
    const confirmed =
      window.confirm(
        "Delete this prescription?"
      );

    if (!confirmed) {
      return;
    }

    const updated =
      prescriptions.filter(
        (prescription) =>
          prescription.id !== id
      );

    setPrescriptions(
      updated
    );

    savePrescriptions(
      updated
    );

    if (
      previewFile?.id === id
    ) {
      setPreviewFile(null);
    }

    if (
      analyzedId === id
    ) {
      setAnalyzedId(null);
    }

    setAnalysisResults(
      (previous) => {
        const updatedResults = {
          ...previous,
        };

        delete updatedResults[id];

        return updatedResults;
      }
    );
  };

  /* =======================================================
     FORMAT FILE SIZE
  ======================================================= */

  const formatFileSize = (
    bytes
  ) => {
    if (!bytes) {
      return "Unknown size";
    }

    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (
      bytes <
      1024 * 1024
    ) {
      return `${(
        bytes / 1024
      ).toFixed(1)} KB`;
    }

    return `${(
      bytes /
      (1024 * 1024)
    ).toFixed(1)} MB`;
  };

  /* =======================================================
     ANALYZE PRESCRIPTION
  ======================================================= */

  const analyzePrescription = async (
    prescription
  ) => {
    try {
      setAnalyzingId(
        prescription.id
      );

      setAnalyzedId(null);

      /*
        Send the actual uploaded
        prescription to Gemini.
      */

      const result =
        await analyzePrescriptionFile(
          prescription
        );

      console.log(
        "Gemini prescription result:",
        result
      );

      /*
        Store extracted result
        against this prescription.
      */

      setAnalysisResults(
        (previous) => ({
          ...previous,

          [prescription.id]:
            result,
        })
      );

      /*
        Mark analysis complete.
      */

      setAnalyzedId(
        prescription.id
      );

      /*
        Persist the fact that the
        prescription has been analyzed.
      */

      const updatedPrescriptions =
        prescriptions.map(
          (item) =>
            item.id ===
            prescription.id
              ? {
                  ...item,
                  analyzed: true,
                }
              : item
        );

      setPrescriptions(
        updatedPrescriptions
      );

      savePrescriptions(
        updatedPrescriptions
      );
    } catch (error) {
      console.error(
        "Prescription analysis failed:",
        error
      );

      let message =
        "Could not analyze the prescription.";

      if (
        error?.message
      ) {
        message =
          error.message;
      }

      alert(
        `${message}\n\nPlease check your Gemini API configuration and try again.`
      );
    } finally {
      setAnalyzingId(null);
    }
  };

  /* =======================================================
     ADD ANALYZED MEDICINES
  ======================================================= */

  const addAnalyzedMedicines = (
    prescription
  ) => {
    const result =
      analysisResults[
        prescription.id
      ];

    if (
      !result ||
      !Array.isArray(
        result.medicines
      ) ||
      result.medicines.length === 0
    ) {
      alert(
        "No medicines were extracted from this prescription."
      );

      return;
    }

    /*
      Load the current Medicines
      page data from localStorage.
    */

    const existingMedicines =
      loadMedicines();

    /*
      Medicines already added from
      this prescription.
    */

    const alreadyAdded =
      Array.isArray(
        prescription.addedMedicineNames
      )
        ? prescription.addedMedicineNames
        : [];

    const newMedicines = [];

    const skippedMedicines = [];

    result.medicines.forEach(
      (medicine) => {
        const medicineName =
          String(
            medicine?.name || ""
          ).trim();

        /*
          Ignore empty medicine names.
        */

        if (!medicineName) {
          return;
        }

        const normalizedName =
          normalizeText(
            medicineName
          );

        /*
          Prevent adding the same
          medicine twice.
        */

        const alreadyExists =
          existingMedicines.some(
            (existingMedicine) =>
              normalizeText(
                existingMedicine.name
              ) ===
              normalizedName
          );

        /*
          Also prevent adding the
          same medicine twice from
          this prescription.
        */

        const alreadyAddedFromPrescription =
          alreadyAdded.some(
            (name) =>
              normalizeText(name) ===
              normalizedName
          );

        if (
          alreadyExists ||
          alreadyAddedFromPrescription
        ) {
          skippedMedicines.push(
            medicineName
          );

          return;
        }

        /*
          AI extracted fields.
        */

        const dosage =
          String(
            medicine.dosage || ""
          ).trim();

        const form =
          String(
            medicine.form ||
              "Tablet"
          ).trim();

        const frequency =
          String(
            medicine.frequency ||
              "Once daily"
          ).trim();

        /*
          Make sure doseTimes
          is always an array.
        */

        const doseTimes =
          Array.isArray(
            medicine.doseTimes
          )
            ? medicine.doseTimes.filter(
                (time) =>
                  String(
                    time || ""
                  ).trim()
              )
            : [];

        const firstTime =
          doseTimes[0] || "";

        /*
          Prescription dates.
        */

        const startDate =
          medicine.startDate ||
          result.prescriptionDate ||
          "";

        const endDate =
          medicine.endDate ||
          "";

        /*
          Quantity prescribed by
          the doctor.
        */

        const prescribedQuantity =
          Number(
            medicine.prescribedQuantity
          ) || 0;

        /*
          Important:
          Initial stock is set to the
          prescribed quantity because
          this is the amount available
          immediately after adding the
          prescription.

          The user can edit stock later.
        */

        const initialStock =
          prescribedQuantity;

        /*
          Build the exact medicine
          object expected by
          Medicines.jsx.
        */

        const medicineData = {
          id:
            Date.now() +
            Math.floor(
              Math.random() *
                100000
            ),

          name:
            medicineName,

          dosage:
            dosage,

          form:
            form,

          frequency:
            frequency,

          doseTimes:
            doseTimes,

          schedule:
            getSchedule(
              firstTime
            ),

          time:
            formatTime(
              firstTime
            ),

          /*
            PRESCRIPTION
          */

          prescriptionStartDate:
            startDate,

          prescriptionEndDate:
            endDate,

          prescribedQuantity:
            prescribedQuantity,

          /*
            INVENTORY
          */

          stock:
            initialStock,

          lowStockAlert:
            3,

          /*
            OTHER
          */

          purpose:
            "",

          status:
            "Active",

          accentColor:
            "Teal",

          notes:
            medicine.instructions ||
            "",

          instructions:
            medicine.instructions ||
            "",

          /*
            New medicines have
            not been taken today.
          */

          taken:
            false,

          /*
            Source information.
            Useful later for traceability.
          */

          source:
            "AI prescription analysis",

          sourcePrescriptionId:
            prescription.id,

          sourcePrescriptionName:
            prescription.name,
        };

        newMedicines.push(
          medicineData
        );
      }
    );

    /*
      If absolutely nothing can
      be added, tell the user why.
    */

    if (
      newMedicines.length === 0
    ) {
      if (
        skippedMedicines.length > 0
      ) {
        alert(
          "All extracted medicines are already in your Medicines section."
        );
      } else {
        alert(
          "No valid medicines could be added."
        );
      }

      return;
    }

    /*
      Combine existing medicines
      with newly extracted medicines.
    */

    const updatedMedicines = [
      ...existingMedicines,
      ...newMedicines,
    ];

    /*
      Save to the same localStorage
      used by Medicines.jsx.
    */

    saveMedicines(
      updatedMedicines
    );

    /*
      Remember which medicines from
      this prescription were added.
    */

    const addedNames = [
      ...alreadyAdded,
      ...newMedicines.map(
        (medicine) =>
          medicine.name
      ),
    ];

    const updatedPrescriptions =
      prescriptions.map(
        (item) =>
          item.id ===
          prescription.id
            ? {
                ...item,

                addedMedicineNames:
                  addedNames,
              }
            : item
      );

    setPrescriptions(
      updatedPrescriptions
    );

    savePrescriptions(
      updatedPrescriptions
    );

    /*
      Prepare confirmation message.
    */

    let message =
      `${newMedicines.length} medicine${
        newMedicines.length === 1
          ? ""
          : "s"
      } added to Medicines successfully.`;

    if (
      skippedMedicines.length > 0
    ) {
      message +=
        `\n\nAlready present or previously added:\n${skippedMedicines.join(
          ", "
        )}`;
    }

    alert(message);
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#08111F] text-white">

      <main
        className="
          max-w-[1400px]
          mx-auto
          px-6
          md:px-8
          py-10
        "
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <section className="mb-10">

          <p
            className="
              text-cyan-400
              text-sm
              font-medium
              mb-3
            "
          >
            PRESCRIPTION MANAGEMENT
          </p>

          <div
            className="
              flex
              flex-col
              md:flex-row
              md:items-start
              md:justify-between
              gap-6
            "
          >

            <div>

              <h1
                className="
                  text-4xl
                  md:text-5xl
                  font-bold
                  tracking-tight
                "
              >
                Prescriptions
              </h1>

              <p
                className="
                  text-lg
                  text-slate-400
                  mt-4
                  max-w-3xl
                "
              >
                Upload your prescriptions and
                let DoseTwin prepare them for
                medication extraction and review.
              </p>

            </div>

            {/* UPLOAD BUTTON */}

            <label
              className="
                inline-flex
                items-center
                justify-center
                gap-3
                px-7
                py-4
                rounded-full
                bg-cyan-400
                hover:bg-cyan-300
                text-[#06111F]
                font-semibold
                text-lg
                cursor-pointer
                transition
                shadow-[0_0_30px_rgba(34,211,238,0.15)]
              "
            >

              <Upload size={21} />

              Upload Prescription

              <input
                type="file"
                accept=".pdf,image/png,image/jpeg,image/webp"
                onChange={
                  handleUpload
                }
                className="hidden"
              />

            </label>

          </div>

        </section>

        {/* =================================================
            AI INFORMATION
        ================================================= */}

        <section
          className="
            rounded-2xl
            border
            border-cyan-400/20
            bg-cyan-400/[0.04]
            p-6
            mb-8
          "
        >

          <div
            className="
              flex
              items-start
              gap-4
            "
          >

            <div
              className="
                w-11
                h-11
                shrink-0
                rounded-xl
                bg-cyan-400/10
                flex
                items-center
                justify-center
              "
            >

              <Sparkles
                size={21}
                className="text-cyan-400"
              />

            </div>

            <div>

              <h2
                className="
                  font-semibold
                  text-lg
                "
              >
                AI Prescription Analysis
              </h2>

              <p
                className="
                  text-sm
                  text-slate-400
                  mt-2
                  leading-6
                "
              >
                DoseTwin can analyze uploaded
                prescriptions and extract medicine,
                dosage, frequency, timing, quantity,
                instructions, and prescription dates
                for your review.
              </p>

              <div
                className="
                  flex
                  flex-wrap
                  gap-2
                  mt-4
                "
              >

                {[
                  "Medicine",
                  "Dosage",
                  "Frequency",
                  "Schedule",
                  "Quantity",
                  "Dates",
                  "Instructions",
                ].map(
                  (item) => (

                    <span
                      key={item}
                      className="
                        px-3
                        py-1.5
                        rounded-lg
                        bg-white/5
                        border
                        border-white/10
                        text-xs
                        text-slate-400
                      "
                    >
                      {item}
                    </span>

                  )
                )}

              </div>

            </div>

          </div>

        </section>

        {/* =================================================
            PRESCRIPTIONS
        ================================================= */}

        <section>

          <div
            className="
              flex
              items-center
              justify-between
              mb-6
            "
          >

            <div>

              <h2
                className="
                  text-2xl
                  font-semibold
                "
              >
                Your prescriptions
              </h2>

              <p
                className="
                  text-slate-500
                  mt-1
                "
              >
                Uploaded prescription documents
              </p>

            </div>

            <span
              className="
                text-sm
                text-slate-500
              "
            >
              {prescriptions.length}{" "}

              {prescriptions.length === 1
                ? "document"
                : "documents"}

            </span>

          </div>

          {prescriptions.length === 0 ? (

            /* =================================================
               EMPTY STATE
            ================================================= */

            <div
              className="
                rounded-2xl
                border
                border-dashed
                border-white/10
                bg-white/[0.02]
                py-24
                text-center
              "
            >

              <div
                className="
                  w-16
                  h-16
                  mx-auto
                  rounded-2xl
                  bg-white/5
                  flex
                  items-center
                  justify-center
                  mb-5
                "
              >

                <FileText
                  size={30}
                  className="text-slate-600"
                />

              </div>

              <h3
                className="
                  text-xl
                  font-semibold
                "
              >
                No prescriptions yet
              </h3>

              <p
                className="
                  text-slate-500
                  mt-2
                "
              >
                Upload your first prescription
                to get started.
              </p>

            </div>

          ) : (

            <div
              className="
                grid
                grid-cols-1
                lg:grid-cols-2
                gap-5
              "
            >

              {prescriptions.map(
                (prescription) => {

                  const isImage =
                    prescription.type?.startsWith(
                      "image/"
                    );

                  const isAnalyzing =
                    analyzingId ===
                    prescription.id;

                  const isAnalyzed =
                    analyzedId ===
                    prescription.id;

                  const result =
                    analysisResults[
                      prescription.id
                    ];

                  const addedMedicineNames =
                    Array.isArray(
                      prescription.addedMedicineNames
                    )
                      ? prescription.addedMedicineNames
                      : [];

                  const hasAddedMedicines =
                    addedMedicineNames.length >
                    0;

                  const hasExtractedMedicines =
                    result?.medicines?.length >
                    0;

                  /*
                    Check whether every
                    extracted medicine has
                    already been added.
                  */

                  const allMedicinesAdded =
                    hasExtractedMedicines &&
                    result.medicines.every(
                      (medicine) =>
                        addedMedicineNames.some(
                          (name) =>
                            normalizeText(
                              name
                            ) ===
                            normalizeText(
                              medicine?.name
                            )
                        )
                    );

                  return (

                    <div
                      key={
                        prescription.id
                      }
                      className="
                        rounded-2xl
                        border
                        border-white/10
                        bg-white/5
                        p-6
                        hover:bg-white/[0.07]
                        transition
                      "
                    >

                      {/* =================================================
                          FILE HEADER
                      ================================================= */}

                      <div
                        className="
                          flex
                          items-start
                          gap-4
                        "
                      >

                        <div
                          className="
                            w-12
                            h-12
                            shrink-0
                            rounded-xl
                            bg-cyan-400/10
                            flex
                            items-center
                            justify-center
                          "
                        >

                          <FileText
                            size={23}
                            className="text-cyan-400"
                          />

                        </div>

                        <div
                          className="
                            flex-1
                            min-w-0
                          "
                        >

                          <h3
                            className="
                              font-semibold
                              truncate
                            "
                          >
                            {prescription.name}
                          </h3>

                          <p
                            className="
                              text-sm
                              text-slate-500
                              mt-1
                            "
                          >
                            {formatFileSize(
                              prescription.size
                            )}

                            {" · "}

                            {isImage
                              ? "Image"
                              : "PDF"}
                          </p>

                          <p
                            className="
                              text-xs
                              text-slate-600
                              mt-2
                            "
                          >
                            Uploaded{" "}
                            {new Date(
                              prescription.uploadedAt
                            ).toLocaleDateString()}
                          </p>

                        </div>

                      </div>

                      {/* =================================================
                          ANALYSIS AREA
                      ================================================= */}

                      <div
                        className="
                          mt-6
                          rounded-xl
                          border
                          border-white/10
                          bg-black/10
                          p-5
                        "
                      >

                        <div
                          className="
                            flex
                            items-start
                            gap-3
                          "
                        >

                          <div
                            className="
                              w-9
                              h-9
                              shrink-0
                              rounded-lg
                              bg-purple-400/10
                              flex
                              items-center
                              justify-center
                            "
                          >

                            <Sparkles
                              size={17}
                              className="text-purple-400"
                            />

                          </div>

                          <div
                            className="
                              flex-1
                            "
                          >

                            <h4
                              className="
                                text-sm
                                font-semibold
                              "
                            >
                              Prescription analysis
                            </h4>

                            {isAnalyzed ? (

                              <div className="mt-4">

                                {/* SUCCESS */}

                                <div
                                  className="
                                    flex
                                    items-center
                                    gap-2
                                    text-emerald-400
                                    text-sm
                                    mb-4
                                  "
                                >

                                  <CheckCircle2
                                    size={17}
                                  />

                                  Prescription analyzed
                                  successfully

                                </div>

                                {/* EXTRACTED MEDICINES */}

                                {result?.medicines?.length > 0 ? (

                                  <div className="space-y-3">

                                    {result.medicines.map(
                                      (
                                        medicine,
                                        index
                                      ) => {

                                        const isMedicineAdded =
                                          addedMedicineNames.some(
                                            (name) =>
                                              normalizeText(
                                                name
                                              ) ===
                                              normalizeText(
                                                medicine?.name
                                              )
                                          );

                                        return (

                                          <div
                                            key={index}
                                            className="
                                              rounded-xl
                                              border
                                              border-white/10
                                              bg-white/[0.03]
                                              p-4
                                            "
                                          >

                                            <div
                                              className="
                                                flex
                                                items-start
                                                gap-3
                                              "
                                            >

                                              <div
                                                className="
                                                  w-9
                                                  h-9
                                                  rounded-lg
                                                  bg-cyan-400/10
                                                  flex
                                                  items-center
                                                  justify-center
                                                  shrink-0
                                                "
                                              >

                                                <Pill
                                                  size={17}
                                                  className="text-cyan-400"
                                                />

                                              </div>

                                              <div
                                                className="
                                                  min-w-0
                                                  flex-1
                                                "
                                              >

                                                <div
                                                  className="
                                                    flex
                                                    items-center
                                                    justify-between
                                                    gap-3
                                                  "
                                                >

                                                  <p className="font-medium">

                                                    {medicine.name ||
                                                      "Unknown medicine"}

                                                  </p>

                                                  {isMedicineAdded && (

                                                    <span
                                                      className="
                                                        shrink-0
                                                        inline-flex
                                                        items-center
                                                        gap-1
                                                        px-2
                                                        py-1
                                                        rounded-full
                                                        bg-emerald-400/10
                                                        text-emerald-400
                                                        text-[11px]
                                                      "
                                                    >

                                                      <CheckCircle2
                                                        size={12}
                                                      />

                                                      Added

                                                    </span>

                                                  )}

                                                </div>

                                                <p
                                                  className="
                                                    text-xs
                                                    text-slate-400
                                                    mt-1
                                                  "
                                                >

                                                  {medicine.dosage ||
                                                    "Dosage not specified"}

                                                  {" · "}

                                                  {medicine.frequency ||
                                                    "Frequency not specified"}

                                                </p>

                                                {medicine.form && (

                                                  <p
                                                    className="
                                                      text-xs
                                                      text-slate-500
                                                      mt-1
                                                    "
                                                  >
                                                    Form:{" "}
                                                    {medicine.form}
                                                  </p>

                                                )}

                                                {medicine.doseTimes?.length >
                                                  0 && (

                                                  <p
                                                    className="
                                                      text-xs
                                                      text-slate-500
                                                      mt-1
                                                    "
                                                  >
                                                    Dose times:{" "}
                                                    {medicine.doseTimes.join(
                                                      ", "
                                                    )}
                                                  </p>

                                                )}

                                                {medicine.prescribedQuantity >
                                                  0 && (

                                                  <p
                                                    className="
                                                      text-xs
                                                      text-slate-500
                                                      mt-2
                                                    "
                                                  >

                                                    Quantity:{" "}
                                                    {
                                                      medicine.prescribedQuantity
                                                    }

                                                  </p>

                                                )}

                                                {medicine.startDate && (

                                                  <p
                                                    className="
                                                      text-xs
                                                      text-slate-500
                                                      mt-1
                                                    "
                                                  >

                                                    Start:{" "}
                                                    {
                                                      medicine.startDate
                                                    }

                                                  </p>

                                                )}

                                                {medicine.endDate && (

                                                  <p
                                                    className="
                                                      text-xs
                                                      text-slate-500
                                                      mt-1
                                                    "
                                                  >

                                                    End:{" "}
                                                    {
                                                      medicine.endDate
                                                    }

                                                  </p>

                                                )}

                                                {medicine.instructions && (

                                                  <p
                                                    className="
                                                      text-xs
                                                      text-slate-500
                                                      mt-2
                                                      leading-5
                                                    "
                                                  >

                                                    {
                                                      medicine.instructions
                                                    }

                                                  </p>

                                                )}

                                              </div>

                                            </div>

                                          </div>

                                        );
                                      }
                                    )}

                                  </div>

                                ) : (

                                  <div
                                    className="
                                      flex
                                      items-start
                                      gap-2
                                      text-sm
                                      text-amber-400
                                    "
                                  >

                                    <AlertCircle
                                      size={17}
                                      className="
                                        shrink-0
                                        mt-0.5
                                      "
                                    />

                                    <p>
                                      No medicines could
                                      be confidently
                                      extracted from this
                                      prescription.
                                    </p>

                                  </div>

                                )}

                                {/* DOCTOR / PATIENT INFO */}

                                {(result?.doctorName ||
                                  result?.patientName ||
                                  result?.prescriptionDate) && (

                                  <div
                                    className="
                                      mt-4
                                      pt-4
                                      border-t
                                      border-white/10
                                      space-y-2
                                    "
                                  >

                                    {result.doctorName && (

                                      <p className="text-xs text-slate-500">

                                        Doctor:{" "}
                                        <span className="text-slate-300">
                                          {result.doctorName}
                                        </span>

                                      </p>

                                    )}

                                    {result.patientName && (

                                      <p className="text-xs text-slate-500">

                                        Patient:{" "}
                                        <span className="text-slate-300">
                                          {result.patientName}
                                        </span>

                                      </p>

                                    )}

                                    {result.prescriptionDate && (

                                      <p className="text-xs text-slate-500">

                                        Prescription date:{" "}
                                        <span className="text-slate-300">
                                          {
                                            result.prescriptionDate
                                          }
                                        </span>

                                      </p>

                                    )}

                                  </div>

                                )}

                                {/* NOTES */}

                                {result?.notes && (

                                  <div
                                    className="
                                      mt-4
                                      rounded-lg
                                      bg-white/[0.03]
                                      border
                                      border-white/5
                                      p-3
                                    "
                                  >

                                    <p className="text-xs text-slate-500">
                                      Notes
                                    </p>

                                    <p
                                      className="
                                        text-xs
                                        text-slate-400
                                        mt-1
                                        leading-5
                                      "
                                    >
                                      {result.notes}
                                    </p>

                                  </div>

                                )}

                              </div>

                            ) : (

                              <p
                                className="
                                  text-xs
                                  text-slate-500
                                  mt-1
                                  leading-5
                                "
                              >
                                Analyze this prescription
                                with Gemini to extract
                                medication information.
                              </p>

                            )}

                          </div>

                        </div>

                        {/* =================================================
                            ANALYZE BUTTON
                        ================================================= */}

                        {!isAnalyzed && (

                          <button
                            type="button"
                            onClick={() =>
                              analyzePrescription(
                                prescription
                              )
                            }
                            disabled={
                              isAnalyzing
                            }
                            className="
                              w-full
                              mt-5
                              inline-flex
                              items-center
                              justify-center
                              gap-2
                              px-5
                              py-3
                              rounded-xl
                              bg-purple-400/10
                              hover:bg-purple-400/20
                              border
                              border-purple-400/20
                              text-purple-300
                              font-medium
                              transition
                              disabled:opacity-50
                              disabled:cursor-not-allowed
                            "
                          >

                            <Sparkles
                              size={17}
                            />

                            {isAnalyzing
                              ? "Analyzing prescription..."
                              : "Analyze Prescription"}

                          </button>

                        )}

                        {/* =================================================
                            ADD TO MEDICINES
                        ================================================= */}

                        {isAnalyzed &&
                          hasExtractedMedicines && (

                          <button
                            type="button"
                            onClick={() =>
                              addAnalyzedMedicines(
                                prescription
                              )
                            }
                            disabled={
                              allMedicinesAdded
                            }
                            className={`
                              w-full
                              mt-5
                              inline-flex
                              items-center
                              justify-center
                              gap-2
                              px-5
                              py-3
                              rounded-xl
                              font-semibold
                              transition
                              ${
                                allMedicinesAdded
                                  ? "bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 cursor-not-allowed"
                                  : "bg-cyan-400 hover:bg-cyan-300 text-[#06111F]"
                              }
                            `}
                          >

                            {allMedicinesAdded ? (

                              <>
                                <CheckCircle2
                                  size={17}
                                />

                                Medicines added

                              </>

                            ) : (

                              <>
                                <Pill
                                  size={17}
                                />

                                {hasAddedMedicines
                                  ? "Add remaining medicines"
                                  : "Add to Medicines"}

                              </>

                            )}

                          </button>

                        )}

                      </div>

                      {/* =================================================
                          ACTIONS
                      ================================================= */}

                      <div
                        className="
                          mt-5
                          pt-5
                          border-t
                          border-white/10
                          flex
                          items-center
                          justify-between
                          gap-3
                        "
                      >

                        <button
                          type="button"
                          onClick={() =>
                            setPreviewFile(
                              prescription
                            )
                          }
                          className="
                            inline-flex
                            items-center
                            gap-2
                            px-4
                            py-2.5
                            rounded-full
                            bg-white/5
                            hover:bg-white/10
                            text-sm
                            text-slate-300
                            transition
                          "
                        >

                          <Eye size={16} />

                          View

                        </button>

                        {isAnalyzed && (

                          <button
                            type="button"
                            className="
                              inline-flex
                              items-center
                              gap-2
                              px-4
                              py-2.5
                              rounded-full
                              bg-emerald-400/10
                              border
                              border-emerald-400/20
                              text-sm
                              text-emerald-400
                            "
                          >

                            <CheckCircle2
                              size={16}
                            />

                            Review extraction

                          </button>

                        )}

                        <button
                          type="button"
                          onClick={() =>
                            deletePrescription(
                              prescription.id
                            )
                          }
                          className="
                            w-9
                            h-9
                            rounded-lg
                            bg-red-400/5
                            hover:bg-red-400/10
                            flex
                            items-center
                            justify-center
                            text-red-400
                            transition
                          "
                          title="Delete prescription"
                        >

                          <Trash2
                            size={17}
                          />

                        </button>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          )}

        </section>

        {/* =================================================
            WORKFLOW INFORMATION
        ================================================= */}

        <section
          className="
            mt-10
            rounded-2xl
            border
            border-white/10
            bg-white/[0.02]
            p-6
          "
        >

          <div
            className="
              flex
              items-start
              gap-4
            "
          >

            <div
              className="
                w-10
                h-10
                rounded-xl
                bg-emerald-400/10
                flex
                items-center
                justify-center
                shrink-0
              "
            >

              <Pill
                size={19}
                className="text-emerald-400"
              />

            </div>

            <div>

              <h3 className="font-semibold">
                Prescription workflow
              </h3>

              <p
                className="
                  text-sm
                  text-slate-500
                  mt-1
                  leading-6
                "
              >
                Upload a prescription, analyze it
                with AI, review the extracted
                information, and add the confirmed
                medicines directly to your medication
                management section.
              </p>

            </div>

          </div>

        </section>

      </main>

      {/* ===================================================
          PREVIEW MODAL
      =================================================== */}

      {previewFile && (

        <div
          className="
            fixed
            inset-0
            z-[100]
            bg-black/80
            backdrop-blur-md
            flex
            items-center
            justify-center
            p-6
          "
          onMouseDown={(event) => {

            if (
              event.target ===
              event.currentTarget
            ) {
              setPreviewFile(null);
            }

          }}
        >

          <div
            className="
              w-full
              max-w-5xl
              max-h-[90vh]
              rounded-2xl
              overflow-hidden
              border
              border-white/10
              bg-[#0B192B]
              shadow-2xl
              flex
              flex-col
            "
          >

            {/* HEADER */}

            <div
              className="
                px-6
                py-4
                border-b
                border-white/10
                flex
                items-center
                justify-between
              "
            >

              <div className="min-w-0">

                <h2
                  className="
                    font-semibold
                    truncate
                  "
                >
                  {previewFile.name}
                </h2>

              </div>

              <button
                type="button"
                onClick={() =>
                  setPreviewFile(
                    null
                  )
                }
                className="
                  w-9
                  h-9
                  rounded-lg
                  hover:bg-white/5
                  flex
                  items-center
                  justify-center
                  text-slate-400
                  hover:text-white
                "
              >

                <X size={20} />

              </button>

            </div>

            {/* PREVIEW */}

            <div
              className="
                flex-1
                overflow-auto
                bg-[#07101D]
                p-5
              "
            >

              {previewFile.type?.startsWith(
                "image/"
              ) ? (

                <img
                  src={
                    previewFile.data
                  }
                  alt="Prescription"
                  className="
                    max-w-full
                    mx-auto
                    rounded-xl
                  "
                />

              ) : (

                <iframe
                  src={
                    previewFile.data
                  }
                  title="Prescription preview"
                  className="
                    w-full
                    h-[70vh]
                    rounded-xl
                  "
                />

              )}

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Prescriptions;