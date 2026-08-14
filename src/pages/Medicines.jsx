import { useEffect, useMemo, useState } from "react";

import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Edit3,
  Pill,
  Plus,
  Trash2,
  X,
} from "lucide-react";

const STORAGE_KEY = "dosetwin_medicines";
const MEDICINE_EVENT = "dosetwin-medicines-updated";

/* =========================================================
   DEFAULT DATA
========================================================= */

const defaultMedicines = [
  {
    id: 1,
    name: "Metformin",
    dosage: "500 mg",
    form: "Tablet",
    frequency: "Once daily",
    schedule: "Morning",
    time: "8:00 AM",
    doseTimes: ["08:00"],

    /* PRESCRIPTION */

    prescriptionStartDate: "",
    prescriptionEndDate: "",
    prescribedQuantity: 30,

    /* CURRENT INVENTORY */

    stock: 30,

    lowStockAlert: 3,

    purpose: "",
    status: "Active",
    accentColor: "Teal",
    notes: "Take after breakfast",
    instructions: "Take after breakfast",
    taken: true,
  },

  {
    id: 2,
    name: "Omega 3",
    dosage: "1000 mg",
    form: "Capsule",
    frequency: "Once daily",
    schedule: "Afternoon",
    time: "1:00 PM",
    doseTimes: ["13:00"],

    prescriptionStartDate: "",
    prescriptionEndDate: "",
    prescribedQuantity: 20,

    stock: 20,

    lowStockAlert: 3,

    purpose: "",
    status: "Active",
    accentColor: "Purple",
    notes: "Take with food",
    instructions: "Take with food",
    taken: true,
  },

  {
    id: 3,
    name: "Vitamin D",
    dosage: "1000 IU",
    form: "Tablet",
    frequency: "Once daily",
    schedule: "Evening",
    time: "7:30 PM",
    doseTimes: ["19:30"],

    prescriptionStartDate: "",
    prescriptionEndDate: "",
    prescribedQuantity: 30,

    stock: 30,

    lowStockAlert: 3,

    purpose: "",
    status: "Active",
    accentColor: "Orange",
    notes: "Take after dinner",
    instructions: "Take after dinner",
    taken: true,
  },
];

/* =========================================================
   LOAD MEDICINES
========================================================= */

function loadMedicines() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(defaultMedicines)
      );

      return defaultMedicines;
    }

    const parsed = JSON.parse(stored);

    return Array.isArray(parsed)
      ? parsed
      : defaultMedicines;
  } catch (error) {
    console.error(
      "Could not load medicines:",
      error
    );

    return defaultMedicines;
  }
}

/* =========================================================
   SAVE MEDICINES
========================================================= */

function saveMedicines(medicines) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(medicines)
  );

  window.dispatchEvent(
    new Event(MEDICINE_EVENT)
  );
}

/* =========================================================
   EMPTY FORM
========================================================= */

const emptyForm = {
  name: "",
  dosage: "",
  form: "Tablet",
  frequency: "Once daily",

  doseTimes: [""],

  prescriptionStartDate: "",
  prescriptionEndDate: "",
  prescribedQuantity: "",

  stock: "",
  lowStockAlert: "3",

  purpose: "",
  status: "Active",
  accentColor: "Teal",
  notes: "",
};

/* =========================================================
   FREQUENCY → DAILY DOSE COUNT
========================================================= */

function getDailyDoseCount(frequency) {
  switch (frequency) {
    case "Once daily":
      return 1;

    case "Twice daily":
      return 2;

    case "Three times daily":
      return 3;

    case "Four times daily":
      return 4;

    case "Every other day":
      return 0.5;

    case "Weekly":
      return 1 / 7;

    case "As needed":
      return 0;

    default:
      return 1;
  }
}

/* =========================================================
   DAYS BETWEEN DATES
========================================================= */

function getDaysBetween(startDate, endDate) {
  if (!startDate || !endDate) {
    return 0;
  }

  const start = new Date(
    `${startDate}T00:00:00`
  );

  const end = new Date(
    `${endDate}T00:00:00`
  );

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime())
  ) {
    return 0;
  }

  const difference =
    end.getTime() - start.getTime();

  return Math.max(
    0,
    Math.ceil(
      difference /
        (1000 * 60 * 60 * 24)
    ) + 1
  );
}

/* =========================================================
   DAYS REMAINING
========================================================= */

function getPrescriptionDaysRemaining(
  endDate
) {
  if (!endDate) {
    return null;
  }

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const end = new Date(
    `${endDate}T00:00:00`
  );

  if (Number.isNaN(end.getTime())) {
    return null;
  }

  const difference =
    end.getTime() - today.getTime();

  return Math.max(
    0,
    Math.ceil(
      difference /
        (1000 * 60 * 60 * 24)
    )
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

function Medicines() {
  const [medicines, setMedicines] =
    useState(loadMedicines);

  const [showModal, setShowModal] =
    useState(false);

  const [editingId, setEditingId] =
    useState(null);

  const [form, setForm] =
    useState(emptyForm);

  /* =======================================================
     AUTOMATIC SYNC
  ======================================================= */

  useEffect(() => {
    const syncMedicines = () => {
      setMedicines(loadMedicines());
    };

    window.addEventListener(
      "storage",
      syncMedicines
    );

    window.addEventListener(
      MEDICINE_EVENT,
      syncMedicines
    );

    return () => {
      window.removeEventListener(
        "storage",
        syncMedicines
      );

      window.removeEventListener(
        MEDICINE_EVENT,
        syncMedicines
      );
    };
  }, []);

  /* =======================================================
     FORM HANDLER
  ======================================================= */

  const updateForm = (
    field,
    value
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  /* =======================================================
     OPEN ADD
  ======================================================= */

  const openAddModal = () => {
    setEditingId(null);

    setForm({
      ...emptyForm,
      doseTimes: [""],
    });

    setShowModal(true);
  };

  /* =======================================================
     OPEN EDIT
  ======================================================= */

  const openEditModal = (
    medicine
  ) => {
    setEditingId(medicine.id);

    setForm({
      name: medicine.name || "",

      dosage:
        medicine.dosage || "",

      form:
        medicine.form || "Tablet",

      frequency:
        medicine.frequency ||
        "Once daily",

      doseTimes:
        medicine.doseTimes?.length
          ? medicine.doseTimes
          : [""],

      prescriptionStartDate:
        medicine.prescriptionStartDate ||
        "",

      prescriptionEndDate:
        medicine.prescriptionEndDate ||
        "",

      prescribedQuantity:
        medicine.prescribedQuantity !==
        undefined
          ? String(
              medicine.prescribedQuantity
            )
          : "",

      stock:
        medicine.stock !==
        undefined
          ? String(medicine.stock)
          : "",

      lowStockAlert:
        medicine.lowStockAlert !==
        undefined
          ? String(
              medicine.lowStockAlert
            )
          : "3",

      purpose:
        medicine.purpose || "",

      status:
        medicine.status || "Active",

      accentColor:
        medicine.accentColor ||
        "Teal",

      notes:
        medicine.notes ||
        medicine.instructions ||
        "",
    });

    setShowModal(true);
  };

  /* =======================================================
     CLOSE MODAL
  ======================================================= */

  const closeModal = () => {
    setShowModal(false);

    setEditingId(null);

    setForm({
      ...emptyForm,
      doseTimes: [""],
    });
  };

  /* =======================================================
     ADD TIME SLOT
  ======================================================= */

  const addTimeSlot = () => {
    setForm((previous) => ({
      ...previous,

      doseTimes: [
        ...previous.doseTimes,
        "",
      ],
    }));
  };

  /* =======================================================
     REMOVE TIME SLOT
  ======================================================= */

  const removeTimeSlot = (
    index
  ) => {
    setForm((previous) => {
      const updated =
        previous.doseTimes.filter(
          (_, i) => i !== index
        );

      return {
        ...previous,

        doseTimes:
          updated.length > 0
            ? updated
            : [""],
      };
    });
  };

  /* =======================================================
     UPDATE TIME
  ======================================================= */

  const updateTimeSlot = (
    index,
    value
  ) => {
    setForm((previous) => {
      const updated = [
        ...previous.doseTimes,
      ];

      updated[index] = value;

      return {
        ...previous,
        doseTimes: updated,
      };
    });
  };

  /* =======================================================
     FORMAT TIME
  ======================================================= */

  const formatTime = (time) => {
    if (!time) {
      return "";
    }

    const [hours, minutes] =
      time.split(":");

    let hour = Number(hours);

    const period =
      hour >= 12 ? "PM" : "AM";

    hour = hour % 12 || 12;

    return `${hour}:${minutes} ${period}`;
  };

  /* =======================================================
     GET SCHEDULE
  ======================================================= */

  const getSchedule = (
    time
  ) => {
    if (!time) {
      return "Morning";
    }

    const hour = Number(
      time.split(":")[0]
    );

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
  };

  /* =======================================================
     SAVE MEDICINE
  ======================================================= */

  const handleSubmit = (
    event
  ) => {
    event.preventDefault();

    if (!form.name.trim()) {
      alert(
        "Please enter a medicine name."
      );

      return;
    }

    if (!form.dosage.trim()) {
      alert(
        "Please enter the dosage."
      );

      return;
    }

    const validTimes =
      form.doseTimes.filter(
        (time) => time
      );

    const firstTime =
      validTimes[0] || "";

    /* -----------------------------------------------
       PRESCRIPTION VALIDATION
    ------------------------------------------------ */

    if (
      form.prescriptionStartDate &&
      form.prescriptionEndDate
    ) {
      const start =
        new Date(
          `${form.prescriptionStartDate}T00:00:00`
        );

      const end =
        new Date(
          `${form.prescriptionEndDate}T00:00:00`
        );

      if (end < start) {
        alert(
          "Prescription end date cannot be before the start date."
        );

        return;
      }
    }

    const medicineData = {
      name:
        form.name.trim(),

      dosage:
        form.dosage.trim(),

      form:
        form.form,

      frequency:
        form.frequency,

      doseTimes:
        validTimes,

      schedule:
        getSchedule(firstTime),

      time:
        formatTime(firstTime),

      /* PRESCRIPTION */

      prescriptionStartDate:
        form.prescriptionStartDate,

      prescriptionEndDate:
        form.prescriptionEndDate,

      prescribedQuantity:
        Number(
          form.prescribedQuantity
        ) || 0,

      /* INVENTORY */

      stock:
        Number(form.stock) || 0,

      lowStockAlert:
        Number(
          form.lowStockAlert
        ) || 3,

      purpose:
        form.purpose.trim(),

      status:
        form.status,

      accentColor:
        form.accentColor,

      notes:
        form.notes.trim(),

      instructions:
        form.notes.trim(),

      /*
        Preserve taken state when editing.
      */

      taken:
        editingId
          ? medicines.find(
              (medicine) =>
                medicine.id ===
                editingId
            )?.taken || false
          : false,
    };

    let updatedMedicines;

    /* =====================================================
       EDIT
    ===================================================== */

    if (editingId) {
      updatedMedicines =
        medicines.map(
          (medicine) =>
            medicine.id ===
            editingId
              ? {
                  ...medicine,
                  ...medicineData,
                  id: medicine.id,
                }
              : medicine
        );
    }

    /* =====================================================
       ADD
    ===================================================== */

    else {
      const newMedicine = {
        id: Date.now(),
        ...medicineData,
      };

      updatedMedicines = [
        ...medicines,
        newMedicine,
      ];
    }

    setMedicines(
      updatedMedicines
    );

    saveMedicines(
      updatedMedicines
    );

    closeModal();
  };

  /* =======================================================
     DELETE
  ======================================================= */

  const deleteMedicine = (
    id
  ) => {
    const medicine =
      medicines.find(
        (item) =>
          item.id === id
      );

    const confirmed =
      window.confirm(
        `Delete ${
          medicine?.name ||
          "this medicine"
        }?`
      );

    if (!confirmed) {
      return;
    }

    const updatedMedicines =
      medicines.filter(
        (medicine) =>
          medicine.id !== id
      );

    setMedicines(
      updatedMedicines
    );

    saveMedicines(
      updatedMedicines
    );
  };

  /* =======================================================
     TOGGLE TAKEN
  ======================================================= */

  const toggleTaken = (
    id
  ) => {
    const updatedMedicines =
      medicines.map(
        (medicine) =>
          medicine.id === id
            ? {
                ...medicine,
                taken:
                  !medicine.taken,
              }
            : medicine
      );

    setMedicines(
      updatedMedicines
    );

    saveMedicines(
      updatedMedicines
    );
  };

  /* =======================================================
     MEDICINE STATUS
  ======================================================= */

  const getMedicineStatus = (
    medicine
  ) => {
    const stock =
      Number(
        medicine.stock
      ) || 0;

    const lowStock =
      Number(
        medicine.lowStockAlert
      ) || 3;

    /*
      Critical if stock is 3 or below.
    */

    if (stock <= 3) {
      return {
        type: "critical",
        label: "Critical stock",
      };
    }

    /*
      If there is no prescription,
      fall back to the basic stock threshold.
    */

    if (
      !medicine.prescriptionEndDate ||
      !medicine.prescribedQuantity
    ) {
      if (stock <= lowStock) {
        return {
          type: "attention",
          label: "Low stock",
        };
      }

      return {
        type: "good",
        label: "Stock sufficient",
      };
    }

    const daysRemaining =
      getPrescriptionDaysRemaining(
        medicine.prescriptionEndDate
      );

    /*
      Prescription has ended.
    */

    if (
      daysRemaining === 0
    ) {
      return {
        type: "completed",
        label: "Prescription ended",
      };
    }

    const dailyDose =
      getDailyDoseCount(
        medicine.frequency
      );

    /*
      As-needed medicines cannot
      calculate exact requirement.
    */

    if (dailyDose === 0) {
      return {
        type:
          stock <= lowStock
            ? "attention"
            : "good",

        label:
          stock <= lowStock
            ? "Low stock"
            : "Stock sufficient",
      };
    }

    const expectedRequired =
      Math.ceil(
        dailyDose *
          daysRemaining
      );

    /*
      Stock is not enough to finish
      the remaining prescription.
    */

    if (
      stock <
      expectedRequired
    ) {
      return {
        type: "attention",
        label:
          "Insufficient for prescription",
      };
    }

    return {
      type: "good",
      label: "Stock sufficient",
    };
  };

  /* =======================================================
     STATISTICS
  ======================================================= */

  const totalMedicines =
    medicines.length;

  const takenToday =
    medicines.filter(
      (medicine) =>
        medicine.taken
    ).length;

  const remaining =
    totalMedicines -
    takenToday;

  const criticalCount =
    medicines.filter(
      (medicine) =>
        getMedicineStatus(
          medicine
        ).type === "critical"
    ).length;

  const attentionCount =
    medicines.filter(
      (medicine) =>
        getMedicineStatus(
          medicine
        ).type ===
        "attention"
    ).length;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#08111F] text-white">

      <main className="max-w-[1400px] mx-auto px-6 md:px-8 py-10">

        {/* =================================================
            HEADER
        ================================================= */}

        <section className="mb-10">

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">

            <div>

              <p className="text-cyan-400 text-sm font-medium mb-3">
                MEDICATION MANAGEMENT
              </p>

              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Your medicines
              </h1>

              <p className="text-lg text-slate-400 mt-4">
                Manage your medications,
                prescriptions, schedules,
                inventory, and adherence.
              </p>

            </div>

            <button
              onClick={
                openAddModal
              }
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
                transition
                shadow-[0_0_30px_rgba(34,211,238,0.15)]
              "
            >

              <Plus size={22} />

              Add Medicine

            </button>

          </div>

        </section>


        {/* =================================================
            STATISTICS
        ================================================= */}

        <section
          className="
            grid
            grid-cols-1
            md:grid-cols-3
            xl:grid-cols-5
            gap-5
            mb-10
          "
        >

          <div
            className="
              rounded-2xl
              border
              border-white/10
              bg-white/5
              p-6
            "
          >

            <p className="text-slate-400">
              Total medicines
            </p>

            <h2 className="text-5xl font-bold mt-3">
              {totalMedicines}
            </h2>

          </div>


          <div
            className="
              rounded-2xl
              border
              border-white/10
              bg-white/5
              p-6
            "
          >

            <p className="text-slate-400">
              Taken today
            </p>

            <h2 className="text-5xl font-bold mt-3 text-emerald-400">
              {takenToday}
            </h2>

          </div>


          <div
            className="
              rounded-2xl
              border
              border-white/10
              bg-white/5
              p-6
            "
          >

            <p className="text-slate-400">
              Remaining
            </p>

            <h2 className="text-5xl font-bold mt-3 text-orange-400">
              {remaining}
            </h2>

          </div>


          <div
            className="
              rounded-2xl
              border
              border-white/10
              bg-white/5
              p-6
            "
          >

            <p className="text-slate-400">
              Prescription alerts
            </p>

            <h2 className="text-5xl font-bold mt-3 text-orange-400">
              {attentionCount}
            </h2>

          </div>


          <div
            className="
              rounded-2xl
              border
              border-red-400/10
              bg-red-400/5
              p-6
            "
          >

            <p className="text-slate-400">
              Critical stock
            </p>

            <h2 className="text-5xl font-bold mt-3 text-red-400">
              {criticalCount}
            </h2>

          </div>

        </section>


        {/* =================================================
            MEDICINE LIST
        ================================================= */}

        <section>

          <div className="flex items-center justify-between mb-6">

            <div>

              <h2 className="text-2xl font-semibold">
                Your medication
              </h2>

              <p className="text-slate-500 mt-1">
                Active medications,
                prescriptions, and inventory
              </p>

            </div>

          </div>


          {medicines.length === 0 ? (

            <div
              className="
                rounded-2xl
                border
                border-white/10
                bg-white/5
                py-20
                text-center
              "
            >

              <Pill
                size={45}
                className="mx-auto text-slate-600 mb-4"
              />

              <h3 className="text-xl font-semibold">
                No medicines yet
              </h3>

              <p className="text-slate-500 mt-2 mb-6">
                Add your first medicine
                to get started.
              </p>

              <button
                onClick={
                  openAddModal
                }
                className="
                  inline-flex
                  items-center
                  gap-2
                  px-6
                  py-3
                  rounded-full
                  bg-cyan-400
                  text-[#06111F]
                  font-semibold
                "
              >

                <Plus size={18} />

                Add Medicine

              </button>

            </div>

          ) : (

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

              {medicines.map(
                (medicine) => {

                  const stock =
                    Number(
                      medicine.stock
                    ) || 0;

                  const status =
                    getMedicineStatus(
                      medicine
                    );

                  const daysRemaining =
                    getPrescriptionDaysRemaining(
                      medicine.prescriptionEndDate
                    );

                  const prescribedQuantity =
                    Number(
                      medicine.prescribedQuantity
                    ) || 0;

                  const prescriptionProgress =
                    prescribedQuantity >
                    0
                      ? Math.min(
                          100,
                          Math.max(
                            0,
                            (stock /
                              prescribedQuantity) *
                              100
                          )
                        )
                      : 0;

                  return (
                    <div
                      key={medicine.id}
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

                      {/* TOP */}

                      <div className="flex items-start justify-between gap-4">

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
                            "
                          >

                            <Pill
                              size={23}
                              className="text-cyan-400"
                            />

                          </div>

                          <div>

                            <h3 className="text-xl font-semibold">
                              {medicine.name}
                            </h3>

                            <p className="text-sm text-slate-500 mt-1">
                              {medicine.dosage}
                              {" · "}
                              {medicine.form ||
                                "Tablet"}
                            </p>

                          </div>

                        </div>


                        {/* ACTIONS */}

                        <div className="flex items-center gap-2">

                          <button
                            onClick={() =>
                              openEditModal(
                                medicine
                              )
                            }
                            className="
                              w-9
                              h-9
                              rounded-lg
                              bg-white/5
                              hover:bg-white/10
                              flex
                              items-center
                              justify-center
                              text-slate-400
                              hover:text-white
                              transition
                            "
                            title="Edit medicine"
                          >

                            <Edit3 size={17} />

                          </button>


                          <button
                            onClick={() =>
                              deleteMedicine(
                                medicine.id
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
                            title="Delete medicine"
                          >

                            <Trash2 size={17} />

                          </button>

                        </div>

                      </div>


                      {/* DETAILS */}

                      <div
                        className="
                          grid
                          grid-cols-2
                          gap-4
                          mt-6
                        "
                      >

                        <div>

                          <p className="text-xs text-slate-500 uppercase tracking-wide">
                            Schedule
                          </p>

                          <div className="flex items-center gap-2 mt-2">

                            <Clock3
                              size={16}
                              className="text-cyan-400"
                            />

                            <span className="text-slate-300">
                              {medicine.time ||
                                "Not set"}
                            </span>

                          </div>

                        </div>


                        <div>

                          <p className="text-xs text-slate-500 uppercase tracking-wide">
                            Frequency
                          </p>

                          <p className="text-slate-300 mt-2">
                            {medicine.frequency ||
                              "Once daily"}
                          </p>

                        </div>

                      </div>


                      {/* PRESCRIPTION */}

                      <div
                        className="
                          mt-6
                          rounded-xl
                          border
                          border-white/10
                          bg-black/10
                          p-4
                        "
                      >

                        <div className="flex items-center gap-2 mb-4">

                          <CalendarDays
                            size={17}
                            className="text-cyan-400"
                          />

                          <p className="text-sm font-medium">
                            Prescription
                          </p>

                        </div>


                        <div
                          className="
                            grid
                            grid-cols-2
                            gap-4
                          "
                        >

                          <div>

                            <p className="text-xs text-slate-500">
                              Start
                            </p>

                            <p className="text-sm text-slate-300 mt-1">
                              {medicine.prescriptionStartDate ||
                                "Not set"}
                            </p>

                          </div>


                          <div>

                            <p className="text-xs text-slate-500">
                              End
                            </p>

                            <p className="text-sm text-slate-300 mt-1">
                              {medicine.prescriptionEndDate ||
                                "Not set"}
                            </p>

                          </div>


                          <div>

                            <p className="text-xs text-slate-500">
                              Prescribed
                            </p>

                            <p className="text-sm text-slate-300 mt-1">
                              {prescribedQuantity
                                ? `${prescribedQuantity} ${medicine.form === "Liquid" ? "units" : "doses"}`
                                : "Not set"}
                            </p>

                          </div>


                          <div>

                            <p className="text-xs text-slate-500">
                              Days left
                            </p>

                            <p className="text-sm text-slate-300 mt-1">

                              {daysRemaining ===
                              null
                                ? "Not set"
                                : daysRemaining ===
                                  0
                                ? "Ended"
                                : `${daysRemaining} day${
                                    daysRemaining ===
                                    1
                                      ? ""
                                      : "s"
                                  }`}

                            </p>

                          </div>

                        </div>

                      </div>


                      {/* STOCK */}

                      <div className="mt-6">

                        <div className="flex items-center justify-between mb-2">

                          <p className="text-xs text-slate-500 uppercase tracking-wide">
                            Current stock
                          </p>

                          <span
                            className={`
                              text-sm
                              font-medium
                              ${
                                status.type ===
                                "critical"
                                  ? "text-red-400"
                                  : status.type ===
                                    "attention"
                                  ? "text-orange-400"
                                  : status.type ===
                                    "completed"
                                  ? "text-slate-400"
                                  : "text-emerald-400"
                              }
                            `}
                          >
                            {stock} remaining
                          </span>

                        </div>


                        <div className="h-2 bg-slate-700/60 rounded-full overflow-hidden">

                          <div
                            className={`
                              h-full
                              rounded-full
                              transition-all
                              ${
                                status.type ===
                                "critical"
                                  ? "bg-red-400"
                                  : status.type ===
                                    "attention"
                                  ? "bg-orange-400"
                                  : "bg-cyan-400"
                              }
                            `}
                            style={{
                              width: `${prescriptionProgress}%`,
                            }}
                          />

                        </div>


                        {/* STATUS */}

                        <div className="mt-3">

                          {status.type ===
                            "critical" && (

                            <div className="flex items-center gap-2 text-red-400 text-sm">

                              <AlertTriangle
                                size={15}
                              />

                              Critical stock —
                              only {stock} remaining

                            </div>

                          )}


                          {status.type ===
                            "attention" && (

                            <div className="flex items-center gap-2 text-orange-400 text-sm">

                              <AlertTriangle
                                size={15}
                              />

                              {status.label}

                            </div>

                          )}


                          {status.type ===
                            "good" && (

                            <div className="flex items-center gap-2 text-emerald-400 text-sm">

                              <CheckCircle2
                                size={15}
                              />

                              {status.label}

                            </div>

                          )}


                          {status.type ===
                            "completed" && (

                            <div className="flex items-center gap-2 text-slate-400 text-sm">

                              <CalendarDays
                                size={15}
                              />

                              Prescription ended

                            </div>

                          )}

                        </div>

                      </div>


                      {/* FOOTER */}

                      <div
                        className="
                          mt-6
                          pt-5
                          border-t
                          border-white/10
                          flex
                          items-center
                          justify-between
                        "
                      >

                        <span
                          className={
                            medicine.taken
                              ? "flex items-center gap-2 text-emerald-400 text-sm"
                              : "flex items-center gap-2 text-orange-400 text-sm"
                          }
                        >

                          {medicine.taken ? (
                            <>
                              <CheckCircle2
                                size={17}
                              />

                              Taken today
                            </>
                          ) : (
                            <>
                              <Clock3
                                size={17}
                              />

                              Upcoming
                            </>
                          )}

                        </span>


                        <button
                          onClick={() =>
                            toggleTaken(
                              medicine.id
                            )
                          }
                          className="
                            px-4
                            py-2
                            rounded-full
                            bg-white/5
                            hover:bg-white/10
                            text-sm
                            text-slate-300
                            transition
                          "
                        >

                          {medicine.taken
                            ? "Mark upcoming"
                            : "Mark as taken"}

                        </button>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          )}

        </section>

      </main>


      {/* ===================================================
          ADD / EDIT MODAL
      =================================================== */}

      {showModal && (

        <div
          className="
            fixed
            inset-0
            z-[100]
            flex
            items-center
            justify-center
            p-4
            bg-black/70
            backdrop-blur-md
          "
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }
          }}
        >

          <div
            className="
              w-full
              max-w-[680px]
              max-h-[92vh]
              overflow-y-auto
              rounded-2xl
              border
              border-white/10
              bg-[#0B192B]
              shadow-2xl
            "
          >

            {/* HEADER */}

            <div
              className="
                sticky
                top-0
                z-10
                bg-[#0B192B]
                border-b
                border-white/10
                px-7
                py-5
                flex
                items-center
                justify-between
              "
            >

              <div>

                <h2 className="text-2xl font-semibold">
                  {editingId
                    ? "Edit Medicine"
                    : "Add Medicine"}
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Prescription and inventory
                  information
                </p>

              </div>

              <button
                onClick={
                  closeModal
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
                  transition
                "
              >

                <X size={21} />

              </button>

            </div>


            {/* FORM */}

            <form
              onSubmit={
                handleSubmit
              }
              className="px-7 py-6"
            >

              {/* NAME + DOSAGE */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <div>

                  <label className="block text-sm text-slate-400 mb-2">
                    Medicine name
                  </label>

                  <input
                    type="text"
                    value={form.name}
                    onChange={(event) =>
                      updateForm(
                        "name",
                        event.target.value
                      )
                    }
                    placeholder="e.g. Metformin"
                    className="
                      w-full
                      h-12
                      px-4
                      rounded-xl
                      border
                      border-white/10
                      bg-white/5
                      text-white
                      placeholder:text-slate-600
                      outline-none
                      focus:border-cyan-400/50
                    "
                  />

                </div>


                <div>

                  <label className="block text-sm text-slate-400 mb-2">
                    Dosage
                  </label>

                  <input
                    type="text"
                    value={form.dosage}
                    onChange={(event) =>
                      updateForm(
                        "dosage",
                        event.target.value
                      )
                    }
                    placeholder="e.g. 500 mg"
                    className="
                      w-full
                      h-12
                      px-4
                      rounded-xl
                      border
                      border-white/10
                      bg-white/5
                      text-white
                      placeholder:text-slate-600
                      outline-none
                      focus:border-cyan-400/50
                    "
                  />

                </div>

              </div>


              {/* FORM + FREQUENCY */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">

                <div>

                  <label className="block text-sm text-slate-400 mb-2">
                    Form
                  </label>

                  <select
                    value={
                      form.form
                    }
                    onChange={(event) =>
                      updateForm(
                        "form",
                        event.target.value
                      )
                    }
                    className="
                      w-full
                      h-12
                      px-4
                      rounded-xl
                      border
                      border-white/10
                      bg-[#111F32]
                      text-white
                      outline-none
                      focus:border-cyan-400/50
                    "
                  >

                    <option>
                      Tablet
                    </option>

                    <option>
                      Capsule
                    </option>

                    <option>
                      Liquid
                    </option>

                    <option>
                      Injection
                    </option>

                    <option>
                      Powder
                    </option>

                    <option>
                      Other
                    </option>

                  </select>

                </div>


                <div>

                  <label className="block text-sm text-slate-400 mb-2">
                    Frequency
                  </label>

                  <select
                    value={
                      form.frequency
                    }
                    onChange={(event) =>
                      updateForm(
                        "frequency",
                        event.target.value
                      )
                    }
                    className="
                      w-full
                      h-12
                      px-4
                      rounded-xl
                      border
                      border-white/10
                      bg-[#111F32]
                      text-white
                      outline-none
                      focus:border-cyan-400/50
                    "
                  >

                    <option>
                      Once daily
                    </option>

                    <option>
                      Twice daily
                    </option>

                    <option>
                      Three times daily
                    </option>

                    <option>
                      Four times daily
                    </option>

                    <option>
                      Every other day
                    </option>

                    <option>
                      Weekly
                    </option>

                    <option>
                      As needed
                    </option>

                  </select>

                </div>

              </div>


              {/* DOSE TIMES */}

              <div className="mt-5">

                <label className="block text-sm text-slate-400 mb-2">
                  Dose times
                </label>

                <div className="space-y-3">

                  {form.doseTimes.map(
                    (
                      time,
                      index
                    ) => (

                      <div
                        key={index}
                        className="flex items-center gap-2"
                      >

                        <input
                          type="time"
                          value={time}
                          onChange={(event) =>
                            updateTimeSlot(
                              index,
                              event.target.value
                            )
                          }
                          className="
                            flex-1
                            h-12
                            px-4
                            rounded-xl
                            border
                            border-white/10
                            bg-white/5
                            text-white
                            outline-none
                            focus:border-cyan-400/50
                          "
                        />

                        {form
                          .doseTimes
                          .length >
                          1 && (

                          <button
                            type="button"
                            onClick={() =>
                              removeTimeSlot(
                                index
                              )
                            }
                            className="
                              w-10
                              h-10
                              rounded-lg
                              text-slate-500
                              hover:text-red-400
                              hover:bg-red-400/5
                              flex
                              items-center
                              justify-center
                            "
                          >

                            <X
                              size={17}
                            />

                          </button>

                        )}

                      </div>

                    )
                  )}

                </div>


                <button
                  type="button"
                  onClick={
                    addTimeSlot
                  }
                  className="
                    mt-3
                    inline-flex
                    items-center
                    gap-2
                    text-cyan-400
                    hover:text-cyan-300
                    text-sm
                    font-medium
                  "
                >

                  <Plus size={17} />

                  Add time slot

                </button>

              </div>


              {/* =================================================
                  PRESCRIPTION SECTION
              ================================================= */}

              <div
                className="
                  mt-7
                  rounded-2xl
                  border
                  border-cyan-400/10
                  bg-cyan-400/[0.03]
                  p-5
                "
              >

                <div className="flex items-center gap-3 mb-5">

                  <div
                    className="
                      w-10
                      h-10
                      rounded-xl
                      bg-cyan-400/10
                      flex
                      items-center
                      justify-center
                    "
                  >

                    <CalendarDays
                      size={19}
                      className="text-cyan-400"
                    />

                  </div>

                  <div>

                    <h3 className="font-semibold">
                      Prescription
                    </h3>

                    <p className="text-xs text-slate-500 mt-1">
                      Used to calculate
                      expected medication
                      requirements.
                    </p>

                  </div>

                </div>


                {/* START + END */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                  <div>

                    <label className="block text-sm text-slate-400 mb-2">
                      Prescription start
                    </label>

                    <input
                      type="date"
                      value={
                        form.prescriptionStartDate
                      }
                      onChange={(event) =>
                        updateForm(
                          "prescriptionStartDate",
                          event.target.value
                        )
                      }
                      className="
                        w-full
                        h-12
                        px-4
                        rounded-xl
                        border
                        border-white/10
                        bg-[#111F32]
                        text-white
                        outline-none
                        focus:border-cyan-400/50
                      "
                    />

                  </div>


                  <div>

                    <label className="block text-sm text-slate-400 mb-2">
                      Prescription end
                    </label>

                    <input
                      type="date"
                      value={
                        form.prescriptionEndDate
                      }
                      onChange={(event) =>
                        updateForm(
                          "prescriptionEndDate",
                          event.target.value
                        )
                      }
                      className="
                        w-full
                        h-12
                        px-4
                        rounded-xl
                        border
                        border-white/10
                        bg-[#111F32]
                        text-white
                        outline-none
                        focus:border-cyan-400/50
                      "
                    />

                  </div>

                </div>


                {/* PRESCRIBED QUANTITY */}

                <div className="mt-5">

                  <label className="block text-sm text-slate-400 mb-2">
                    Prescribed quantity
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={
                      form.prescribedQuantity
                    }
                    onChange={(event) =>
                      updateForm(
                        "prescribedQuantity",
                        event.target.value
                      )
                    }
                    placeholder="e.g. 30"
                    className="
                      w-full
                      h-12
                      px-4
                      rounded-xl
                      border
                      border-white/10
                      bg-white/5
                      text-white
                      placeholder:text-slate-600
                      outline-none
                      focus:border-cyan-400/50
                    "
                  />

                  <p className="text-xs text-slate-600 mt-2">
                    Total quantity prescribed
                    for this prescription.
                  </p>

                </div>

              </div>


              {/* =================================================
                  INVENTORY
              ================================================= */}

              <div
                className="
                  mt-5
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/[0.02]
                  p-5
                "
              >

                <div className="flex items-center gap-3 mb-5">

                  <div
                    className="
                      w-10
                      h-10
                      rounded-xl
                      bg-purple-400/10
                      flex
                      items-center
                      justify-center
                    "
                  >

                    <Pill
                      size={19}
                      className="text-purple-400"
                    />

                  </div>

                  <div>

                    <h3 className="font-semibold">
                      Current inventory
                    </h3>

                    <p className="text-xs text-slate-500 mt-1">
                      How many doses you currently
                      have available.
                    </p>

                  </div>

                </div>


                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                  <div>

                    <label className="block text-sm text-slate-400 mb-2">
                      Current stock
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={
                        form.stock
                      }
                      onChange={(event) =>
                        updateForm(
                          "stock",
                          event.target.value
                        )
                      }
                      placeholder="e.g. 30"
                      className="
                        w-full
                        h-12
                        px-4
                        rounded-xl
                        border
                        border-white/10
                        bg-white/5
                        text-white
                        placeholder:text-slate-600
                        outline-none
                        focus:border-cyan-400/50
                      "
                    />

                  </div>


                  <div>

                    <label className="block text-sm text-slate-400 mb-2">
                      Critical stock threshold
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={
                        form.lowStockAlert
                      }
                      onChange={(event) =>
                        updateForm(
                          "lowStockAlert",
                          event.target.value
                        )
                      }
                      placeholder="3"
                      className="
                        w-full
                        h-12
                        px-4
                        rounded-xl
                        border
                        border-white/10
                        bg-white/5
                        text-white
                        placeholder:text-slate-600
                        outline-none
                        focus:border-cyan-400/50
                      "
                    />

                    <p className="text-xs text-slate-600 mt-2">
                      Default critical threshold
                      is 3 doses.
                    </p>

                  </div>

                </div>

              </div>


              {/* PURPOSE */}

              <div className="mt-5">

                <label className="block text-sm text-slate-400 mb-2">
                  Condition / purpose
                </label>

                <input
                  type="text"
                  value={
                    form.purpose
                  }
                  onChange={(event) =>
                    updateForm(
                      "purpose",
                      event.target.value
                    )
                  }
                  placeholder="e.g. Blood pressure"
                  className="
                    w-full
                    h-12
                    px-4
                    rounded-xl
                    border
                    border-white/10
                    bg-white/5
                    text-white
                    placeholder:text-slate-600
                    outline-none
                    focus:border-cyan-400/50
                  "
                />

              </div>


              {/* STATUS + COLOR */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">

                <div>

                  <label className="block text-sm text-slate-400 mb-2">
                    Status
                  </label>

                  <select
                    value={
                      form.status
                    }
                    onChange={(event) =>
                      updateForm(
                        "status",
                        event.target.value
                      )
                    }
                    className="
                      w-full
                      h-12
                      px-4
                      rounded-xl
                      border
                      border-white/10
                      bg-[#111F32]
                      text-white
                      outline-none
                      focus:border-cyan-400/50
                    "
                  >

                    <option>
                      Active
                    </option>

                    <option>
                      Paused
                    </option>

                    <option>
                      Completed
                    </option>

                  </select>

                </div>


                <div>

                  <label className="block text-sm text-slate-400 mb-2">
                    Accent color
                  </label>

                  <select
                    value={
                      form.accentColor
                    }
                    onChange={(event) =>
                      updateForm(
                        "accentColor",
                        event.target.value
                      )
                    }
                    className="
                      w-full
                      h-12
                      px-4
                      rounded-xl
                      border
                      border-white/10
                      bg-[#111F32]
                      text-white
                      outline-none
                      focus:border-cyan-400/50
                    "
                  >

                    <option>
                      Teal
                    </option>

                    <option>
                      Cyan
                    </option>

                    <option>
                      Purple
                    </option>

                    <option>
                      Orange
                    </option>

                    <option>
                      Green
                    </option>

                    <option>
                      Red
                    </option>

                  </select>

                </div>

              </div>


              {/* NOTES */}

              <div className="mt-5">

                <label className="block text-sm text-slate-400 mb-2">
                  Notes (optional)
                </label>

                <textarea
                  value={
                    form.notes
                  }
                  onChange={(event) =>
                    updateForm(
                      "notes",
                      event.target.value
                    )
                  }
                  placeholder="Special instructions..."
                  rows={3}
                  className="
                    w-full
                    px-4
                    py-3
                    rounded-xl
                    border
                    border-white/10
                    bg-white/5
                    text-white
                    placeholder:text-slate-600
                    outline-none
                    resize-none
                    focus:border-cyan-400/50
                  "
                />

              </div>


              {/* BUTTONS */}

              <div
                className="
                  flex
                  justify-end
                  items-center
                  gap-3
                  mt-7
                  pt-5
                  border-t
                  border-white/10
                "
              >

                <button
                  type="button"
                  onClick={
                    closeModal
                  }
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
                    transition
                  "
                >

                  Cancel

                </button>


                <button
                  type="submit"
                  className="
                    px-7
                    py-3
                    rounded-full
                    bg-cyan-400
                    hover:bg-cyan-300
                    text-[#06111F]
                    font-semibold
                    transition
                  "
                >

                  {editingId
                    ? "Save changes"
                    : "Add medicine"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default Medicines;