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

const STORAGE_KEY = "dosetwin_prescriptions";


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


    /*
      Supported formats:
      PDF
      PNG
      JPG
      JPEG
      WEBP
    */

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
      Limit file size to 10 MB.
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
      Allows the same file to be
      uploaded again later.
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

  const analyzePrescription = (
    prescription
  ) => {

    /*
      IMPORTANT:

      This is intentionally NOT fake AI.

      We are only preparing the UI and
      application flow here.

      Gemini/OCR will be connected in
      the next step.
    */

    setAnalyzingId(
      prescription.id
    );


    /*
      Temporary delay so the interface
      behaves like an analysis process.

      This will be replaced by the
      real AI request.
    */

    setTimeout(() => {

      setAnalyzingId(null);

      setAnalyzedId(
        prescription.id
      );

    }, 1000);
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
                DoseTwin will eventually read
                the uploaded prescription and
                identify medicines, dosage,
                frequency, timing, quantity,
                and prescription dates.
              </p>


              <div
                className="
                  flex
                  flex-wrap
                  gap-2
                  mt-4
                "
              >

                <span
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
                  Medicine
                </span>


                <span
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
                  Dosage
                </span>


                <span
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
                  Frequency
                </span>


                <span
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
                  Schedule
                </span>


                <span
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
                  Quantity
                </span>


                <span
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
                  Dates
                </span>

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

              {prescriptions.length ===
              1
                ? "document"
                : "documents"}

            </span>

          </div>


          {prescriptions.length ===
          0 ? (

            /* EMPTY STATE */

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

                      {/* FILE HEADER */}

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


                      {/* ANALYSIS AREA */}

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

                              <div
                                className="
                                  mt-3
                                  flex
                                  items-start
                                  gap-2
                                  text-sm
                                  text-amber-400
                                "
                              >

                                <AlertCircle
                                  size={17}
                                  className="shrink-0 mt-0.5"
                                />

                                <p>
                                  AI extraction
                                  will be connected
                                  in the next step.
                                </p>

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
                                to extract medication
                                information.
                              </p>

                            )}

                          </div>

                        </div>


                        {/* ANALYZE BUTTON */}

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
                              ? "Preparing analysis..."
                              : "Analyze Prescription"}

                          </button>

                        )}

                      </div>


                      {/* ACTIONS */}

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
                            disabled
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
                              cursor-not-allowed
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
            FUTURE WORKFLOW
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

              <h3
                className="
                  font-semibold
                "
              >
                Next step
              </h3>


              <p
                className="
                  text-sm
                  text-slate-500
                  mt-1
                  leading-6
                "
              >
                Once prescription analysis is
                connected, extracted medicines will
                be reviewed here before being added
                to your medication schedule.
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

              <div
                className="
                  min-w-0
                "
              >

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