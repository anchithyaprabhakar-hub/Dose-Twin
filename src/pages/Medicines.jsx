import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Edit3,
  Pill,
  Plus,
  Trash2,
  X,
} from "lucide-react";

/*
============================================================
DoseTwin - Medicines
============================================================

This page is responsible for:

1. Loading medicines/prescriptions from localStorage
2. Normalising old prescription formats
3. Displaying medicine information
4. Managing prescription schedules
5. Tracking today's doses
6. Marking doses as taken / undo
7. Updating stock
8. Showing medication statistics
9. Showing medication overview
10. Adding medicines
11. Editing medicines
12. Deleting medicines
13. Synchronising medicine state
============================================================
*/

const MEDICINES_KEY = "dosetwin_medicines";

const PRESCRIPTION_KEYS = [
  "dosetwin_prescriptions",
  "dosetwin_prescription",
  "doseTwin_prescriptions",
];

const MEDICINE_EVENT = "dosetwin-medicines-updated";

/* =========================================================
   DATE HELPERS
========================================================= */

function todayKey() {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseDateToISO(value) {
  if (!value) return "";

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return `${value.getFullYear()}-${String(
      value.getMonth() + 1
    ).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
  }

  const raw = String(value).trim();

  if (!raw) return "";

  // ISO
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return raw;
  }

  /*
    Supports:

    03/08/2026
    3/8/2026
    03/08/26
    3/8/26
  */
  const slashMatch = raw.match(
    /^(\d{1,2})[/-](\d{1,2})[/-](\d{2}|\d{4})$/
  );

  if (slashMatch) {
    let day = Number(slashMatch[1]);
    let month = Number(slashMatch[2]);
    let year = Number(slashMatch[3]);

    if (year < 100) {
      year += 2000;
    }

    if (
      day >= 1 &&
      day <= 31 &&
      month >= 1 &&
      month <= 12 &&
      year >= 2000 &&
      year <= 2100
    ) {
      return `${year}-${String(month).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}`;
    }
  }

  /*
    Handles strings such as:

    Aug 3, 2026
    August 3 2026
    2026/08/03
  */
  const parsed = new Date(raw);

  if (!Number.isNaN(parsed.getTime())) {
    return `${parsed.getFullYear()}-${String(
      parsed.getMonth() + 1
    ).padStart(2, "0")}-${String(parsed.getDate()).padStart(2, "0")}`;
  }

  return "";
}

function formatDate(value) {
  const iso = parseDateToISO(value);

  if (!iso) return "Not set";

  const [year, month, day] = iso.split("-");

  return `${day}/${month}/${year}`;
}

function daysRemaining(endDate) {
  const endISO = parseDateToISO(endDate);

  if (!endISO) return null;

  const today = new Date(`${todayKey()}T00:00:00`);
  const end = new Date(`${endISO}T00:00:00`);

  if (Number.isNaN(end.getTime())) return null;

  return Math.max(
    0,
    Math.ceil((end.getTime() - today.getTime()) / 86400000)
  );
}

/* =========================================================
   TIME HELPERS
========================================================= */

function convertDisplayTimeTo24Hour(value) {
  if (!value) return "";

  const raw = String(value).trim();

  // Already 24-hour format
  if (/^\d{2}:\d{2}$/.test(raw)) {
    return raw;
  }

  const match = raw.match(
    /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i
  );

  if (!match) return "";

  let hour = Number(match[1]);
  const minutes = match[2];
  const period = match[3].toUpperCase();

  if (hour < 1 || hour > 12) return "";

  if (period === "PM" && hour !== 12) {
    hour += 12;
  }

  if (period === "AM" && hour === 12) {
    hour = 0;
  }

  return `${String(hour).padStart(2, "0")}:${minutes}`;
}

function formatTime(time) {
  if (!time) return "";

  const match = String(time).match(
    /^(\d{1,2}):(\d{2})/
  );

  if (!match) return String(time);

  let hour = Number(match[1]);
  const minutes = match[2];

  const period = hour >= 12 ? "PM" : "AM";

  hour = hour % 12 || 12;

  return `${hour}:${minutes} ${period}`;
}

function getSchedule(time) {
  if (!time) return "Not set";

  const hour = Number(String(time).split(":")[0]);

  if (hour >= 5 && hour < 12) return "Morning";
  if (hour >= 12 && hour < 17) return "Afternoon";
  if (hour >= 17 && hour < 21) return "Evening";

  return "Night";
}

function getScheduleText(times = []) {
  const labels = [
    ...new Set(
      times
        .filter(Boolean)
        .map((time) => getSchedule(time))
    ),
  ];

  return labels.length
    ? labels.join(" + ")
    : "Not set";
}

function getFrequency(times = []) {
  const count = times.filter(Boolean).length;

  if (count === 0) return "Not scheduled";
  if (count === 1) return "Once daily";
  if (count === 2) return "Twice daily";
  if (count === 3) return "Three times daily";
  if (count === 4) return "Four times daily";

  return `${count} times daily`;
}

/* =========================================================
   DOSE TIME INFERENCE
========================================================= */

function inferDoseTimes(medicine) {
  const possibleArrays = [
    medicine?.doseTimes,
    medicine?.times,
    medicine?.scheduleTimes,
  ];

  for (const values of possibleArrays) {
    if (!Array.isArray(values)) continue;

    const converted = values
      .map(convertDisplayTimeTo24Hour)
      .filter(Boolean);

    if (converted.length) {
      return [...new Set(converted)].sort();
    }
  }

  if (medicine?.time) {
    const converted = convertDisplayTimeTo24Hour(
      medicine.time
    );

    if (converted) {
      return [converted];
    }
  }

  const frequency = String(
    medicine?.frequency || ""
  ).toLowerCase();

  const schedule = String(
    medicine?.schedule || ""
  ).toLowerCase();

  /*
    Four times daily
  */
  if (
    frequency.includes("four") ||
    frequency.includes("4") ||
    (
      schedule.includes("morning") &&
      schedule.includes("afternoon") &&
      schedule.includes("evening") &&
      schedule.includes("night")
    )
  ) {
    return [
      "08:00",
      "12:00",
      "18:00",
      "22:00",
    ];
  }

  /*
    Three times daily
  */
  if (
    frequency.includes("three") ||
    frequency.includes("3") ||
    (
      schedule.includes("morning") &&
      schedule.includes("afternoon") &&
      schedule.includes("evening")
    )
  ) {
    return [
      "08:00",
      "14:00",
      "20:00",
    ];
  }

  /*
    Twice daily
  */
  if (
    frequency.includes("twice") ||
    frequency.includes("2") ||
    (
      schedule.includes("morning") &&
      schedule.includes("evening")
    )
  ) {
    return [
      "08:00",
      "20:00",
    ];
  }

  /*
    Once daily

    If the prescription says once/daily but doesn't
    contain an actual time, use 08:00 as the default.
  */
  if (
    frequency.includes("once") ||
    frequency.includes("daily")
  ) {
    return ["08:00"];
  }

  /*
    If there is a schedule but no actual time, infer morning.
  */
  if (schedule.includes("morning")) {
    return ["08:00"];
  }

  return [];
}

/* =========================================================
   STORAGE
========================================================= */

function readArrayFromStorage(key) {
  try {
    const value = localStorage.getItem(key);

    if (!value) return [];

    const parsed = JSON.parse(value);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveMedicines(medicines) {
  localStorage.setItem(
    MEDICINES_KEY,
    JSON.stringify(medicines)
  );

  window.dispatchEvent(
    new Event(MEDICINE_EVENT)
  );
}

/* =========================================================
   NORMALISATION
========================================================= */

function normalizeDoseHistory(value) {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return {};
  }

  return value;
}

function normalizeMedicine(medicine, index = 0) {
  const source = medicine || {};

  const doseTimes = inferDoseTimes(source);

  const name = String(
    source.name ??
      source.medicineName ??
      source.drugName ??
      ""
  ).trim();

  const dosage = String(
    source.dosage ??
      source.strength ??
      source.dose ??
      ""
  ).trim();

  const form =
    source.form ||
    source.type ||
    source.dosageForm ||
    "Tablet";

  const prescribedQuantity =
    Number(
      source.prescribedQuantity ??
        source.quantity ??
        source.prescribed ??
        source.totalQuantity ??
        0
    ) || 0;

  let stock =
    Number(
      source.stock ??
        source.currentStock ??
        source.remainingStock ??
        source.stockRemaining ??
        0
    ) || 0;

  /*
    If a prescription has a quantity but no explicit stock,
    start stock at the prescribed quantity.
  */
  if (
    stock === 0 &&
    prescribedQuantity > 0 &&
    source.stock === undefined &&
    source.currentStock === undefined &&
    source.remainingStock === undefined &&
    source.stockRemaining === undefined
  ) {
    stock = prescribedQuantity;
  }

  const lowStockAlert =
    Number(
      source.lowStockAlert ??
        source.lowStockThreshold ??
        3
    ) || 3;

  const startDate = parseDateToISO(
    source.prescriptionStartDate ??
      source.startDate ??
      source.prescriptionDate ??
      source.start ??
      ""
  );

  const endDate = parseDateToISO(
    source.prescriptionEndDate ??
      source.endDate ??
      source.end ??
      ""
  );

  return {
    ...source,

    id:
      source.id ??
      source._id ??
      `medicine-${index}-${Date.now()}`,

    name,
    dosage,
    form,

    doseTimes,

    frequency: getFrequency(doseTimes),
    schedule: getScheduleText(doseTimes),
    time: doseTimes[0]
      ? formatTime(doseTimes[0])
      : "",

    prescriptionStartDate:
      startDate || todayKey(),

    prescriptionEndDate: endDate,

    prescribedQuantity,
    stock,
    lowStockAlert,

    purpose:
      source.purpose ??
      source.condition ??
      source.indication ??
      "",

    status:
      source.status ||
      "Active",

    accentColor:
      source.accentColor ||
      "Cyan",

    notes:
      source.notes ??
      source.instructions ??
      "",

    instructions:
      source.instructions ??
      source.notes ??
      "",

    doseTaken:
      normalizeDoseHistory(
        source.doseTaken
      ),

    taken:
      Boolean(source.taken),
  };
}

/* =========================================================
   SMART MERGING
========================================================= */

function medicineKey(medicine) {
  const name = String(
    medicine.name || ""
  )
    .trim()
    .toLowerCase();

  const dosage = String(
    medicine.dosage || ""
  )
    .trim()
    .toLowerCase();

  return `${name}|${dosage}`;
}

function dataRichness(medicine) {
  let score = 0;

  if (medicine.name) score += 2;
  if (medicine.dosage) score += 2;
  if (medicine.form) score += 1;
  if (medicine.purpose) score += 1;
  if (medicine.prescriptionStartDate) score += 2;
  if (medicine.prescriptionEndDate) score += 2;
  if (medicine.prescribedQuantity) score += 2;
  if (medicine.stock) score += 2;
  if (medicine.doseTimes?.length) {
    score += medicine.doseTimes.length * 2;
  }
  if (medicine.notes) score += 1;

  return score;
}

function mergeMedicineRecords(records) {
  const map = new Map();

  records.forEach((record, index) => {
    const normalized =
      normalizeMedicine(record, index);

    if (!normalized.name) return;

    const key = medicineKey(normalized);

    if (!map.has(key)) {
      map.set(key, normalized);
      return;
    }

    const existing = map.get(key);

    const richer =
      dataRichness(normalized) >
      dataRichness(existing)
        ? normalized
        : existing;

    const mergedDoseTimes = [
      ...new Set([
        ...(existing.doseTimes || []),
        ...(normalized.doseTimes || []),
      ]),
    ]
      .map(convertDisplayTimeTo24Hour)
      .filter(Boolean)
      .sort();

    const mergedHistory = {
      ...(existing.doseTaken || {}),
      ...(normalized.doseTaken || {}),
    };

    map.set(key, {
      ...existing,
      ...richer,

      /*
        Always preserve the union of known dose times.
      */
      doseTimes:
        mergedDoseTimes.length
          ? mergedDoseTimes
          : richer.doseTimes || [],

      frequency: getFrequency(
        mergedDoseTimes.length
          ? mergedDoseTimes
          : richer.doseTimes || []
      ),

      schedule: getScheduleText(
        mergedDoseTimes.length
          ? mergedDoseTimes
          : richer.doseTimes || []
      ),

      time:
        mergedDoseTimes[0]
          ? formatTime(mergedDoseTimes[0])
          : richer.time || "",

      doseTaken: mergedHistory,
    });
  });

  return [...map.values()];
}

function loadMedicines() {
  const records = [
    ...readArrayFromStorage(
      MEDICINES_KEY
    ),
    ...PRESCRIPTION_KEYS.flatMap(
      readArrayFromStorage
    ),
  ];

  return mergeMedicineRecords(records);
}

/* =========================================================
   PRESCRIPTION STATE
========================================================= */

function isPrescriptionActive(medicine) {
  const status = String(
    medicine.status || "Active"
  ).toLowerCase();

  if (
    status === "paused" ||
    status === "completed"
  ) {
    return false;
  }

  const today = todayKey();

  const start = parseDateToISO(
    medicine.prescriptionStartDate
  );

  const end = parseDateToISO(
    medicine.prescriptionEndDate
  );

  if (start && today < start) {
    return false;
  }

  if (end && today > end) {
    return false;
  }

  return true;
}

/* =========================================================
   DOSE TRACKING
========================================================= */

function isDoseTaken(
  medicine,
  time,
  date = todayKey()
) {
  return Boolean(
    medicine.doseTaken?.[date]?.[time]
  );
}

function getDoseStatus(
  medicine,
  time
) {
  if (
    isDoseTaken(
      medicine,
      time
    )
  ) {
    return "Taken";
  }

  if (
    !isPrescriptionActive(
      medicine
    )
  ) {
    return "Unavailable";
  }

  const now = new Date();

  const [hours, minutes] =
    time.split(":").map(Number);

  const scheduled = new Date();

  scheduled.setHours(
    hours,
    minutes,
    0,
    0
  );

  const difference =
    scheduled.getTime() -
    now.getTime();

  const thirtyMinutes =
    30 * 60 * 1000;

  if (
    Math.abs(difference) <=
    thirtyMinutes
  ) {
    return "Due now";
  }

  if (
    difference <
    -thirtyMinutes
  ) {
    return "Missed";
  }

  return "Upcoming";
}

function updateDoseHistory(
  medicine,
  time,
  taken
) {
  const date = todayKey();

  const history =
    medicine.doseTaken || {};

  const day =
    history[date] || {};

  return {
    ...medicine,

    doseTaken: {
      ...history,

      [date]: {
        ...day,
        [time]: taken,
      },
    },
  };
}

function getTodayScheduledCount(
  medicine
) {
  if (
    !isPrescriptionActive(
      medicine
    )
  ) {
    return 0;
  }

  return medicine.doseTimes.length;
}

function getTodayTakenCount(
  medicine
) {
  if (
    !isPrescriptionActive(
      medicine
    )
  ) {
    return 0;
  }

  return medicine.doseTimes.filter(
    (time) =>
      isDoseTaken(
        medicine,
        time
      )
  ).length;
}

/* =========================================================
   MEDICINE STATUS
========================================================= */

function getStatus(medicine) {
  const stock =
    Number(medicine.stock) || 0;

  const threshold =
    Number(
      medicine.lowStockAlert
    ) || 3;

  const status =
    String(
      medicine.status || "Active"
    ).toLowerCase();

  if (status === "paused") {
    return {
      type: "paused",
      label: "Prescription paused",
    };
  }

  if (status === "completed") {
    return {
      type: "completed",
      label: "Prescription completed",
    };
  }

  const start = parseDateToISO(
    medicine.prescriptionStartDate
  );

  const end = parseDateToISO(
    medicine.prescriptionEndDate
  );

  const today = todayKey();

  if (
    start &&
    today < start
  ) {
    return {
      type: "future",
      label: "Prescription starts later",
    };
  }

  if (
    end &&
    today > end
  ) {
    return {
      type: "completed",
      label: "Prescription ended",
    };
  }

  if (stock <= 0) {
    return {
      type: "critical",
      label: "No stock remaining",
    };
  }

  if (stock <= threshold) {
    return {
      type: "critical",
      label: "Critical stock",
    };
  }

  /*
    Check whether current stock is enough
    to cover the remaining prescription.
  */
  if (
    end &&
    medicine.prescribedQuantity &&
    medicine.doseTimes.length
  ) {
    const remainingDays =
      daysRemaining(end);

    if (
      remainingDays !== null
    ) {
      const required =
        medicine.doseTimes.length *
        Math.max(
          1,
          remainingDays
        );

      if (
        stock < required
      ) {
        return {
          type: "attention",
          label:
            "Insufficient stock for prescription",
        };
      }
    }
  }

  return {
    type: "good",
    label: "Stock sufficient",
  };
}

/* =========================================================
   FORM
========================================================= */

function createEmptyForm() {
  return {
    name: "",
    dosage: "",
    form: "Tablet",

    /*
      Give the user one usable default dose time.
      They can change it.
    */
    doseTimes: ["08:00"],

    prescriptionStartDate:
      todayKey(),

    prescriptionEndDate: "",

    prescribedQuantity: "",

    stock: "",

    lowStockAlert: "3",

    purpose: "",

    status: "Active",

    accentColor: "Cyan",

    notes: "",
  };
}

/* =========================================================
   INPUT COMPONENT
========================================================= */

function Input({
  label,
  ...props
}) {
  return (
    <div>
      <label className="block text-sm text-slate-400 mb-2">
        {label}
      </label>

      <input
        {...props}
        className={`w-full h-12 px-4 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-slate-600 outline-none focus:border-cyan-400/50 ${props.className || ""}`}
      />
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

function Medicines() {
  const [
    medicines,
    setMedicines,
  ] = useState(loadMedicines);

  const [
    showModal,
    setShowModal,
  ] = useState(false);

  const [
    editingId,
    setEditingId,
  ] = useState(null);

  const [
    form,
    setForm,
  ] = useState(createEmptyForm);

  /*
    Tick every 30 seconds so Upcoming/Due now/Missed
    updates automatically.
  */
  const [
    clockTick,
    setClockTick,
  ] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setClockTick(
        (value) => value + 1
      );
    }, 30000);

    return () =>
      clearInterval(timer);
  }, []);

  /*
    Refresh when another tab/component changes medicines.
  */
  useEffect(() => {
    const refresh = () => {
      setMedicines(
        loadMedicines()
      );
    };

    window.addEventListener(
      "storage",
      refresh
    );

    window.addEventListener(
      MEDICINE_EVENT,
      refresh
    );

    return () => {
      window.removeEventListener(
        "storage",
        refresh
      );

      window.removeEventListener(
        MEDICINE_EVENT,
        refresh
      );
    };
  }, []);

  /*
    Prevent unused variable optimisation from removing
    the clock dependency from this component's render.
  */
  void clockTick;

  /* =======================================================
     FORM HELPERS
  ======================================================= */

  const updateForm = (
    field,
    value
  ) => {
    setForm(
      (current) => ({
        ...current,
        [field]: value,
      })
    );
  };

  const openAddModal = () => {
    setEditingId(null);
    setForm(
      createEmptyForm()
    );
    setShowModal(true);
  };

  const openEditModal = (
    medicine
  ) => {
    setEditingId(
      medicine.id
    );

    setForm({
      name:
        medicine.name || "",

      dosage:
        medicine.dosage || "",

      form:
        medicine.form ||
        "Tablet",

      doseTimes:
        medicine.doseTimes
          ?.length
          ? medicine.doseTimes
          : ["08:00"],

      prescriptionStartDate:
        parseDateToISO(
          medicine.prescriptionStartDate
        ) || todayKey(),

      prescriptionEndDate:
        parseDateToISO(
          medicine.prescriptionEndDate
        ) || "",

      prescribedQuantity:
        medicine.prescribedQuantity >
        0
          ? String(
              medicine.prescribedQuantity
            )
          : "",

      stock:
        medicine.stock !==
          undefined
          ? String(
              medicine.stock
            )
          : "",

      lowStockAlert:
        String(
          medicine.lowStockAlert ??
            3
        ),

      purpose:
        medicine.purpose ||
        "",

      status:
        medicine.status ||
        "Active",

      accentColor:
        medicine.accentColor ||
        "Cyan",

      notes:
        medicine.notes ||
        "",
    });

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm(
      createEmptyForm()
    );
  };

  const addTimeSlot = () => {
    setForm(
      (current) => ({
        ...current,
        doseTimes: [
          ...current.doseTimes,
          "08:00",
        ],
      })
    );
  };

  const removeTimeSlot = (
    index
  ) => {
    setForm(
      (current) => {
        const next =
          current.doseTimes.filter(
            (_, i) =>
              i !== index
          );

        return {
          ...current,
          doseTimes:
            next.length
              ? next
              : ["08:00"],
        };
      }
    );
  };

  const updateTimeSlot = (
    index,
    value
  ) => {
    setForm(
      (current) => {
        const next = [
          ...current.doseTimes,
        ];

        next[index] =
          value;

        return {
          ...current,
          doseTimes: next,
        };
      }
    );
  };

  /* =======================================================
     ADD / EDIT MEDICINE
  ======================================================= */

  const handleSubmit = (
    event
  ) => {
    event.preventDefault();

    const name =
      form.name.trim();

    const dosage =
      form.dosage.trim();

    if (!name) {
      alert(
        "Please enter a medicine name."
      );
      return;
    }

    if (!dosage) {
      alert(
        "Please enter the dosage."
      );
      return;
    }

    const validTimes = [
      ...new Set(
        form.doseTimes
          .map(
            convertDisplayTimeTo24Hour
          )
          .filter(Boolean)
      ),
    ].sort();

    /*
      There should always be at least one dose time.
    */
    const finalTimes =
      validTimes.length
        ? validTimes
        : ["08:00"];

    const startDate =
      parseDateToISO(
        form.prescriptionStartDate
      ) || todayKey();

    const endDate =
      parseDateToISO(
        form.prescriptionEndDate
      );

    if (
      startDate &&
      endDate &&
      endDate < startDate
    ) {
      alert(
        "Prescription end date cannot be before the start date."
      );
      return;
    }

    const prescribedQuantity =
      Math.max(
        0,
        Number(
          form.prescribedQuantity
        ) || 0
      );

    /*
      If stock is left empty but prescribed quantity
      exists, initialise stock to the prescribed quantity.
    */
    const stock =
      form.stock === "" ||
      form.stock === null
        ? prescribedQuantity
        : Math.max(
            0,
            Number(form.stock) || 0
          );

    const lowStockAlert =
      Math.max(
        0,
        Number(
          form.lowStockAlert
        ) || 3
      );

    const existing =
      editingId
        ? medicines.find(
            (medicine) =>
              medicine.id ===
              editingId
          )
        : null;

    const medicineData = {
      name,

      dosage,

      form:
        form.form ||
        "Tablet",

      doseTimes:
        finalTimes,

      frequency:
        getFrequency(
          finalTimes
        ),

      schedule:
        getScheduleText(
          finalTimes
        ),

      time:
        formatTime(
          finalTimes[0]
        ),

      prescriptionStartDate:
        startDate,

      prescriptionEndDate:
        endDate,

      prescribedQuantity,

      stock,

      lowStockAlert,

      purpose:
        form.purpose.trim(),

      status:
        form.status ||
        "Active",

      accentColor:
        form.accentColor ||
        "Cyan",

      notes:
        form.notes.trim(),

      instructions:
        form.notes.trim(),

      /*
        NEVER destroy dose history while editing.
      */
      doseTaken:
        existing?.doseTaken ||
        {},

      taken:
        existing?.taken ||
        false,
    };

    let updated;

    if (editingId) {
      updated =
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
    } else {
      updated = [
        ...medicines,
        {
          id: `medicine-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 8)}`,

          ...medicineData,
        },
      ];
    }

    setMedicines(
      updated
    );

    saveMedicines(
      updated
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

    if (
      !window.confirm(
        `Delete ${
          medicine?.name ||
          "this medicine"
        }?`
      )
    ) {
      return;
    }

    const updated =
      medicines.filter(
        (item) =>
          item.id !== id
      );

    setMedicines(
      updated
    );

    saveMedicines(
      updated
    );
  };

  /* =======================================================
     TAKE / UNDO DOSE
  ======================================================= */

  const toggleDose = (
    medicineId,
    time
  ) => {
    const medicine =
      medicines.find(
        (item) =>
          item.id ===
          medicineId
      );

    if (
      !medicine ||
      !isPrescriptionActive(
        medicine
      )
    ) {
      return;
    }

    const taken =
      isDoseTaken(
        medicine,
        time
      );

    /*
      Taking a new dose requires stock.
    */
    if (
      !taken &&
      Number(medicine.stock) <= 0
    ) {
      alert(
        `No ${
          String(
            medicine.form ||
              "dose"
          ).toLowerCase()
        } remaining for ${
          medicine.name
        }.`
      );

      return;
    }

    const updated =
      medicines.map(
        (item) => {
          if (
            item.id !==
            medicineId
          ) {
            return item;
          }

          const next =
            updateDoseHistory(
              item,
              time,
              !taken
            );

          const currentStock =
            Number(
              item.stock
            ) || 0;

          return {
            ...next,

            /*
              Take = -1 stock
              Undo = +1 stock
            */
            stock: taken
              ? currentStock +
                1
              : Math.max(
                  0,
                  currentStock -
                    1
                ),
          };
        }
      );

    setMedicines(
      updated
    );

    saveMedicines(
      updated
    );
  };

  /*
    Bottom-right action.
    Takes the next untaken dose.
  */
  const takeNextDose = (
    medicine
  ) => {
    if (
      !isPrescriptionActive(
        medicine
      )
    ) {
      return;
    }

    const nextTime =
      medicine.doseTimes.find(
        (time) =>
          !isDoseTaken(
            medicine,
            time
          )
      );

    if (!nextTime) {
      return;
    }

    toggleDose(
      medicine.id,
      nextTime
    );
  };

  /* =======================================================
     STATISTICS
  ======================================================= */

  const stats = useMemo(() => {
    const active =
      medicines.filter(
        isPrescriptionActive
      ).length;

    const paused =
      medicines.filter(
        (item) =>
          String(
            item.status
          ).toLowerCase() ===
          "paused"
      ).length;

    const completed =
      medicines.filter(
        (item) =>
          getStatus(item)
            .type ===
          "completed"
      ).length;

    const scheduled =
      medicines.reduce(
        (sum, medicine) =>
          sum +
          getTodayScheduledCount(
            medicine
          ),
        0
      );

    const taken =
      medicines.reduce(
        (sum, medicine) =>
          sum +
          getTodayTakenCount(
            medicine
          ),
        0
      );

    const alerts =
      medicines.filter(
        (medicine) => {
          const type =
            getStatus(
              medicine
            ).type;

          return (
            type ===
              "critical" ||
            type ===
              "attention"
          );
        }
      ).length;

    return {
      total:
        medicines.length,

      active,

      paused,

      completed,

      scheduled,

      taken,

      remaining:
        Math.max(
          0,
          scheduled -
            taken
        ),

      alerts,

      adherence:
        scheduled > 0
          ? Math.round(
              (taken /
                scheduled) *
                100
            )
          : 0,
    };
  }, [medicines]);

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
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">

            <div>
              <p className="text-cyan-400 text-sm font-medium mb-3">
                MEDICATION MANAGEMENT
              </p>

              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Your medicines
              </h1>

              <p className="text-lg text-slate-400 mt-4 max-w-2xl">
                Manage prescriptions, schedules,
                inventory and medication adherence
                from one place.
              </p>
            </div>

            <button
              type="button"
              onClick={
                openAddModal
              }
              className="inline-flex items-center justify-center gap-3 px-7 py-4 rounded-full bg-cyan-400 hover:bg-cyan-300 text-[#06111F] font-semibold text-lg transition shadow-[0_0_30px_rgba(34,211,238,0.15)]"
            >
              <Plus size={22} />

              Add Medicine
            </button>
          </div>
        </section>

        {/* =================================================
            STAT CARDS
        ================================================= */}

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 mb-8">

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-slate-400">
              Active medicines
            </p>

            <h2 className="text-5xl font-bold mt-3">
              {stats.active}
            </h2>

            <p className="text-xs text-slate-600 mt-2">
              {stats.total} total records
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-slate-400">
              Scheduled doses
            </p>

            <h2 className="text-5xl font-bold mt-3">
              {stats.scheduled}
            </h2>

            <p className="text-xs text-slate-600 mt-2">
              Today
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-slate-400">
              Doses taken
            </p>

            <h2 className="text-5xl font-bold mt-3 text-emerald-400">
              {stats.taken}
            </h2>

            <p className="text-xs text-slate-600 mt-2">
              {stats.adherence}% adherence
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-slate-400">
              Doses remaining
            </p>

            <h2 className="text-5xl font-bold mt-3 text-orange-400">
              {stats.remaining}
            </h2>

            <p className="text-xs text-slate-600 mt-2">
              Today
            </p>
          </div>

          <div className="rounded-2xl border border-red-400/10 bg-red-400/5 p-6">
            <p className="text-slate-400">
              Stock alerts
            </p>

            <h2 className="text-5xl font-bold mt-3 text-red-400">
              {stats.alerts}
            </h2>

            <p className="text-xs text-slate-600 mt-2">
              {stats.paused} paused ·{" "}
              {stats.completed} completed
            </p>
          </div>
        </section>

        {/* =================================================
            OVERVIEW
        ================================================= */}

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-10">

          <div className="flex items-center justify-between mb-6">

            <div>
              <h2 className="text-xl font-semibold">
                Medication overview
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Current medicine distribution
              </p>
            </div>

            <BarChart3
              size={22}
              className="text-cyan-400"
            />
          </div>

          <div className="space-y-4">

            {[
              [
                "Active",
                stats.active,
                "bg-cyan-400",
              ],

              [
                "Paused",
                stats.paused,
                "bg-orange-400",
              ],

              [
                "Completed",
                stats.completed,
                "bg-slate-500",
              ],
            ].map(
              ([
                label,
                count,
                color,
              ]) => {
                const width =
                  stats.total
                    ? Math.max(
                        (count /
                          stats.total) *
                          100,
                        count
                          ? 4
                          : 0
                      )
                    : 0;

                return (
                  <div
                    key={
                      label
                    }
                  >
                    <div className="flex items-center justify-between text-sm mb-2">

                      <span className="text-slate-300">
                        {label}
                      </span>

                      <span className="text-slate-500">
                        {count}
                      </span>

                    </div>

                    <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">

                      <div
                        className={`h-full rounded-full transition-all duration-500 ${color}`}
                        style={{
                          width: `${width}%`,
                        }}
                      />

                    </div>
                  </div>
                );
              }
            )}

          </div>

          <div className="mt-6 pt-5 border-t border-white/10">

            <div className="flex items-center justify-between mb-2">

              <span className="text-sm text-slate-400">
                Today's dose adherence
              </span>

              <span className="text-sm font-semibold text-cyan-400">
                {stats.adherence}%
              </span>

            </div>

            <div className="h-3 bg-slate-800 rounded-full overflow-hidden">

              <div
                className="h-full bg-cyan-400 rounded-full transition-all duration-500"
                style={{
                  width: `${stats.adherence}%`,
                }}
              />

            </div>

            <p className="text-xs text-slate-600 mt-2">
              {stats.taken} of{" "}
              {stats.scheduled} scheduled
              doses completed
            </p>

          </div>
        </section>

        {/* =================================================
            MEDICINE LIST
        ================================================= */}

        <section>

          <div className="mb-6">

            <h2 className="text-2xl font-semibold">
              Your medication
            </h2>

            <p className="text-slate-500 mt-1">
              Current prescriptions and medication schedules
            </p>

          </div>

          {medicines.length === 0 ? (

            <div className="rounded-2xl border border-white/10 bg-white/5 py-20 text-center">

              <Pill
                size={45}
                className="mx-auto text-slate-600 mb-4"
              />

              <h3 className="text-xl font-semibold">
                No medicines added
              </h3>

              <p className="text-slate-500 mt-2 mb-6">
                Add a prescription to generate your medication schedule.
              </p>

              <button
                type="button"
                onClick={
                  openAddModal
                }
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-cyan-400 text-[#06111F] font-semibold"
              >
                <Plus size={18} />
                Add Medicine
              </button>

            </div>

          ) : (

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

              {medicines.map(
                (medicine) => {

                  const status =
                    getStatus(
                      medicine
                    );

                  const active =
                    isPrescriptionActive(
                      medicine
                    );

                  const stock =
                    Number(
                      medicine.stock
                    ) || 0;

                  const prescribed =
                    Number(
                      medicine.prescribedQuantity
                    ) || 0;

                  const daysLeft =
                    daysRemaining(
                      medicine.prescriptionEndDate
                    );

                  const stockPercent =
                    prescribed > 0
                      ? Math.min(
                          100,
                          Math.max(
                            0,
                            (stock /
                              prescribed) *
                              100
                          )
                        )
                      : stock > 0
                      ? 100
                      : 0;

                  const scheduledToday =
                    getTodayScheduledCount(
                      medicine
                    );

                  const takenToday =
                    getTodayTakenCount(
                      medicine
                    );

                  const remainingToday =
                    Math.max(
                      0,
                      scheduledToday -
                        takenToday
                    );

                  return (
                    <article
                      key={
                        medicine.id
                      }
                      className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/[0.07] transition"
                    >

                      {/* ==========================
                          TOP
                      ========================== */}

                      <div className="flex items-start justify-between gap-4">

                        <div className="flex items-center gap-4 min-w-0">

                          <div className="w-12 h-12 shrink-0 rounded-xl bg-cyan-400/10 flex items-center justify-center">

                            <Pill
                              size={23}
                              className="text-cyan-400"
                            />

                          </div>

                          <div className="min-w-0">

                            <h3 className="text-xl font-semibold truncate">
                              {medicine.name}
                            </h3>

                            <p className="text-sm text-slate-500 mt-1">
                              {medicine.dosage ||
                                "Dosage not set"}{" "}
                              ·{" "}
                              {medicine.form ||
                                "Tablet"}
                            </p>

                            {medicine.purpose && (
                              <p className="text-xs text-slate-600 mt-1 truncate">
                                {
                                  medicine.purpose
                                }
                              </p>
                            )}

                          </div>

                        </div>

                        <div className="flex items-center gap-2 shrink-0">

                          <button
                            type="button"
                            onClick={() =>
                              openEditModal(
                                medicine
                              )
                            }
                            className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition"
                            title="Edit prescription"
                          >
                            <Edit3
                              size={17}
                            />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              deleteMedicine(
                                medicine.id
                              )
                            }
                            className="w-9 h-9 rounded-lg bg-red-400/5 hover:bg-red-400/10 flex items-center justify-center text-red-400 transition"
                            title="Delete prescription"
                          >
                            <Trash2
                              size={17}
                            />
                          </button>

                        </div>

                      </div>

                      {/* ==========================
                          STATUS
                      ========================== */}

                      {status.type !==
                        "good" && (
                        <div
                          className={`mt-5 rounded-xl border px-4 py-3 text-sm ${
                            status.type ===
                            "critical"
                              ? "border-red-400/20 bg-red-400/5 text-red-400"
                              : status.type ===
                                "attention"
                              ? "border-orange-400/20 bg-orange-400/5 text-orange-400"
                              : status.type ===
                                "future"
                              ? "border-orange-400/20 bg-orange-400/5 text-orange-400"
                              : "border-slate-400/20 bg-slate-400/5 text-slate-400"
                          }`}
                        >
                          {status.label}
                        </div>
                      )}

                      {/* ==========================
                          DETAILS
                      ========================== */}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">

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
                              {getScheduleText(
                                medicine.doseTimes
                              )}
                            </span>

                          </div>

                        </div>

                        <div>

                          <p className="text-xs text-slate-500 uppercase tracking-wide">
                            Frequency
                          </p>

                          <p className="text-slate-300 mt-2">
                            {getFrequency(
                              medicine.doseTimes
                            )}
                          </p>

                        </div>

                      </div>

                      {/* ==========================
                          TODAY'S DOSES
                      ========================== */}

                      <div className="mt-6 rounded-xl border border-white/10 bg-black/10 p-4">

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
                            {takenToday}/
                            {scheduledToday}{" "}
                            taken
                          </span>

                        </div>

                        {medicine.doseTimes.length ===
                        0 ? (

                          <div className="rounded-lg bg-orange-400/5 border border-orange-400/10 p-3">

                            <p className="text-sm text-orange-400">
                              No dose time is available.
                            </p>

                            <button
                              type="button"
                              onClick={() =>
                                openEditModal(
                                  medicine
                                )
                              }
                              className="text-xs text-orange-300 underline mt-1"
                            >
                              Set a dose time
                            </button>

                          </div>

                        ) : (

                          <div className="space-y-2">

                            {medicine.doseTimes.map(
                              (time) => {

                                const taken =
                                  isDoseTaken(
                                    medicine,
                                    time
                                  );

                                const doseStatus =
                                  getDoseStatus(
                                    medicine,
                                    time
                                  );

                                return (
                                  <div
                                    key={
                                      time
                                    }
                                    className={`flex items-center justify-between gap-3 rounded-lg px-3 py-3 border ${
                                      taken
                                        ? "bg-emerald-400/10 border-emerald-400/20"
                                        : "bg-white/5 border-white/5"
                                    }`}
                                  >

                                    <div className="flex items-center gap-3">

                                      {taken ? (

                                        <CheckCircle2
                                          size={18}
                                          className="text-emerald-400"
                                        />

                                      ) : (

                                        <Clock3
                                          size={18}
                                          className={
                                            doseStatus ===
                                            "Due now"
                                              ? "text-cyan-400"
                                              : doseStatus ===
                                                "Missed"
                                              ? "text-red-400"
                                              : "text-orange-400"
                                          }
                                        />

                                      )}

                                      <div>

                                        <p className="text-sm text-slate-200">
                                          {formatTime(
                                            time
                                          )}
                                        </p>

                                        <p className="text-xs text-slate-500">
                                          {getSchedule(
                                            time
                                          )}
                                        </p>

                                      </div>

                                    </div>

                                    <button
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
                                      className={`min-w-[105px] px-3 py-2 rounded-lg text-xs font-semibold transition ${
                                        taken
                                          ? "bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20"
                                          : doseStatus ===
                                            "Due now"
                                          ? "bg-cyan-400 text-[#06111F] hover:bg-cyan-300"
                                          : doseStatus ===
                                            "Missed"
                                          ? "bg-red-400/10 text-red-400 hover:bg-red-400/20"
                                          : "bg-white/10 text-orange-400 hover:bg-white/15"
                                      } ${
                                        !active
                                          ? "opacity-40 cursor-not-allowed"
                                          : ""
                                      }`}
                                    >
                                      {taken
                                        ? "✓ Taken"
                                        : doseStatus ===
                                          "Upcoming"
                                        ? "Upcoming"
                                        : doseStatus ===
                                          "Due now"
                                        ? "Take dose"
                                        : "Take dose"}
                                    </button>

                                  </div>
                                );
                              }
                            )}

                          </div>
                        )}

                      </div>

                      {/* ==========================
                          PRESCRIPTION
                      ========================== */}

                      <div className="mt-6 rounded-xl border border-white/10 bg-black/10 p-4">

                        <div className="flex items-center gap-2 mb-4">

                          <CalendarDays
                            size={17}
                            className="text-cyan-400"
                          />

                          <p className="text-sm font-medium">
                            Prescription
                          </p>

                        </div>

                        <div className="grid grid-cols-2 gap-4">

                          <div>

                            <p className="text-xs text-slate-500">
                              Start
                            </p>

                            <p className="text-sm text-slate-300 mt-1">
                              {formatDate(
                                medicine.prescriptionStartDate
                              )}
                            </p>

                          </div>

                          <div>

                            <p className="text-xs text-slate-500">
                              End
                            </p>

                            <p className="text-sm text-slate-300 mt-1">
                              {formatDate(
                                medicine.prescriptionEndDate
                              )}
                            </p>

                          </div>

                          <div>

                            <p className="text-xs text-slate-500">
                              Prescribed
                            </p>

                            <p className="text-sm text-slate-300 mt-1">
                              {medicine.prescribedQuantity >
                              0
                                ? `${medicine.prescribedQuantity} doses`
                                : "Not set"}
                            </p>

                          </div>

                          <div>

                            <p className="text-xs text-slate-500">
                              Days left
                            </p>

                            <p className="text-sm text-slate-300 mt-1">
                              {daysLeft !==
                              null
                                ? `${daysLeft} days`
                                : "Not set"}
                            </p>

                          </div>

                        </div>

                      </div>

                      {/* ==========================
                          STOCK
                      ========================== */}

                      <div className="mt-6">

                        <div className="flex items-center justify-between mb-2">

                          <p className="text-xs text-slate-500 uppercase tracking-wide">
                            Current stock
                          </p>

                          <p
                            className={`text-sm font-semibold ${
                              stock <= 0
                                ? "text-red-400"
                                : stock <=
                                  medicine.lowStockAlert
                                ? "text-orange-400"
                                : "text-emerald-400"
                            }`}
                          >
                            {stock} remaining
                          </p>

                        </div>

                        <div className="h-2 bg-slate-700/60 rounded-full overflow-hidden">

                          <div
                            className={`h-full rounded-full transition-all ${
                              status.type ===
                              "critical"
                                ? "bg-red-400"
                                : status.type ===
                                  "attention"
                                ? "bg-orange-400"
                                : "bg-cyan-400"
                            }`}
                            style={{
                              width: `${stockPercent}%`,
                            }}
                          />

                        </div>

                        <div className="mt-3 flex items-center gap-2 text-sm">

                          {status.type ===
                          "critical" ? (

                            <>
                              <AlertTriangle
                                size={15}
                                className="text-red-400"
                              />

                              <span className="text-red-400">
                                {
                                  status.label
                                }
                              </span>
                            </>

                          ) : status.type ===
                            "attention" ? (

                            <>
                              <AlertTriangle
                                size={15}
                                className="text-orange-400"
                              />

                              <span className="text-orange-400">
                                {
                                  status.label
                                }
                              </span>
                            </>

                          ) : status.type ===
                            "future" ? (

                            <>
                              <CalendarDays
                                size={15}
                                className="text-orange-400"
                              />

                              <span className="text-orange-400">
                                Prescription starts later
                              </span>
                            </>

                          ) : status.type ===
                            "completed" ? (

                            <>
                              <CalendarDays
                                size={15}
                                className="text-slate-400"
                              />

                              <span className="text-slate-400">
                                {
                                  status.label
                                }
                              </span>
                            </>

                          ) : status.type ===
                            "paused" ? (

                            <>
                              <Clock3
                                size={15}
                                className="text-slate-400"
                              />

                              <span className="text-slate-400">
                                Prescription paused
                              </span>
                            </>

                          ) : (

                            <>
                              <CheckCircle2
                                size={15}
                                className="text-emerald-400"
                              />

                              <span className="text-emerald-400">
                                Stock sufficient
                              </span>
                            </>

                          )}

                        </div>

                      </div>

                      {/* ==========================
                          BOTTOM ACTION
                      ========================== */}

                      <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between gap-4">

                        <div>

                          <p className="text-sm text-slate-400">

                            {remainingToday}{" "}
                            dose
                            {remainingToday ===
                            1
                              ? ""
                              : "s"}{" "}
                            remaining today

                          </p>

                          <p className="text-xs text-slate-600 mt-1">

                            {takenToday} of{" "}
                            {scheduledToday}{" "}
                            completed

                          </p>

                        </div>

                        {scheduledToday >
                          0 && (

                          <button
                            type="button"
                            disabled={
                              !active ||
                              remainingToday ===
                                0
                            }
                            onClick={() =>
                              takeNextDose(
                                medicine
                              )
                            }
                            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition ${
                              remainingToday ===
                              0
                                ? "bg-emerald-400/10 text-emerald-400"
                                : "bg-cyan-400 text-[#06111F] hover:bg-cyan-300"
                            } ${
                              !active ||
                              remainingToday ===
                                0
                                ? "opacity-70 cursor-default"
                                : ""
                            }`}
                          >

                            {remainingToday ===
                            0
                              ? "✓ All taken"
                              : "Take next dose"}

                          </button>

                        )}

                      </div>

                    </article>
                  );
                }
              )}

            </div>
          )}

        </section>

        {/* SYNC STATUS */}

        {medicines.length >
          0 && (
          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-600">

            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />

            Medication state synchronized

          </div>
        )}

      </main>

      {/* ===================================================
          ADD / EDIT MODAL
      =================================================== */}

      {showModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }
          }}
        >

          <div className="w-full max-w-[680px] max-h-[92vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#0B192B] shadow-2xl">

            {/* MODAL HEADER */}

            <div className="sticky top-0 z-10 bg-[#0B192B] border-b border-white/10 px-7 py-5 flex items-center justify-between">

              <div>

                <h2 className="text-2xl font-semibold">
                  {editingId
                    ? "Edit Prescription"
                    : "Add Prescription"}
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Set the medication,
                  schedule, dates and inventory.
                </p>

              </div>

              <button
                type="button"
                onClick={
                  closeModal
                }
                className="w-9 h-9 rounded-lg hover:bg-white/5 flex items-center justify-center text-slate-400 hover:text-white"
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

              {/* BASIC INFORMATION */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <Input
                  label="Medicine name"
                  type="text"
                  value={
                    form.name
                  }
                  onChange={(e) =>
                    updateForm(
                      "name",
                      e.target.value
                    )
                  }
                  placeholder="e.g. Paracetamol"
                  required
                />

                <Input
                  label="Dosage"
                  type="text"
                  value={
                    form.dosage
                  }
                  onChange={(e) =>
                    updateForm(
                      "dosage",
                      e.target.value
                    )
                  }
                  placeholder="e.g. 500 mg"
                  required
                />

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
                  onChange={(e) =>
                    updateForm(
                      "form",
                      e.target.value
                    )
                  }
                  className="w-full h-12 px-4 rounded-xl border border-white/10 bg-[#111F32] text-white outline-none focus:border-cyan-400/50"
                >

                  {[
                    "Tablet",
                    "Capsule",
                    "Liquid",
                    "Injection",
                    "Powder",
                    "Other",
                  ].map(
                    (item) => (
                      <option
                        key={
                          item
                        }
                      >
                        {item}
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* DOSE TIMES */}

              <div className="mt-6">

                <label className="block text-sm text-slate-400 mb-2">
                  Dose times
                </label>

                <p className="text-xs text-slate-600 mb-3">
                  These are the actual times DoseTwin will show as today's doses.
                </p>

                <div className="space-y-3">

                  {form.doseTimes.map(
                    (
                      time,
                      index
                    ) => (

                      <div
                        key={
                          index
                        }
                        className="flex items-center gap-2"
                      >

                        <input
                          type="time"
                          value={
                            time
                          }
                          onChange={(e) =>
                            updateTimeSlot(
                              index,
                              e.target.value
                            )
                          }
                          className="flex-1 h-12 px-4 rounded-xl border border-white/10 bg-white/5 text-white outline-none focus:border-cyan-400/50"
                        />

                        <span className="hidden sm:block min-w-[85px] text-xs text-slate-500">
                          {time
                            ? getSchedule(
                                time
                              )
                            : "Schedule"}
                        </span>

                        {form.doseTimes
                          .length >
                          1 && (

                          <button
                            type="button"
                            onClick={() =>
                              removeTimeSlot(
                                index
                              )
                            }
                            className="w-10 h-10 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/5 flex items-center justify-center"
                          >
                            <X
                              size={
                                17
                              }
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
                  className="mt-3 inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm font-medium"
                >
                  <Plus
                    size={17}
                  />

                  Add dose time
                </button>

              </div>

              {/* DATES */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">

                <Input
                  label="Prescription start"
                  type="date"
                  value={
                    form.prescriptionStartDate
                  }
                  onChange={(e) =>
                    updateForm(
                      "prescriptionStartDate",
                      e.target.value
                    )
                  }
                />

                <Input
                  label="Prescription end"
                  type="date"
                  value={
                    form.prescriptionEndDate
                  }
                  onChange={(e) =>
                    updateForm(
                      "prescriptionEndDate",
                      e.target.value
                    )
                  }
                />

              </div>

              {/* INVENTORY */}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">

                <Input
                  label="Prescribed quantity"
                  type="number"
                  min="0"
                  value={
                    form.prescribedQuantity
                  }
                  onChange={(e) =>
                    updateForm(
                      "prescribedQuantity",
                      e.target.value
                    )
                  }
                  placeholder="30"
                />

                <Input
                  label="Current stock"
                  type="number"
                  min="0"
                  value={
                    form.stock
                  }
                  onChange={(e) =>
                    updateForm(
                      "stock",
                      e.target.value
                    )
                  }
                  placeholder="30"
                />

                <Input
                  label="Low stock alert"
                  type="number"
                  min="0"
                  value={
                    form.lowStockAlert
                  }
                  onChange={(e) =>
                    updateForm(
                      "lowStockAlert",
                      e.target.value
                    )
                  }
                  placeholder="3"
                />

              </div>

              {/* PURPOSE */}

              <div className="mt-6">

                <Input
                  label="Purpose / condition"
                  type="text"
                  value={
                    form.purpose
                  }
                  onChange={(e) =>
                    updateForm(
                      "purpose",
                      e.target.value
                    )
                  }
                  placeholder="e.g. Diabetes management"
                />

              </div>

              {/* STATUS + ACCENT */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">

                <div>

                  <label className="block text-sm text-slate-400 mb-2">
                    Status
                  </label>

                  <select
                    value={
                      form.status
                    }
                    onChange={(e) =>
                      updateForm(
                        "status",
                        e.target.value
                      )
                    }
                    className="w-full h-12 px-4 rounded-xl border border-white/10 bg-[#111F32] text-white outline-none focus:border-cyan-400/50"
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
                    onChange={(e) =>
                      updateForm(
                        "accentColor",
                        e.target.value
                      )
                    }
                    className="w-full h-12 px-4 rounded-xl border border-white/10 bg-[#111F32] text-white outline-none focus:border-cyan-400/50"
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
                  onChange={(e) =>
                    updateForm(
                      "notes",
                      e.target.value
                    )
                  }
                  placeholder="e.g. Take after breakfast"
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-slate-600 outline-none resize-none focus:border-cyan-400/50"
                />

              </div>

              {/* BUTTONS */}

              <div className="flex justify-end items-center gap-3 mt-7 pt-5 border-t border-white/10">

                <button
                  type="button"
                  onClick={
                    closeModal
                  }
                  className="px-6 py-3 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 font-medium transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-7 py-3 rounded-full bg-cyan-400 hover:bg-cyan-300 text-[#06111F] font-semibold transition"
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