import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Edit3,
  Pill,
  Plus,
  Trash2,
  X,
} from "lucide-react";

const STORAGE_KEY = "dosetwin_medicines";

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
    stock: 30,
    lowStockAlert: 5,
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
    stock: 20,
    lowStockAlert: 5,
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
    stock: 30,
    lowStockAlert: 5,
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

  /*
    Custom event.

    This allows Dashboard, Analytics and Digital Twin
    to immediately know that medicines changed,
    even when they are inside the same browser tab.
  */

  window.dispatchEvent(
    new Event("dosetwin-medicines-updated")
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
  stock: "",
  lowStockAlert: "5",
  purpose: "",
  status: "Active",
  accentColor: "Teal",
  notes: "",
};


/* =========================================================
   MAIN COMPONENT
========================================================= */

function Medicines() {
  const [medicines, setMedicines] = useState(
    loadMedicines
  );

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
      "dosetwin-medicines-updated",
      syncMedicines
    );

    return () => {
      window.removeEventListener(
        "storage",
        syncMedicines
      );

      window.removeEventListener(
        "dosetwin-medicines-updated",
        syncMedicines
      );
    };
  }, []);


  /* =======================================================
     FORM HANDLERS
  ======================================================= */

  const updateForm = (field, value) => {
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

  const openEditModal = (medicine) => {
    setEditingId(medicine.id);

    setForm({
      name: medicine.name || "",
      dosage: medicine.dosage || "",
      form: medicine.form || "Tablet",
      frequency:
        medicine.frequency || "Once daily",
      doseTimes:
        medicine.doseTimes?.length
          ? medicine.doseTimes
          : [""],
      stock:
        medicine.stock !== undefined
          ? String(medicine.stock)
          : "",
      lowStockAlert:
        medicine.lowStockAlert !== undefined
          ? String(medicine.lowStockAlert)
          : "5",
      purpose: medicine.purpose || "",
      status: medicine.status || "Active",
      accentColor:
        medicine.accentColor || "Teal",
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

  const removeTimeSlot = (index) => {
    setForm((previous) => {
      const updated = previous.doseTimes.filter(
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
     UPDATE TIME SLOT
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
     CONVERT TIME
  ======================================================= */

  const formatTime = (time) => {
    if (!time) return "";

    const [hours, minutes] =
      time.split(":");

    let hour = Number(hours);

    const period =
      hour >= 12 ? "PM" : "AM";

    hour = hour % 12 || 12;

    return `${hour}:${minutes} ${period}`;
  };


  /* =======================================================
     DETERMINE SCHEDULE
  ======================================================= */

  const getSchedule = (time) => {
    if (!time) return "Morning";

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
  };


  /* =======================================================
     SAVE MEDICINE
  ======================================================= */

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      alert("Please enter a medicine name.");
      return;
    }

    if (!form.dosage.trim()) {
      alert("Please enter the dosage.");
      return;
    }

    const validTimes =
      form.doseTimes.filter(
        (time) => time
      );

    const firstTime =
      validTimes[0] || "";

    const medicineData = {
      name: form.name.trim(),

      dosage: form.dosage.trim(),

      form: form.form,

      frequency: form.frequency,

      doseTimes: validTimes,

      schedule:
        getSchedule(firstTime),

      time:
        formatTime(firstTime),

      stock:
        Number(form.stock) || 0,

      lowStockAlert:
        Number(form.lowStockAlert) || 5,

      purpose:
        form.purpose.trim(),

      status: form.status,

      accentColor:
        form.accentColor,

      notes:
        form.notes.trim(),

      instructions:
        form.notes.trim(),

      /*
        When editing, preserve taken status.
        When adding, default to false.
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
            medicine.id === editingId
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


    setMedicines(updatedMedicines);

    saveMedicines(updatedMedicines);

    closeModal();
  };


  /* =======================================================
     DELETE
  ======================================================= */

  const deleteMedicine = (id) => {
    const medicine =
      medicines.find(
        (item) => item.id === id
      );

    const confirmed = window.confirm(
      `Delete ${
        medicine?.name || "this medicine"
      }?`
    );

    if (!confirmed) return;

    const updatedMedicines =
      medicines.filter(
        (medicine) =>
          medicine.id !== id
      );

    setMedicines(updatedMedicines);

    saveMedicines(updatedMedicines);
  };


  /* =======================================================
     TOGGLE TAKEN
  ======================================================= */

  const toggleTaken = (id) => {
    const updatedMedicines =
      medicines.map(
        (medicine) =>
          medicine.id === id
            ? {
                ...medicine,
                taken: !medicine.taken,
              }
            : medicine
      );

    setMedicines(updatedMedicines);

    saveMedicines(updatedMedicines);
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
                Manage your medications, schedules,
                dosage information, and daily adherence.
              </p>

            </div>


            {/* ADD BUTTON */}

            <button
              onClick={openAddModal}
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
            gap-6
            mb-10
          "
        >

          <div
            className="
              rounded-2xl
              border
              border-white/10
              bg-white/5
              p-7
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
              p-7
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
              p-7
            "
          >

            <p className="text-slate-400">
              Remaining
            </p>

            <h2 className="text-5xl font-bold mt-3 text-orange-400">
              {remaining}
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
                Active medications and schedules
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
                Add your first medicine to get started.
              </p>

              <button
                onClick={openAddModal}
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

                  const lowStock =
                    Number(
                      medicine.lowStockAlert
                    ) || 5;

                  const isLowStock =
                    stock <= lowStock;


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


                      {/* STOCK */}

                      <div className="mt-6">

                        <div className="flex items-center justify-between mb-2">

                          <p className="text-xs text-slate-500 uppercase tracking-wide">
                            Stock
                          </p>

                          <span
                            className={
                              isLowStock
                                ? "text-orange-400 text-sm"
                                : "text-slate-400 text-sm"
                            }
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
                                isLowStock
                                  ? "bg-orange-400"
                                  : "bg-cyan-400"
                              }
                            `}
                            style={{
                              width: `${Math.min(
                                stock * 3.33,
                                100
                              )}%`,
                            }}
                          />

                        </div>


                        {isLowStock && (

                          <div className="flex items-center gap-2 mt-3 text-orange-400 text-sm">

                            <AlertTriangle size={15} />

                            Low stock

                          </div>

                        )}

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
                              <CheckCircle2 size={17} />
                              Taken today
                            </>
                          ) : (
                            <>
                              <Clock3 size={17} />
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
          ADD / EDIT MEDICINE MODAL
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
              max-w-[620px]
              max-h-[92vh]
              overflow-y-auto
              rounded-2xl
              border
              border-white/10
              bg-[#0B192B]
              shadow-2xl
            "
          >

            {/* MODAL HEADER */}

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

              <h2 className="text-2xl font-semibold">
                {editingId
                  ? "Edit Medicine"
                  : "Add Medicine"}
              </h2>

              <button
                onClick={closeModal}
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
              onSubmit={handleSubmit}
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
                      transition
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
                    placeholder="e.g. 500mg"
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
                      transition
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
                    value={form.form}
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

                    <option>Tablet</option>
                    <option>Capsule</option>
                    <option>Liquid</option>
                    <option>Injection</option>
                    <option>Powder</option>
                    <option>Other</option>

                  </select>

                </div>


                <div>

                  <label className="block text-sm text-slate-400 mb-2">
                    Frequency
                  </label>

                  <select
                    value={form.frequency}
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

                    <option>Once daily</option>
                    <option>Twice daily</option>
                    <option>Three times daily</option>
                    <option>Four times daily</option>
                    <option>Every other day</option>
                    <option>Weekly</option>
                    <option>As needed</option>

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
                    (time, index) => (

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


                        {form.doseTimes.length >
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

                            <X size={17} />

                          </button>

                        )}

                      </div>

                    )
                  )}

                </div>


                <button
                  type="button"
                  onClick={addTimeSlot}
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


              {/* STOCK */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">

                <div>

                  <label className="block text-sm text-slate-400 mb-2">
                    Stock quantity
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={form.stock}
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
                    Low stock alert at
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
                    placeholder="5"
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


              {/* PURPOSE */}

              <div className="mt-5">

                <label className="block text-sm text-slate-400 mb-2">
                  Condition / purpose
                </label>

                <input
                  type="text"
                  value={form.purpose}
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
                    value={form.status}
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

                    <option>Active</option>
                    <option>Paused</option>
                    <option>Completed</option>

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

                    <option>Teal</option>
                    <option>Cyan</option>
                    <option>Purple</option>
                    <option>Orange</option>
                    <option>Green</option>
                    <option>Red</option>

                  </select>

                </div>

              </div>


              {/* NOTES */}

              <div className="mt-5">

                <label className="block text-sm text-slate-400 mb-2">
                  Notes (optional)
                </label>

                <textarea
                  value={form.notes}
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
                  onClick={closeModal}
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