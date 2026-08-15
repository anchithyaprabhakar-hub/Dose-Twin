import { useRef, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  FileText,
  Pill,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";

function Prescriptions() {
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [prescription, setPrescription] = useState(null);

  /* =========================================================
     FILE SELECTION
  ========================================================= */

  const handleFile = (selectedFile) => {
    if (!selectedFile) {
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      alert(
        "Please upload a PDF, JPG, PNG, or WEBP file."
      );

      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      alert(
        "File size must be less than 10 MB."
      );

      return;
    }

    setFile(selectedFile);
    setPrescription(null);
    setShowPreview(false);
  };

  /* =========================================================
     INPUT CHANGE
  ========================================================= */

  const handleInputChange = (event) => {
    const selectedFile =
      event.target.files?.[0];

    handleFile(selectedFile);
  };

  /* =========================================================
     DRAG EVENTS
  ========================================================= */

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();

    setIsDragging(false);

    const droppedFile =
      event.dataTransfer.files?.[0];

    handleFile(droppedFile);
  };

  /* =========================================================
     REMOVE FILE
  ========================================================= */

  const removeFile = () => {
    setFile(null);
    setPrescription(null);
    setShowPreview(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* =========================================================
     PROCESS PRESCRIPTION
     
     TEMPORARY MOCK EXTRACTION
     
     Later this will connect to Gemini/backend.
  ========================================================= */

  const processPrescription = () => {
    if (!file) {
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      setPrescription({
        doctor: "Prescription detected",
        date: new Date()
          .toISOString()
          .split("T")[0],

        medicines: [
          {
            id: 1,
            name: "Metformin",
            dosage: "500 mg",
            form: "Tablet",
            frequency: "Once daily",
            time: "08:00",
            startDate: "",
            endDate: "",
            quantity: 30,
            instructions:
              "Take after breakfast",
          },
        ],
      });

      setIsProcessing(false);
      setShowPreview(true);
    }, 1500);
  };

  /* =========================================================
     CONFIRM PRESCRIPTION
     
     For now this only confirms the extracted data.
     Next step will connect it to medicines.js/localStorage.
  ========================================================= */

  const confirmPrescription = () => {
    if (!prescription) {
      return;
    }

    localStorage.setItem(
      "dosetwin_latest_prescription",
      JSON.stringify(prescription)
    );

    alert(
      "Prescription saved successfully."
    );

    setShowPreview(false);
  };

  /* =========================================================
     FORMAT FILE SIZE
  ========================================================= */

  const formatFileSize = (bytes) => {
    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(
        bytes / 1024
      ).toFixed(1)} KB`;
    }

    return `${(
      bytes /
      (1024 * 1024)
    ).toFixed(1)} MB`;
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="min-h-screen bg-[#08111F] text-white">

      <main className="max-w-[1200px] mx-auto px-6 md:px-8 py-10">

        {/* =================================================
            HEADER
        ================================================= */}

        <section className="mb-10">

          <p className="text-cyan-400 text-sm font-medium mb-3">
            PRESCRIPTION MANAGEMENT
          </p>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Prescriptions
          </h1>

          <p className="text-lg text-slate-400 mt-4 max-w-3xl">
            Upload a prescription and let DoseTwin
            extract your medication schedule,
            dosage, duration, and instructions.
          </p>

        </section>


        {/* =================================================
            UPLOAD CARD
        ================================================= */}

        {!showPreview && (

          <section
            className="
              rounded-3xl
              border
              border-white/10
              bg-[#0D1B30]
              p-6
              md:p-8
            "
          >

            <div className="flex items-center gap-4 mb-7">

              <div
                className="
                  w-12
                  h-12
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

              <div>

                <h2 className="text-2xl font-semibold">
                  Upload prescription
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  PDF, JPG, PNG, or WEBP · Max 10 MB
                </p>

              </div>

            </div>


            {/* DROPZONE */}

            {!file ? (

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() =>
                  fileInputRef.current?.click()
                }
                className={`
                  min-h-[320px]
                  rounded-2xl
                  border-2
                  border-dashed
                  flex
                  flex-col
                  items-center
                  justify-center
                  text-center
                  cursor-pointer
                  transition
                  ${
                    isDragging
                      ? `
                        border-cyan-400
                        bg-cyan-400/10
                      `
                      : `
                        border-white/10
                        bg-white/[0.02]
                        hover:border-cyan-400/40
                        hover:bg-white/[0.04]
                      `
                  }
                `}
              >

                <div
                  className="
                    w-16
                    h-16
                    rounded-2xl
                    bg-cyan-400/10
                    flex
                    items-center
                    justify-center
                    mb-5
                  "
                >

                  <Upload
                    size={28}
                    className="text-cyan-400"
                  />

                </div>

                <h3 className="text-xl font-semibold">
                  Drop your prescription here
                </h3>

                <p className="text-slate-500 mt-2">
                  or click to browse your files
                </p>

                <div className="flex items-center gap-2 mt-5">

                  <span className="px-3 py-1.5 rounded-lg bg-white/5 text-xs text-slate-400">
                    PDF
                  </span>

                  <span className="px-3 py-1.5 rounded-lg bg-white/5 text-xs text-slate-400">
                    JPG
                  </span>

                  <span className="px-3 py-1.5 rounded-lg bg-white/5 text-xs text-slate-400">
                    PNG
                  </span>

                </div>

              </div>

            ) : (

              /* =================================================
                 SELECTED FILE
              ================================================= */

              <div
                className="
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/[0.03]
                  p-5
                "
              >

                <div className="flex items-center gap-4">

                  <div
                    className="
                      w-12
                      h-12
                      rounded-xl
                      bg-cyan-400/10
                      flex
                      items-center
                      justify-center
                      shrink-0
                    "
                  >

                    <FileText
                      size={22}
                      className="text-cyan-400"
                    />

                  </div>


                  <div className="flex-1 min-w-0">

                    <p className="font-medium truncate">
                      {file.name}
                    </p>

                    <p className="text-xs text-slate-500 mt-1">
                      {formatFileSize(file.size)}
                    </p>

                  </div>


                  <button
                    type="button"
                    onClick={removeFile}
                    className="
                      w-9
                      h-9
                      rounded-lg
                      bg-white/5
                      hover:bg-red-400/10
                      text-slate-400
                      hover:text-red-400
                      flex
                      items-center
                      justify-center
                    "
                  >

                    <Trash2 size={17} />

                  </button>

                </div>


                {/* PROCESS BUTTON */}

                <button
                  type="button"
                  onClick={processPrescription}
                  disabled={isProcessing}
                  className="
                    w-full
                    mt-5
                    h-12
                    rounded-xl
                    bg-cyan-400
                    hover:bg-cyan-300
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                    text-[#06111F]
                    font-semibold
                    flex
                    items-center
                    justify-center
                    gap-2
                    transition
                  "
                >

                  {isProcessing ? (
                    <>
                      <Sparkles
                        size={18}
                        className="animate-pulse"
                      />

                      Analyzing prescription...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />

                      Analyze prescription
                    </>
                  )}

                </button>

              </div>

            )}


            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={handleInputChange}
              className="hidden"
            />


            {/* INFO */}

            <div
              className="
                flex
                items-start
                gap-3
                mt-6
                rounded-xl
                border
                border-cyan-400/10
                bg-cyan-400/[0.03]
                p-4
              "
            >

              <AlertCircle
                size={18}
                className="text-cyan-400 mt-0.5 shrink-0"
              />

              <p className="text-sm text-slate-400">
                DoseTwin will extract medication
                information from the prescription.
                You will review the detected
                information before it changes your
                medication data.
              </p>

            </div>

          </section>

        )}


        {/* =================================================
            AI EXTRACTION RESULT
        ================================================= */}

        {showPreview && prescription && (

          <section
            className="
              rounded-3xl
              border
              border-white/10
              bg-[#0D1B30]
              p-6
              md:p-8
            "
          >

            {/* RESULT HEADER */}

            <div
              className="
                flex
                flex-col
                md:flex-row
                md:items-center
                md:justify-between
                gap-5
                mb-8
              "
            >

              <div className="flex items-center gap-4">

                <div
                  className="
                    w-12
                    h-12
                    rounded-xl
                    bg-emerald-400/10
                    flex
                    items-center
                    justify-center
                  "
                >

                  <CheckCircle2
                    size={23}
                    className="text-emerald-400"
                  />

                </div>

                <div>

                  <h2 className="text-2xl font-semibold">
                    Prescription detected
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    Review the extracted information
                    before confirming.
                  </p>

                </div>

              </div>


              <button
                type="button"
                onClick={() => {
                  setShowPreview(false);
                  setPrescription(null);
                }}
                className="
                  inline-flex
                  items-center
                  gap-2
                  px-4
                  py-2
                  rounded-xl
                  bg-white/5
                  hover:bg-white/10
                  text-slate-400
                "
              >

                <X size={17} />

                Start over

              </button>

            </div>


            {/* FILE */}

            <div
              className="
                rounded-xl
                border
                border-white/10
                bg-white/[0.03]
                p-4
                mb-6
              "
            >

              <div className="flex items-center gap-3">

                <FileText
                  size={20}
                  className="text-cyan-400"
                />

                <div>

                  <p className="text-sm font-medium">
                    {file?.name}
                  </p>

                  <p className="text-xs text-slate-500 mt-1">
                    AI extraction completed
                  </p>

                </div>

              </div>

            </div>


            {/* MEDICINES */}

            <div>

              <div className="flex items-center gap-3 mb-4">

                <Pill
                  size={20}
                  className="text-cyan-400"
                />

                <h3 className="text-lg font-semibold">
                  Detected medications
                </h3>

              </div>


              <div className="space-y-4">

                {prescription.medicines.map(
                  (medicine) => (

                    <div
                      key={medicine.id}
                      className="
                        rounded-2xl
                        border
                        border-white/10
                        bg-white/[0.03]
                        p-5
                      "
                    >

                      <div className="flex items-start gap-4">

                        <div
                          className="
                            w-11
                            h-11
                            rounded-xl
                            bg-cyan-400/10
                            flex
                            items-center
                            justify-center
                            shrink-0
                          "
                        >

                          <Pill
                            size={20}
                            className="text-cyan-400"
                          />

                        </div>


                        <div className="flex-1">

                          <h4 className="text-lg font-semibold">
                            {medicine.name}
                          </h4>

                          <p className="text-sm text-slate-500 mt-1">
                            {medicine.dosage}
                            {" · "}
                            {medicine.form}
                          </p>


                          <div
                            className="
                              grid
                              grid-cols-1
                              md:grid-cols-3
                              gap-4
                              mt-5
                            "
                          >

                            <div>

                              <p className="text-xs text-slate-500">
                                Frequency
                              </p>

                              <p className="text-sm text-slate-300 mt-1">
                                {medicine.frequency}
                              </p>

                            </div>


                            <div>

                              <p className="text-xs text-slate-500">
                                Dose time
                              </p>

                              <p className="text-sm text-slate-300 mt-1">
                                {medicine.time}
                              </p>

                            </div>


                            <div>

                              <p className="text-xs text-slate-500">
                                Quantity
                              </p>

                              <p className="text-sm text-slate-300 mt-1">
                                {medicine.quantity}
                              </p>

                            </div>

                          </div>


                          <div
                            className="
                              flex
                              items-center
                              gap-2
                              mt-4
                              text-sm
                              text-slate-400
                            "
                          >

                            <CalendarDays
                              size={15}
                              className="text-slate-500"
                            />

                            <span>
                              {medicine.startDate ||
                                "Start date not detected"}
                            </span>

                            <span>
                              →
                            </span>

                            <span>
                              {medicine.endDate ||
                                "End date not detected"}
                            </span>

                          </div>


                          {medicine.instructions && (

                            <p className="text-sm text-slate-500 mt-3">
                              {medicine.instructions}
                            </p>

                          )}

                        </div>

                      </div>

                    </div>

                  )
                )}

              </div>

            </div>


            {/* WARNING */}

            <div
              className="
                flex
                items-start
                gap-3
                mt-6
                rounded-xl
                border
                border-orange-400/10
                bg-orange-400/[0.03]
                p-4
              "
            >

              <AlertCircle
                size={18}
                className="text-orange-400 mt-0.5 shrink-0"
              />

              <p className="text-sm text-slate-400">
                Always verify the extracted
                medication information against the
                original prescription before confirming.
              </p>

            </div>


            {/* ACTIONS */}

            <div
              className="
                flex
                flex-col-reverse
                sm:flex-row
                justify-end
                gap-3
                mt-7
                pt-6
                border-t
                border-white/10
              "
            >

              <button
                type="button"
                onClick={() => {
                  setShowPreview(false);
                  setPrescription(null);
                }}
                className="
                  px-6
                  py-3
                  rounded-full
                  border
                  border-white/10
                  bg-white/5
                  hover:bg-white/10
                  text-slate-300
                  font-medium
                "
              >

                Review again

              </button>


              <button
                type="button"
                onClick={
                  confirmPrescription
                }
                className="
                  px-7
                  py-3
                  rounded-full
                  bg-cyan-400
                  hover:bg-cyan-300
                  text-[#06111F]
                  font-semibold
                "
              >

                Confirm prescription

              </button>

            </div>

          </section>

        )}

      </main>

    </div>
  );
}

export default Prescriptions;