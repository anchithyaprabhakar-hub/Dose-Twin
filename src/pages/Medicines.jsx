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

   IMPORTANT:
   There are NO permanent dummy medicines.

   Medicines exist only when the user creates a prescription.
========================================================= */

const defaultMedicines = [];

/* =========================================================
   DATE HELPERS
========================================================= */

function getTodayKey() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(
    today.getMonth() + 1
  ).padStart(2, "0");
  const day = String(
    today.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/* =========================================================
   LOAD MEDICINES
========================================================= */

function loadMedicines() {
  try {
    const stored =
      localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return defaultMedicines;
    }

    const parsed = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return defaultMedicines;
    }

    /*
      Normalize older medicine records so
      old localStorage data does not break
      the new prescription model.
    */

    return parsed.map(
      (medicine) =>
        normalizeMedicine(medicine)
    );
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
   NORMALIZE MEDICINE

   Keeps older localStorage data compatible
   with the new model.
========================================================= */

function normalizeMedicine(
  medicine
) {
  const doseTimes =
    Array.isArray(
      medicine.doseTimes
    )
      ? medicine.doseTimes.filter(
          Boolean
        )
      : medicine.time
      ? [convertDisplayTimeTo24Hour(medicine.time)]
      : [];

  return {
    ...medicine,

    id:
      medicine.id ??
      Date.now(),

    name:
      medicine.name || "",

    dosage:
      medicine.dosage || "",

    form:
      medicine.form || "Tablet",

    doseTimes,

    prescriptionStartDate:
      medicine.prescriptionStartDate ||
      "",

    prescriptionEndDate:
      medicine.prescriptionEndDate ||
      "",

    prescribedQuantity:
      Number(
        medicine.prescribedQuantity
      ) || 0,

    stock:
      Number(medicine.stock) || 0,

    lowStockAlert:
      Number(
        medicine.lowStockAlert
      ) || 3,

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

    /*
      New dose-level tracking.

      Example:

      doseTaken: {
        "2026-08-18": {
          "08:00": true,
          "20:00": false
        }
      }
    */

    doseTaken:
      medicine.doseTaken &&
      typeof medicine.doseTaken ===
        "object"
        ? medicine.doseTaken
        : {},

    /*
      Keep old taken field for
      backwards compatibility,
      but it is no longer the
      source of truth.
    */

    taken:
      Boolean(medicine.taken),
  };
}

/* =========================================================
   CONVERT DISPLAY TIME → 24 HOUR TIME
========================================================= */

function convertDisplayTimeTo24Hour(
  displayTime
) {
  if (!displayTime) {
    return "";
  }

  const match =
    displayTime.match(
      /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i
    );

  if (!match) {
    return "";
  }

  let hour = Number(match[1]);

  const minutes = match[2];

  const period =
    match[3].toUpperCase();

  if (period === "PM" && hour !== 12) {
    hour += 12;
  }

  if (period === "AM" && hour === 12) {
    hour = 0;
  }

  return `${String(hour).padStart(
    2,
    "0"
  )}:${minutes}`;
}

/* =========================================================
   EMPTY FORM
========================================================= */

const emptyForm = {
  name: "",
  dosage: "",
  form: "Tablet",

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
   FORMAT TIME
========================================================= */

function formatTime(time) {
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
}

/* =========================================================
   GET SCHEDULE LABEL

   Actual schedule comes from doseTimes.
========================================================= */

function getSchedule(time) {
  if (!time) {
    return "Not set";
  }

  const hour = Number(
    time.split(":")[0]
  );

  if (hour >= 5 && hour < 12) {
    return "Morning";
  }

  if (hour >= 12 && hour < 17) {
    return "Afternoon";
  }

  if (hour >= 17 && hour < 21) {
    return "Evening";
  }

  return "Night";
}

/* =========================================================
   GET ALL SCHEDULE LABELS
========================================================= */

function getScheduleLabels(
  doseTimes
) {
  const schedules = [
    ...new Set(
      doseTimes
        .filter(Boolean)
        .map((time) =>
          getSchedule(time)
        )
    ),
  ];

  return schedules;
}

/* =========================================================
   GET SCHEDULE TEXT
========================================================= */

function getScheduleText(
  doseTimes
) {
  const schedules =
    getScheduleLabels(doseTimes);

  if (!schedules.length) {
    return "Not set";
  }

  return schedules.join(" + ");
}

/* =========================================================
   GET FREQUENCY FROM DOSE TIMES

   The actual prescription schedule is
   represented by doseTimes.

   frequency is now only a readable summary.
========================================================= */

function getFrequencyFromDoseTimes(
  doseTimes
) {
  const count =
    doseTimes.filter(Boolean).length;

  switch (count) {
    case 0:
      return "Not scheduled";

    case 1:
      return "Once daily";

    case 2:
      return "Twice daily";

    case 3:
      return "Three times daily";

    case 4:
      return "Four times daily";

    default:
      return `${count} times daily`;
  }
}

/* =========================================================
   GET DAILY DOSE COUNT
========================================================= */

function getDailyDoseCount(
  medicine
) {
  const count =
    Array.isArray(
      medicine.doseTimes
    )
      ? medicine.doseTimes.filter(
          Boolean
        ).length
      : 0;

  return count;
}

/* =========================================================
   DAYS BETWEEN DATES
========================================================= */

function getDaysBetween(
  startDate,
  endDate
) {
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
    end.getTime() -
    start.getTime();

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
    end.getTime() -
    today.getTime();

  return Math.max(
    0,
    Math.ceil(
      difference /
        (1000 * 60 * 60 * 24)
    )
  );
}

/* =========================================================
   PRESCRIPTION ACTIVE CHECK
========================================================= */

function isPrescriptionActive(
  medicine
) {
  if (medicine.status !== "Active") {
    return false;
  }

  const today = getTodayKey();

  if (
    medicine.prescriptionStartDate &&
    today <
      medicine.prescriptionStartDate
  ) {
    return false;
  }

  if (
    medicine.prescriptionEndDate &&
    today >
      medicine.prescriptionEndDate
  ) {
    return false;
  }

  return true;
}

/* =========================================================
   DOSE TAKEN CHECK
========================================================= */

function isDoseTaken(
  medicine,
  time,
  dateKey = getTodayKey()
) {
  return Boolean(
    medicine.doseTaken?.[
      dateKey
    ]?.[time]
  );
}

/* =========================================================
   UPDATE DOSE TAKEN STATE
========================================================= */

function updateDoseTakenState(
  medicine,
  time,
  value,
  dateKey = getTodayKey()
) {
  const currentDoseTaken =
    medicine.doseTaken || {};

  const dayState =
    currentDoseTaken[
      dateKey
    ] || {};

  return {
    ...medicine,

    doseTaken: {
      ...currentDoseTaken,

      [dateKey]: {
        ...dayState,

        [time]: value,
      },
    },
  };
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
     OPEN ADD MODAL
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
     OPEN EDIT MODAL
  ======================================================= */

  const openEditModal = (
    medicine
  ) => {
    setEditingId(medicine.id);

    setForm({
      name:
        medicine.name || "",

      dosage:
        medicine.dosage || "",

      form:
        medicine.form || "Tablet",

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
        medicine.status ||
        "Active",

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
      [
        ...new Set(
          form.doseTimes.filter(
            Boolean
          )
        ),
      ].sort();

    if (!validTimes.length) {
      alert(
        "Please add at least one dose time."
      );

      return;
    }

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

    const prescribedQuantity =
      Number(
        form.prescribedQuantity
      ) || 0;

    const stock =
      Number(form.stock) || 0;

    const lowStockAlert =
      Number(
        form.lowStockAlert
      ) || 3;

    const frequency =
      getFrequencyFromDoseTimes(
        validTimes
      );

    const schedule =
      getScheduleText(
        validTimes
      );

    const firstTime =
      validTimes[0] || "";

    /*
      Preserve existing dose history
      when editing the medicine.
    */

    const existingMedicine =
      editingId
        ? medicines.find(
            (medicine) =>
              medicine.id ===
              editingId
          )
        : null;

    const medicineData = {
      name:
        form.name.trim(),

      dosage:
        form.dosage.trim(),

      form:
        form.form,

      /*
        SOURCE OF TRUTH
      */

      doseTimes:
        validTimes,

      /*
        Derived display values
      */

      frequency,

      schedule,

      time:
        formatTime(firstTime),

      /* PRESCRIPTION */

      prescriptionStartDate:
        form.prescriptionStartDate,

      prescriptionEndDate:
        form.prescriptionEndDate,

      prescribedQuantity,

      /* INVENTORY */

      stock,

      lowStockAlert,

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
        Preserve dose history.
      */

      doseTaken:
        existingMedicine?.doseTaken ||
        {},

      /*
        Backwards compatibility only.
      */

      taken:
        existingMedicine
          ? Boolean(
              existingMedicine.taken
            )
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
     DELETE MEDICINE
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
     TOGGLE INDIVIDUAL DOSE
  ======================================================= */

  const toggleDose = (
    medicineId,
    time
  ) => {
    const dateKey =
      getTodayKey();

    const medicine =
      medicines.find(
        (item) =>
          item.id ===
          medicineId
      );

    if (!medicine) {
      return;
    }

    /*
      Do not allow doses outside
      the active prescription.
    */

    if (
      !isPrescriptionActive(
        medicine
      )
    ) {
      return;
    }

    const currentlyTaken =
      isDoseTaken(
        medicine,
        time,
        dateKey
      );

    /*
      Taking a dose:
        stock - 1

      Undoing a dose:
        stock + 1
    */

    if (
      !currentlyTaken &&
      Number(medicine.stock) <= 0
    ) {
      alert(
        `No ${medicine.form?.toLowerCase() || "dose"} remaining for ${medicine.name}.`
      );

      return;
    }

    const updatedMedicines =
      medicines.map(
        (item) => {
          if (
            item.id !==
            medicineId
          ) {
            return item;
          }

          const updated =
            updateDoseTakenState(
              item,
              time,
              !currentlyTaken,
              dateKey
            );

          const currentStock =
            Number(
              item.stock
            ) || 0;

          return {
            ...updated,

            stock:
              currentlyTaken
                ? currentStock + 1
                : Math.max(
                    0,
                    currentStock - 1
                  ),
          };
        }
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
      Prescription not currently active.
    */

    if (
      medicine.status ===
      "Paused"
    ) {
      return {
        type: "paused",
        label: "Prescription paused",
      };
    }

    if (
      medicine.status ===
      "Completed"
    ) {
      return {
        type: "completed",
        label: "Prescription completed",
      };
    }

    if (
      medicine.prescriptionEndDate
    ) {
      const daysRemaining =
        getPrescriptionDaysRemaining(
          medicine.prescriptionEndDate
        );

      if (
        daysRemaining === 0
      ) {
        return {
          type: "completed",
          label: "Prescription ended",
        };
      }
    }

    /*
      No stock.
    */

    if (stock <= 0) {
      return {
        type: "critical",
        label: "No stock remaining",
      };
    }

    /*
      User-defined threshold.
    */

    if (
      stock <= lowStock
    ) {
      return {
        type: "critical",
        label: "Critical stock",
      };
    }

    /*
      No prescription quantity/date.
    */

    if (
      !medicine.prescriptionEndDate ||
      !medicine.prescribedQuantity
    ) {
      return {
        type: "good",
        label: "Stock sufficient",
      };
    }

    const daysRemaining =
      getPrescriptionDaysRemaining(
        medicine.prescriptionEndDate
      );

    if (
      daysRemaining === null
    ) {
      return {
        type: "good",
        label: "Stock sufficient",
      };
    }

    const dailyDose =
      getDailyDoseCount(
        medicine
      );

    if (
      dailyDose <= 0
    ) {
      return {
        type: "good",
        label: "Stock sufficient",
      };
    }

    /*
      Include today in the
      remaining requirement.
    */

    const expectedRequired =
      Math.ceil(
        dailyDose *
          Math.max(
            1,
            daysRemaining
          )
      );

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
     TODAY'S DOSE COUNT
  ======================================================= */

  const getTodayDoseCount =
    (medicine) => {
      if (
        !isPrescriptionActive(
          medicine
        )
      ) {
        return 0;
      }

      return getDailyDoseCount(
        medicine
      );
    };

  /* =======================================================
     TODAY'S TAKEN DOSE COUNT
  ======================================================= */

  const getTodayTakenDoseCount =
    (medicine) => {
      if (
        !isPrescriptionActive(
          medicine
        )
      ) {
        return 0;
      }

      const today =
        getTodayKey();

      return (
        medicine.doseTimes?.filter(
          (time) =>
            medicine.doseTaken?.[
              today
            ]?.[time]
        ).length || 0
      );
    };

  /* =======================================================
     TODAY'S REMAINING DOSE COUNT
  ======================================================= */

  const getTodayRemainingDoseCount =
    (medicine) => {
      const scheduled =
        getTodayDoseCount(
          medicine
        );

      const taken =
        getTodayTakenDoseCount(
          medicine
        );

      return Math.max(
        0,
        scheduled - taken
      );
    };

  /* =======================================================
     STATISTICS
  ======================================================= */

  const totalMedicines =
    medicines.length;

  const totalScheduledDosesToday =
    medicines.reduce(
      (
        total,
        medicine
      ) =>
        total +
        getTodayDoseCount(
          medicine
        ),
      0
    );

  const takenToday =
    medicines.reduce(
      (
        total,
        medicine
      ) =>
        total +
        getTodayTakenDoseCount(
          medicine
        ),
      0
    );

  const remaining =
    Math.max(
      0,
      totalScheduledDosesToday -
        takenToday
    );

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

  const adherence =
    totalScheduledDosesToday === 0
      ? 0
      : Math.round(
          (takenToday /
            totalScheduledDosesToday) *
            100
        );

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
                Manage your prescriptions,
                schedules, inventory, and
                medication adherence.
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

          {/* TOTAL MEDICINES */}

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
              Active medicines
            </p>

            <h2 className="text-5xl font-bold mt-3">
              {
                medicines.filter(
                  (medicine) =>
                    isPrescriptionActive(
                      medicine
                    )
                ).length
              }
            </h2>

          </div>


          {/* SCHEDULED DOSES */}

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
              Scheduled doses
            </p>

            <h2 className="text-5xl font-bold mt-3">
              {
                totalScheduledDosesToday
              }
            </h2>

            <p className="text-xs text-slate-600 mt-2">
              Today
            </p>

          </div>


          {/* TAKEN */}

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
              Doses taken
            </p>

            <h2 className="text-5xl font-bold mt-3 text-emerald-400">
              {takenToday}
            </h2>

            <p className="text-xs text-slate-600 mt-2">
              Today
            </p>

          </div>


          {/* REMAINING */}

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
              Doses remaining
            </p>

            <h2 className="text-5xl font-bold mt-3 text-orange-400">
              {remaining}
            </h2>

            <p className="text-xs text-slate-600 mt-2">
              Today
            </p>

          </div>


          {/* STOCK ALERT */}

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
              Stock alerts
            </p>

            <h2 className="text-5xl font-bold mt-3 text-red-400">
              {
                criticalCount +
                attentionCount
              }
            </h2>

          </div>

        </section>


        {/* =================================================
            ADHERENCE SUMMARY
        ================================================= */}

        {totalScheduledDosesToday >
          0 && (

          <section
            className="
              rounded-2xl
              border
              border-cyan-400/20
              bg-cyan-400/[0.03]
              p-6
              mb-10
            "
          >

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

              <div>

                <p className="text-sm text-slate-400">
                  Today's adherence
                </p>

                <h2 className="text-3xl font-bold mt-1">
                  {adherence}%
                </h2>

              </div>

              <div className="flex-1 max-w-2xl">

                <div className="h-3 bg-slate-700/60 rounded-full overflow-hidden">

                  <div
                    className="
                      h-full
                      bg-cyan-400
                      rounded-full
                      transition-all
                      duration-500
                    "
                    style={{
                      width: `${adherence}%`,
                    }}
                  />

                </div>

                <p className="text-xs text-slate-500 mt-2">
                  {takenToday} of{" "}
                  {
                    totalScheduledDosesToday
                  }{" "}
                  scheduled doses completed
                </p>

              </div>

            </div>

          </section>

        )}


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
                Current prescriptions and
                medication schedules
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
                className="
                  mx-auto
                  text-slate-600
                  mb-4
                "
              />

              <h3 className="text-xl font-semibold">
                No active prescriptions
              </h3>

              <p className="text-slate-500 mt-2 mb-6">
                Add a prescription to
                generate your medication
                schedule.
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

                  /*
                    Inventory progress is based
                    on the originally prescribed
                    quantity.
                  */

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

                  const schedule =
                    getScheduleText(
                      medicine.doseTimes ||
                        []
                    );

                  const frequency =
                    getFrequencyFromDoseTimes(
                      medicine.doseTimes ||
                        []
                    );

                  const active =
                    isPrescriptionActive(
                      medicine
                    );

                  return (
                    <div
                      key={
                        medicine.id
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
                              {
                                medicine.name
                              }
                            </h3>

                            <p className="text-sm text-slate-500 mt-1">
                              {
                                medicine.dosage
                              }
                              {" · "}
                              {
                                medicine.form ||
                                "Tablet"
                              }
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
                            title="Edit prescription"
                          >

                            <Edit3
                              size={17}
                            />

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
                            title="Delete prescription"
                          >

                            <Trash2
                              size={17}
                            />

                          </button>

                        </div>

                      </div>


                      {/* STATUS */}

                      {!active && (

                        <div
                          className="
                            mt-5
                            rounded-xl
                            border
                            border-orange-400/20
                            bg-orange-400/5
                            px-4
                            py-3
                            text-sm
                            text-orange-400
                          "
                        >

                          {
                            status.label
                          }

                        </div>

                      )}


                      {/* DETAILS */}

                      <div
                        className="
                          grid
                          grid-cols-1
                          sm:grid-cols-2
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
                              {schedule}
                            </span>

                          </div>

                        </div>


                        <div>

                          <p className="text-xs text-slate-500 uppercase tracking-wide">
                            Frequency
                          </p>

                          <p className="text-slate-300 mt-2">
                            {frequency}
                          </p>

                        </div>

                      </div>


                      {/* INDIVIDUAL DOSE SCHEDULE */}

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

                        <div className="flex items-center justify-between mb-4">

                          <div className="flex items-center gap-2">

                            <Clock3
                              size={17}
                              className="text-cyan-400"
                            />

                            <p className="text-sm font-medium">
                              Today's doses
                            </p>

                          </div>

                          <span className="text-xs text-slate-500">
                            {
                              getTodayTakenDoseCount(
                                medicine
                              )
                            }
                            /
                            {
                              getTodayDoseCount(
                                medicine
                              )
                          }{" "}
                            taken
                          </span>

                        </div>


                        <div className="space-y-2">

                          {(
                            medicine.doseTimes ||
                            []
                          ).map(
                            (time) => {

                              const taken =
                                isDoseTaken(
                                  medicine,
                                  time
                                );

                              return (
                                <button
                                  key={time}
                                  type="button"
                                  disabled={
                                    !active
                                  }
                                  onClick={() =>
                                    toggleDose(
                                      medicine.id,
                                      time
                                    )
                                  }
                                  className={`
                                    w-full
                                    flex
                                    items-center
                                    justify-between
                                    gap-3
                                    rounded-lg
                                    px-3
                                    py-3
                                    transition
                                    ${
                                      taken
                                        ? "bg-emerald-400/10 border border-emerald-400/20"
                                        : "bg-white/5 border border-white/5 hover:bg-white/10"
                                    }
                                    ${
                                      !active
                                        ? "opacity-50 cursor-not-allowed"
                                        : "cursor-pointer"
                                    }
                                  `}
                                >

                                  <div className="flex items-center gap-3">

                                    {taken ? (
                                      <CheckCircle2
                                        size={
                                          17
                                        }
                                        className="text-emerald-400"
                                      />
                                    ) : (
                                      <Clock3
                                        size={
                                          17
                                        }
                                        className="text-orange-400"
                                      />
                                    )}

                                    <div className="text-left">

                                      <p className="text-sm text-slate-200">
                                        {
                                          formatTime(
                                            time
                                          )
                                        }
                                      </p>

                                      <p className="text-xs text-slate-500">
                                        {
                                          getSchedule(
                                            time
                                          )
                                        }
                                      </p>

                                    </div>

                                  </div>


                                  <span
                                    className={
                                      taken
                                        ? "text-xs text-emerald-400"
                                        : "text-xs text-orange-400"
                                    }
                                  >
                                    {taken
                                      ? "Taken"
                                      : "Upcoming"}
                                  </span>

                                </button>
                              );
                            }
                          )}

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
                              {
                                medicine.prescriptionStartDate ||
                                "Not set"
                              }
                            </p>

                          </div>


                          <div>

                            <p className="text-xs text-slate-500">
                              End
                            </p>

                            <p className="text-sm text-slate-300 mt-1">
                              {
                                medicine.prescriptionEndDate ||
                                "Not set"
                              }
                            </p>

                          </div>


                          <div>

                            <p className="text-xs text-slate-500">
                              Prescribed
                            </p>

                            <p className="text-sm text-slate-300 mt-1">
                              {prescribedQuantity
                                ? `${prescribedQuantity} ${
                                    medicine.form ===
                                    "Liquid"
                                      ? "units"
                                      : "doses"
                                  }`
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
                                  : status.type ===
                                    "paused"
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

                              {
                                status.label
                              }

                              {stock >
                                0 &&
                                ` — only ${stock} remaining`}

                            </div>

                          )}


                          {status.type ===
                            "attention" && (

                            <div className="flex items-center gap-2 text-orange-400 text-sm">

                              <AlertTriangle
                                size={15}
                              />

                              {
                                status.label
                              }

                            </div>

                          )}


                          {status.type ===
                            "good" && (

                            <div className="flex items-center gap-2 text-emerald-400 text-sm">

                              <CheckCircle2
                                size={15}
                              />

                              {
                                status.label
                              }

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


                          {status.type ===
                            "paused" && (

                            <div className="flex items-center gap-2 text-slate-400 text-sm">

                              <Clock3
                                size={15}
                              />

                              Prescription paused

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
                          flex-col
                          sm:flex-row
                          sm:items-center
                          sm:justify-between
                          gap-3
                        "
                      >

                        <span className="text-sm text-slate-400">

                          {
                            getTodayRemainingDoseCount(
                              medicine
                            )
                          }{" "}
                          dose
                          {
                            getTodayRemainingDoseCount(
                              medicine
                            ) === 1
                              ? ""
                              : "s"
                          }{" "}
                          remaining today

                        </span>


                        <span className="text-xs text-slate-600">

                          Tap a dose above to
                          mark it taken

                        </span>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          )}

        </section>


        {/* =================================================
            LIVE SYNC
        ================================================= */}

        {medicines.length > 0 && (

          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-600">

            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />

            Medication state automatically
            synchronized

          </div>

        )}

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
                    ? "Edit Prescription"
                    : "Add Prescription"}
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Define the current medication
                  prescription.
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
                    placeholder="e.g. Paracetamol"
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


              {/* FORM */}

              <div className="mt-5">

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


              {/* DOSE TIMES */}

              <div className="mt-5">

                <label className="block text-sm text-slate-400 mb-2">
                  Dose times
                </label>

                <p className="text-xs text-slate-600 mb-3">
                  These times define the actual
                  prescription schedule.
                </p>

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

                        <span className="hidden sm:block min-w-[85px] text-xs text-slate-500">
                          {
                            time
                              ? getSchedule(
                                  time
                                )
                              : "Schedule"
                          }
                        </span>

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

                  Add dose time

                </button>


                {/* LIVE SCHEDULE PREVIEW */}

                {form.doseTimes.some(
                  Boolean
                ) && (

                  <div
                    className="
                      mt-4
                      rounded-xl
                      border
                      border-cyan-400/10
                      bg-cyan-400/[0.03]
                      p-4
                    "
                  >

                    <p className="text-xs text-slate-500 uppercase tracking-wide">
                      Generated schedule
                    </p>

                    <p className="text-sm text-cyan-400 mt-2">
                      {
                        getScheduleText(
                          form.doseTimes
                        )
                      }
                    </p>

                    <p className="text-xs text-slate-500 mt-1">
                      {
                        getFrequencyFromDoseTimes(
                          form.doseTimes
                        )
                      }
                    </p>

                  </div>

                )}

              </div>


              {/* =================================================
                  PRESCRIPTION
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
                      Prescription period
                    </h3>

                    <p className="text-xs text-slate-500 mt-1">
                      Defines when this medication
                      should be active.
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


                {/* QUANTITY */}

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
                      Current available medication
                      quantity.
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
                  placeholder="e.g. Fever / pain relief"
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
                  Notes / instructions
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
                  placeholder="e.g. Take after breakfast"
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
                    : "Add prescription"}

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