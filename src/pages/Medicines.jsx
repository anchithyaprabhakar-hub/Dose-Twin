import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  Clock3,
  Pill,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";

const STORAGE_KEY = "dosetwin_medicines";

const defaultMedicines = [
  {
    id: 1,
    name: "Metformin",
    dosage: "500 mg",
    schedule: "Morning",
    time: "8:00 AM",
    instructions: "Take after breakfast",
    taken: true,
  },
  {
    id: 2,
    name: "Omega 3",
    dosage: "1000 mg",
    schedule: "Afternoon",
    time: "1:00 PM",
    instructions: "Take with food",
    taken: true,
  },
  {
    id: 3,
    name: "Vitamin D",
    dosage: "1000 IU",
    schedule: "Evening",
    time: "7:30 PM",
    instructions: "Take after dinner",
    taken: false,
  },
];

function getMedicines() {
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
    console.error("Error loading medicines:", error);
    return defaultMedicines;
  }
}

function saveMedicines(medicines) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(medicines)
  );
}

function formatTime(time) {
  if (!time) return "";

  const [hours, minutes] = time.split(":");
  const hour = Number(hours);

  const suffix = hour >= 12 ? "PM" : "AM";
  const formattedHour = hour % 12 || 12;

  return `${formattedHour}:${minutes} ${suffix}`;
}

function Medicines() {
  const [medicines, setMedicines] = useState(getMedicines);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [newMedicine, setNewMedicine] = useState({
    name: "",
    dosage: "",
    schedule: "Morning",
    time: "",
    instructions: "",
  });

  const filteredMedicines = useMemo(() => {
    return medicines.filter((medicine) =>
      medicine.name
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [medicines, search]);

  const takenCount = medicines.filter(
    (medicine) => medicine.taken
  ).length;

  const remainingCount =
    medicines.length - takenCount;

  const updateMedicines = (updatedMedicines) => {
    setMedicines(updatedMedicines);
    saveMedicines(updatedMedicines);
  };

  const toggleTaken = (id) => {
    const updated = medicines.map((medicine) =>
      medicine.id === id
        ? {
            ...medicine,
            taken: !medicine.taken,
          }
        : medicine
    );

    updateMedicines(updated);
  };

  const deleteMedicine = (id) => {
    const updated = medicines.filter(
      (medicine) => medicine.id !== id
    );

    updateMedicines(updated);
  };

  const addMedicine = (event) => {
    event.preventDefault();

    if (
      !newMedicine.name.trim() ||
      !newMedicine.dosage.trim() ||
      !newMedicine.time
    ) {
      return;
    }

    const medicineToAdd = {
      id: Date.now(),
      name: newMedicine.name.trim(),
      dosage: newMedicine.dosage.trim(),
      schedule: newMedicine.schedule,
      time: formatTime(newMedicine.time),
      instructions:
        newMedicine.instructions.trim(),
      taken: false,
    };

    const updated = [
      ...medicines,
      medicineToAdd,
    ];

    updateMedicines(updated);

    setNewMedicine({
      name: "",
      dosage: "",
      schedule: "Morning",
      time: "",
      instructions: "",
    });

    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-[#08111F] text-white">

      {/* NAVBAR */}

      <nav className="border-b border-white/10 bg-[#0A1724]/90 backdrop-blur-xl">

        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          <Link
            to="/dashboard"
            className="flex items-center gap-3"
          >

            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-400 to-red-400" />

            <div>
              <h1 className="text-xl font-bold">
                DoseTwin
              </h1>

              <p className="text-xs text-slate-500">
                Smart Medication Platform
              </p>
            </div>

          </Link>

          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition"
          >
            <ArrowLeft size={18} />
            Dashboard
          </Link>

        </div>

      </nav>

      {/* MAIN */}

      <main className="max-w-7xl mx-auto px-6 py-10">

        {/* HEADER */}

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">

          <div>

            <p className="text-cyan-400 text-sm font-medium mb-2">
              MEDICATION MANAGEMENT
            </p>

            <h2 className="text-4xl md:text-5xl font-bold mb-3">
              Your medicines
            </h2>

            <p className="text-slate-400 max-w-2xl">
              Manage your medications, schedules,
              dosage information, and daily adherence.
            </p>

          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-cyan-400 to-teal-400 text-[#08111F] font-semibold hover:scale-[1.02] transition-all"
          >
            <Plus size={19} />
            Add Medicine
          </button>

        </div>

        {/* SUMMARY */}

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">

            <p className="text-slate-500 text-sm">
              Total medicines
            </p>

            <h3 className="text-3xl font-bold mt-2">
              {medicines.length}
            </h3>

          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">

            <p className="text-slate-500 text-sm">
              Taken today
            </p>

            <h3 className="text-3xl font-bold mt-2 text-emerald-400">
              {takenCount}
            </h3>

          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">

            <p className="text-slate-500 text-sm">
              Remaining
            </p>

            <h3 className="text-3xl font-bold mt-2 text-orange-400">
              {remainingCount}
            </h3>

          </div>

        </section>

        {/* SEARCH */}

        <div className="relative mb-8 max-w-xl">

          <Search
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          />

          <input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search medicines..."
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white outline-none focus:border-cyan-400/50 transition"
          />

        </div>

        {/* MEDICINE GRID */}

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

          {filteredMedicines.map((medicine) => (

            <article
              key={medicine.id}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/[0.07] transition-all"
            >

              <div className="flex items-start justify-between gap-4">

                <div className="flex items-center gap-4">

                  <div className="w-12 h-12 rounded-xl bg-cyan-400/10 flex items-center justify-center">

                    <Pill
                      className="text-cyan-400"
                      size={23}
                    />

                  </div>

                  <div>

                    <h3 className="text-xl font-semibold">
                      {medicine.name}
                    </h3>

                    <p className="text-sm text-slate-500">
                      {medicine.dosage}
                    </p>

                  </div>

                </div>

                <button
                  onClick={() =>
                    deleteMedicine(medicine.id)
                  }
                  className="p-2 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-400/10 transition"
                  title="Delete medicine"
                >
                  <Trash2 size={18} />
                </button>

              </div>

              <div className="mt-6 space-y-3">

                <div className="flex items-center justify-between text-sm">

                  <span className="text-slate-500">
                    Schedule
                  </span>

                  <span className="text-slate-300">
                    {medicine.schedule}
                  </span>

                </div>

                <div className="flex items-center justify-between text-sm">

                  <span className="text-slate-500">
                    Time
                  </span>

                  <span className="flex items-center gap-2 text-slate-300">

                    <Clock3 size={15} />

                    {medicine.time}

                  </span>

                </div>

                <div className="flex items-center justify-between text-sm">

                  <span className="text-slate-500">
                    Instructions
                  </span>

                  <span className="text-slate-300 text-right max-w-[180px]">
                    {medicine.instructions ||
                      "No instructions"}
                  </span>

                </div>

              </div>

              <div className="mt-6 pt-5 border-t border-white/10">

                <button
                  onClick={() =>
                    toggleTaken(medicine.id)
                  }
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
                    medicine.taken
                      ? "bg-emerald-400/10 text-emerald-400 border border-emerald-400/20"
                      : "bg-orange-400/10 text-orange-400 border border-orange-400/20"
                  }`}
                >

                  {medicine.taken ? (
                    <>
                      <Check size={18} />
                      Taken
                    </>
                  ) : (
                    <>
                      <Clock3 size={18} />
                      Mark as Taken
                    </>
                  )}

                </button>

              </div>

            </article>

          ))}

        </section>

        {/* EMPTY */}

        {filteredMedicines.length === 0 && (

          <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">

            <Pill
              className="mx-auto text-slate-600 mb-4"
              size={36}
            />

            <h3 className="text-xl font-semibold">
              No medicines found
            </h3>

            <p className="text-slate-500 mt-2">
              Try a different search or add a new medicine.
            </p>

          </div>

        )}

      </main>

      {/* MODAL */}

      {showModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm">

          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0A1724] p-7 shadow-2xl">

            <div className="flex items-center justify-between mb-7">

              <div>

                <h2 className="text-2xl font-bold">
                  Add medicine
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Add medication details to your schedule.
                </p>

              </div>

              <button
                onClick={() =>
                  setShowModal(false)
                }
                className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition"
              >
                <X size={20} />
              </button>

            </div>

            <form
              onSubmit={addMedicine}
              className="space-y-5"
            >

              <div>

                <label className="block text-sm text-slate-400 mb-2">
                  Medicine name
                </label>

                <input
                  value={newMedicine.name}
                  onChange={(event) =>
                    setNewMedicine({
                      ...newMedicine,
                      name: event.target.value,
                    })
                  }
                  placeholder="e.g. Paracetamol"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-cyan-400/50"
                />

              </div>

              <div className="grid grid-cols-2 gap-4">

                <div>

                  <label className="block text-sm text-slate-400 mb-2">
                    Dosage
                  </label>

                  <input
                    value={newMedicine.dosage}
                    onChange={(event) =>
                      setNewMedicine({
                        ...newMedicine,
                        dosage: event.target.value,
                      })
                    }
                    placeholder="500 mg"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-cyan-400/50"
                  />

                </div>

                <div>

                  <label className="block text-sm text-slate-400 mb-2">
                    Time
                  </label>

                  <input
                    type="time"
                    value={newMedicine.time}
                    onChange={(event) =>
                      setNewMedicine({
                        ...newMedicine,
                        time: event.target.value,
                      })
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-cyan-400/50"
                  />

                </div>

              </div>

              <div>

                <label className="block text-sm text-slate-400 mb-2">
                  Schedule
                </label>

                <select
                  value={newMedicine.schedule}
                  onChange={(event) =>
                    setNewMedicine({
                      ...newMedicine,
                      schedule: event.target.value,
                    })
                  }
                  className="w-full bg-[#111C2C] border border-white/10 rounded-xl p-3 text-white outline-none focus:border-cyan-400/50"
                >

                  <option>Morning</option>
                  <option>Afternoon</option>
                  <option>Evening</option>
                  <option>Night</option>

                </select>

              </div>

              <div>

                <label className="block text-sm text-slate-400 mb-2">
                  Instructions
                </label>

                <input
                  value={newMedicine.instructions}
                  onChange={(event) =>
                    setNewMedicine({
                      ...newMedicine,
                      instructions:
                        event.target.value,
                    })
                  }
                  placeholder="Take after food"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-cyan-400/50"
                />

              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 text-[#08111F] font-semibold hover:shadow-[0_0_30px_rgba(34,211,238,0.25)] transition"
              >
                Add Medicine
              </button>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default Medicines;