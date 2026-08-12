import { useEffect, useState } from "react";
import {
  Bell,
  CheckCircle2,
  Clock3,
  HeartPulse,
  Pill,
  ShieldCheck,
  TrendingUp,
  UserRound,
  ArrowRight,
  BarChart3,
  MessageCircle,
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
    console.error("Could not load medicines:", error);
    return defaultMedicines;
  }
}

function Dashboard() {
  const [medicines, setMedicines] = useState(loadMedicines);

  /* ================= LOAD MEDICINES ================= */

  useEffect(() => {
    setMedicines(loadMedicines());
  }, []);

  /* ================= REFRESH LOCAL STORAGE ================= */

  useEffect(() => {
    const handleStorageChange = () => {
      setMedicines(loadMedicines());
    };

    window.addEventListener(
      "storage",
      handleStorageChange
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorageChange
      );
    };
  }, []);

  /* ================= DATE / GREETING ================= */

  const now = new Date();
  const hour = now.getHours();

  const formattedDate = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  let greeting = "GOOD MORNING";

  if (hour >= 12 && hour < 17) {
    greeting = "GOOD AFTERNOON";
  } else if (hour >= 17 && hour < 21) {
    greeting = "GOOD EVENING";
  } else if (hour >= 21 || hour < 5) {
    greeting = "GOOD NIGHT";
  }

  /* ================= MEDICATION CALCULATIONS ================= */

  const totalDoses = medicines.length;

  const takenCount = medicines.filter(
    (medicine) => medicine.taken
  ).length;

  const remainingDoses =
    totalDoses - takenCount;

  const adherencePercentage =
    totalDoses === 0
      ? 0
      : Math.round(
          (takenCount / totalDoses) * 100
        );

  const nextDose = medicines.find(
    (medicine) => !medicine.taken
  );

  /* ================= TOGGLE MEDICINE ================= */

  const toggleTaken = (id) => {
    const updated = medicines.map((medicine) =>
      medicine.id === id
        ? {
            ...medicine,
            taken: !medicine.taken,
          }
        : medicine
    );

    setMedicines(updated);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updated)
    );
  };

  return (
    <div className="min-h-screen bg-[#08111F] text-white">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <nav className="border-b border-white/10 bg-[#0A1724]/90 backdrop-blur-xl">

        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          {/* LOGO */}

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

          {/* NAVIGATION */}

          <div className="flex items-center gap-3">

            {/* MEDICINES */}

            <Link
              to="/medicines"
              className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-full bg-cyan-400 text-[#08111F] font-semibold hover:bg-cyan-300 transition"
            >
              <Pill size={17} />
              Medicines
            </Link>

            {/* ANALYTICS */}

            <Link
              to="/analytics"
              className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:text-cyan-400 hover:border-cyan-400/30 transition"
            >
              <BarChart3 size={17} />
              Analytics
            </Link>

            {/* AI CHAT */}

            <Link
              to="/aichat"
              className="hidden lg:flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:text-cyan-400 hover:border-cyan-400/30 transition"
            >
              <MessageCircle size={17} />
              AI Chat
            </Link>

            {/* NOTIFICATION */}

            <button
              className="relative w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center"
            >

              <Bell
                size={21}
                className="text-slate-300"
              />

              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cyan-400" />

            </button>

            {/* USER */}

            <div className="flex items-center gap-3">

              <div className="w-11 h-11 rounded-full bg-cyan-400 flex items-center justify-center">

                <UserRound
                  size={22}
                  className="text-[#08111F]"
                />

              </div>

              <div className="hidden md:block">

                <p className="font-semibold">
                  Welcome
                </p>

                <p className="text-sm text-slate-500">
                  Patient
                </p>

              </div>

            </div>

          </div>

        </div>

      </nav>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="max-w-7xl mx-auto px-6 py-12">

        {/* ===================================================
            HERO
        =================================================== */}

        <section className="mb-12">

          <p className="text-cyan-400 font-medium text-sm mb-3">
            {greeting}
          </p>

          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Your medication twin is ready.
          </h2>

          <p className="text-lg text-slate-400 mt-4">
            Track your medication schedule,
            adherence, and digital twin insights
            from one place.
          </p>

        </section>

        {/* ===================================================
            STAT CARDS
        =================================================== */}

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">

          {/* ADHERENCE */}

          <div className="rounded-2xl border border-white/10 bg-white/5 p-7">

            <div className="flex items-center justify-between mb-7">

              <div className="w-12 h-12 rounded-xl bg-cyan-400/10 flex items-center justify-center">

                <TrendingUp
                  size={23}
                  className="text-cyan-400"
                />

              </div>

              <span className="text-emerald-400 font-medium">
                +4.2%
              </span>

            </div>

            <p className="text-slate-400">
              Medication adherence
            </p>

            <h3 className="text-4xl font-bold mt-2">
              {adherencePercentage}%
            </h3>

            <div className="mt-6 h-2 bg-slate-700/60 rounded-full overflow-hidden">

              <div
                className="h-full bg-cyan-400 rounded-full transition-all duration-500"
                style={{
                  width: `${adherencePercentage}%`,
                }}
              />

            </div>

          </div>

          {/* DOSES */}

          <div className="rounded-2xl border border-white/10 bg-white/5 p-7">

            <div className="w-12 h-12 rounded-xl bg-purple-400/10 flex items-center justify-center mb-7">

              <Pill
                size={23}
                className="text-purple-400"
              />

            </div>

            <p className="text-slate-400">
              Today's doses
            </p>

            <h3 className="text-4xl font-bold mt-2">
              {takenCount} / {totalDoses}
            </h3>

            <p className="text-sm text-slate-500 mt-2">

              {remainingDoses === 0
                ? "All doses completed"
                : `${remainingDoses} dose${
                    remainingDoses === 1
                      ? ""
                      : "s"
                  } remaining`}

            </p>

          </div>

          {/* NEXT DOSE */}

          <div className="rounded-2xl border border-white/10 bg-white/5 p-7">

            <div className="w-12 h-12 rounded-xl bg-orange-400/10 flex items-center justify-center mb-7">

              <Clock3
                size={23}
                className="text-orange-400"
              />

            </div>

            <p className="text-slate-400">
              Next dose
            </p>

            <h3 className="text-3xl font-bold mt-2">

              {nextDose
                ? nextDose.time
                : "Completed"}

            </h3>

            <p className="text-sm text-slate-500 mt-2">

              {nextDose
                ? nextDose.name
                : "No doses remaining"}

            </p>

          </div>

          {/* DIGITAL TWIN */}

          <div className="rounded-2xl border border-cyan-400/30 bg-cyan-400/5 p-7">

            <div className="flex items-center justify-between mb-7">

              <div className="w-12 h-12 rounded-xl bg-cyan-400/10 flex items-center justify-center">

                <HeartPulse
                  size={23}
                  className="text-cyan-400"
                />

              </div>

              <span className="flex items-center gap-2 text-emerald-400 text-sm">

                <span className="w-2 h-2 rounded-full bg-emerald-400" />

                LIVE

              </span>

            </div>

            <p className="text-slate-400">
              Digital Twin
            </p>

            <h3 className="text-2xl font-bold mt-2">
              Synced
            </h3>

            <p className="text-sm text-slate-500 mt-2">
              Medication data synchronized
            </p>

          </div>

        </section>

        {/* ===================================================
            QUICK ACTIONS
        =================================================== */}

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">

          <Link
            to="/medicines"
            className="group rounded-2xl border border-white/10 bg-white/5 p-5 hover:border-cyan-400/30 hover:bg-cyan-400/5 transition"
          >

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-4">

                <div className="w-11 h-11 rounded-xl bg-cyan-400/10 flex items-center justify-center">

                  <Pill
                    size={20}
                    className="text-cyan-400"
                  />

                </div>

                <div>
                  <p className="font-semibold">
                    Manage Medicines
                  </p>

                  <p className="text-sm text-slate-500">
                    Add or update medications
                  </p>
                </div>

              </div>

              <ArrowRight
                size={19}
                className="text-slate-600 group-hover:text-cyan-400 transition"
              />

            </div>

          </Link>

          <Link
            to="/analytics"
            className="group rounded-2xl border border-white/10 bg-white/5 p-5 hover:border-cyan-400/30 hover:bg-cyan-400/5 transition"
          >

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-4">

                <div className="w-11 h-11 rounded-xl bg-purple-400/10 flex items-center justify-center">

                  <BarChart3
                    size={20}
                    className="text-purple-400"
                  />

                </div>

                <div>
                  <p className="font-semibold">
                    View Analytics
                  </p>

                  <p className="text-sm text-slate-500">
                    Track adherence trends
                  </p>
                </div>

              </div>

              <ArrowRight
                size={19}
                className="text-slate-600 group-hover:text-cyan-400 transition"
              />

            </div>

          </Link>

          <Link
            to="/aichat"
            className="group rounded-2xl border border-white/10 bg-white/5 p-5 hover:border-cyan-400/30 hover:bg-cyan-400/5 transition"
          >

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-4">

                <div className="w-11 h-11 rounded-xl bg-emerald-400/10 flex items-center justify-center">

                  <MessageCircle
                    size={20}
                    className="text-emerald-400"
                  />

                </div>

                <div>
                  <p className="font-semibold">
                    Ask DoseTwin AI
                  </p>

                  <p className="text-sm text-slate-500">
                    Get medication insights
                  </p>
                </div>

              </div>

              <ArrowRight
                size={19}
                className="text-slate-600 group-hover:text-cyan-400 transition"
              />

            </div>

          </Link>

        </section>

        {/* ===================================================
            LOWER SECTION
        =================================================== */}

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* MEDICATIONS */}

          <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-7">

            <div className="flex items-center justify-between mb-7">

              <div>

                <h3 className="text-2xl font-semibold">
                  Today's medication
                </h3>

                <p className="text-slate-500 mt-1">
                  {formattedDate}
                </p>

              </div>

              <Link
                to="/medicines"
                className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition"
              >
                Manage
                <ArrowRight size={17} />
              </Link>

            </div>

            {medicines.length === 0 ? (

              <div className="py-14 text-center">

                <Pill
                  size={38}
                  className="mx-auto text-slate-600 mb-4"
                />

                <h4 className="text-lg font-semibold">
                  No medicines added
                </h4>

                <p className="text-slate-500 mt-2 mb-5">
                  Add your first medicine to get started.
                </p>

                <Link
                  to="/medicines"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-cyan-400 text-[#08111F] font-semibold"
                >
                  <Pill size={17} />
                  Add Medicine
                </Link>

              </div>

            ) : (

              medicines.map((medicine) => (

                <div
                  key={medicine.id}
                  className="flex items-center justify-between gap-4 p-4 rounded-xl bg-white/5 mb-3"
                >

                  <div className="flex items-center gap-4">

                    <div className="w-11 h-11 rounded-xl bg-cyan-400/10 flex items-center justify-center">

                      <Pill
                        size={21}
                        className="text-cyan-400"
                      />

                    </div>

                    <div>

                      <p className="font-medium">
                        {medicine.name}
                      </p>

                      <p className="text-sm text-slate-500">
                        {medicine.dosage} •{" "}
                        {medicine.schedule}
                      </p>

                    </div>

                  </div>

                  <button
                    onClick={() =>
                      toggleTaken(medicine.id)
                    }
                    className={`flex items-center gap-2 text-sm font-medium ${
                      medicine.taken
                        ? "text-emerald-400"
                        : "text-orange-400"
                    }`}
                  >

                    {medicine.taken ? (
                      <>
                        <CheckCircle2 size={18} />
                        Taken
                      </>
                    ) : (
                      <>
                        <Clock3 size={18} />
                        Upcoming
                      </>
                    )}

                  </button>

                </div>

              ))

            )}

          </div>

          {/* AI INSIGHT */}

          <div className="rounded-2xl border border-cyan-400/30 bg-cyan-400/5 p-7">

            <div className="flex items-center gap-4 mb-7">

              <div className="w-12 h-12 rounded-xl bg-cyan-400/10 flex items-center justify-center">

                <ShieldCheck
                  size={23}
                  className="text-cyan-400"
                />

              </div>

              <div>

                <h3 className="text-xl font-semibold">
                  AI Health Insight
                </h3>

                <p className="text-sm text-slate-500">
                  Powered by DoseTwin
                </p>

              </div>

            </div>

            <p className="text-slate-300 leading-7">

              Your medication adherence is{" "}

              <span className="text-cyan-400 font-medium">
                {adherencePercentage}%
              </span>
              .

              {" "}You have completed{" "}

              <span className="text-emerald-400 font-medium">
                {takenCount}
              </span>{" "}

              of{" "}

              <span className="font-medium">
                {totalDoses}
              </span>{" "}

              scheduled doses today.

            </p>

            <div className="mt-7 rounded-xl border border-white/10 bg-black/10 p-5">

              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">
                Digital Twin Status
              </p>

              <p className="text-emerald-400 font-medium">
                {remainingDoses === 0
                  ? "Stable • All doses completed"
                  : "Stable • No alerts detected"}
              </p>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default Dashboard;