import { useEffect, useMemo, useState } from "react";

import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  HeartPulse,
  Pill,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

import { Link } from "react-router-dom";

const STORAGE_KEY = "dosetwin_medicines";

/* =========================================================
   LOAD MEDICINES
========================================================= */

function loadMedicines() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Could not load medicines:", error);
    return [];
  }
}

/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard() {
  const [medicines, setMedicines] = useState(loadMedicines);

  /* =======================================================
     SYNC WITH MEDICINES PAGE
  ======================================================= */

  useEffect(() => {
    const syncMedicines = () => {
      setMedicines(loadMedicines());
    };

    // Other browser tabs/windows
    window.addEventListener("storage", syncMedicines);

    // Same-tab custom event
    window.addEventListener(
      "dosetwin-medicines-updated",
      syncMedicines
    );

    // Safety refresh
    const interval = setInterval(syncMedicines, 500);

    return () => {
      window.removeEventListener(
        "storage",
        syncMedicines
      );

      window.removeEventListener(
        "dosetwin-medicines-updated",
        syncMedicines
      );

      clearInterval(interval);
    };
  }, []);

  /* =======================================================
     DATE / GREETING
  ======================================================= */

  const now = new Date();
  const hour = now.getHours();

  let greeting = "GOOD MORNING";

  if (hour >= 12 && hour < 17) {
    greeting = "GOOD AFTERNOON";
  } else if (hour >= 17 && hour < 21) {
    greeting = "GOOD EVENING";
  } else if (hour >= 21 || hour < 5) {
    greeting = "GOOD NIGHT";
  }

  const formattedDate = now.toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      month: "long",
      day: "numeric",
    }
  );

  /* =======================================================
     MEDICATION CALCULATIONS
  ======================================================= */

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

  /* =======================================================
     NEXT DOSE
  ======================================================= */

  const nextDose = useMemo(() => {
    const upcoming = medicines.filter(
      (medicine) => !medicine.taken
    );

    if (upcoming.length === 0) {
      return null;
    }

    return upcoming[0];
  }, [medicines]);

  /* =======================================================
     TOGGLE DOSE
  ======================================================= */

  const toggleTaken = (id) => {
    const updated = medicines.map(
      (medicine) =>
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

    window.dispatchEvent(
      new Event("dosetwin-medicines-updated")
    );
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#08111F] text-white">

      <main className="max-w-[1400px] mx-auto px-8 py-12">

        {/* =================================================
            HERO
        ================================================= */}

        <section className="mb-12">

          <p className="text-cyan-400 font-medium text-sm mb-3">
            {greeting}
          </p>

          <h1 className="text-5xl font-bold tracking-tight">
            Your medication twin is ready.
          </h1>

          <p className="text-lg text-slate-400 mt-4 max-w-3xl">
            Track your medication schedule,
            adherence, and digital twin insights
            from one place.
          </p>

        </section>


        {/* =================================================
            STAT CARDS
        ================================================= */}

        <section
          className="
            grid
            grid-cols-1
            sm:grid-cols-2
            xl:grid-cols-4
            gap-6
            mb-10
          "
        >

          {/* ADHERENCE */}

          <div
            className="
              rounded-2xl
              border
              border-white/10
              bg-white/5
              p-7
            "
          >

            <div className="flex items-center justify-between mb-7">

              <div
                className="
                  w-12 h-12
                  rounded-xl
                  bg-cyan-400/10
                  flex items-center justify-center
                "
              >
                <TrendingUp
                  size={23}
                  className="text-cyan-400"
                />
              </div>

              <span className="text-emerald-400 text-sm font-medium">
                LIVE
              </span>

            </div>

            <p className="text-slate-400">
              Medication adherence
            </p>

            <h2 className="text-4xl font-bold mt-2">
              {adherencePercentage}%
            </h2>

            <div className="mt-6 h-2 bg-slate-700/60 rounded-full overflow-hidden">

              <div
                className="
                  h-full
                  bg-cyan-400
                  rounded-full
                  transition-all
                  duration-500
                "
                style={{
                  width: `${adherencePercentage}%`,
                }}
              />

            </div>

          </div>


          {/* DOSES */}

          <div
            className="
              rounded-2xl
              border
              border-white/10
              bg-white/5
              p-7
            "
          >

            <div
              className="
                w-12 h-12
                rounded-xl
                bg-purple-400/10
                flex items-center justify-center
                mb-7
              "
            >
              <Pill
                size={23}
                className="text-purple-400"
              />
            </div>

            <p className="text-slate-400">
              Today's doses
            </p>

            <h2 className="text-4xl font-bold mt-2">
              {takenCount} / {totalDoses}
            </h2>

            <p className="text-sm text-slate-500 mt-2">
              {totalDoses === 0
                ? "No medicines scheduled"
                : remainingDoses === 0
                ? "All doses completed"
                : `${remainingDoses} dose${
                    remainingDoses === 1
                      ? ""
                      : "s"
                  } remaining`}
            </p>

          </div>


          {/* NEXT DOSE */}

          <div
            className="
              rounded-2xl
              border
              border-white/10
              bg-white/5
              p-7
            "
          >

            <div
              className="
                w-12 h-12
                rounded-xl
                bg-orange-400/10
                flex items-center justify-center
                mb-7
              "
            >
              <Clock3
                size={23}
                className="text-orange-400"
              />
            </div>

            <p className="text-slate-400">
              Next dose
            </p>

            <h2 className="text-3xl font-bold mt-2">
              {nextDose
                ? nextDose.time || "Scheduled"
                : totalDoses === 0
                ? "No medicines"
                : "Completed"}
            </h2>

            <p className="text-sm text-slate-500 mt-2">
              {nextDose
                ? nextDose.name
                : totalDoses === 0
                ? "Add a medicine to begin"
                : "No doses remaining"}
            </p>

          </div>


          {/* DIGITAL TWIN */}

          <div
            className="
              rounded-2xl
              border
              border-cyan-400/30
              bg-cyan-400/5
              p-7
            "
          >

            <div className="flex items-center justify-between mb-7">

              <div
                className="
                  w-12 h-12
                  rounded-xl
                  bg-cyan-400/10
                  flex items-center justify-center
                "
              >
                <HeartPulse
                  size={23}
                  className="text-cyan-400"
                />
              </div>

              <span
                className="
                  flex items-center gap-2
                  text-emerald-400
                  text-sm
                "
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                LIVE
              </span>

            </div>

            <p className="text-slate-400">
              Digital Twin
            </p>

            <h2 className="text-2xl font-bold mt-2">
              {totalDoses === 0
                ? "Waiting"
                : "Synced"}
            </h2>

            <p className="text-sm text-slate-500 mt-2">
              {totalDoses === 0
                ? "Waiting for medication data"
                : "Medication data synchronized"}
            </p>

          </div>

        </section>


        {/* =================================================
            QUICK ACTIONS
        ================================================= */}

        <section
          className="
            grid
            grid-cols-1
            md:grid-cols-3
            gap-5
            mb-10
          "
        >

          <Link
            to="/medicines"
            className="
              group
              rounded-2xl
              border
              border-white/10
              bg-white/5
              p-6
              hover:bg-white/[0.07]
              transition
            "
          >

            <div className="flex items-center justify-between">

              <div>

                <div
                  className="
                    w-11 h-11
                    rounded-xl
                    bg-cyan-400/10
                    flex items-center justify-center
                    mb-5
                  "
                >
                  <Pill
                    size={21}
                    className="text-cyan-400"
                  />
                </div>

                <h3 className="text-lg font-semibold">
                  Manage Medicines
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Add or update medications
                </p>

              </div>

              <ArrowRight
                size={20}
                className="
                  text-slate-500
                  group-hover:text-cyan-400
                  group-hover:translate-x-1
                  transition
                "
              />

            </div>

          </Link>


          <Link
            to="/analytics"
            className="
              group
              rounded-2xl
              border
              border-white/10
              bg-white/5
              p-6
              hover:bg-white/[0.07]
              transition
            "
          >

            <div className="flex items-center justify-between">

              <div>

                <div
                  className="
                    w-11 h-11
                    rounded-xl
                    bg-purple-400/10
                    flex items-center justify-center
                    mb-5
                  "
                >
                  <TrendingUp
                    size={21}
                    className="text-purple-400"
                  />
                </div>

                <h3 className="text-lg font-semibold">
                  View Analytics
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Track adherence trends
                </p>

              </div>

              <ArrowRight
                size={20}
                className="
                  text-slate-500
                  group-hover:text-purple-400
                  group-hover:translate-x-1
                  transition
                "
              />

            </div>

          </Link>


          <Link
            to="/aichat"
            className="
              group
              rounded-2xl
              border
              border-white/10
              bg-white/5
              p-6
              hover:bg-white/[0.07]
              transition
            "
          >

            <div className="flex items-center justify-between">

              <div>

                <div
                  className="
                    w-11 h-11
                    rounded-xl
                    bg-emerald-400/10
                    flex items-center justify-center
                    mb-5
                  "
                >
                  <ShieldCheck
                    size={21}
                    className="text-emerald-400"
                  />
                </div>

                <h3 className="text-lg font-semibold">
                  Ask DoseTwin AI
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Get medication insights
                </p>

              </div>

              <ArrowRight
                size={20}
                className="
                  text-slate-500
                  group-hover:text-emerald-400
                  group-hover:translate-x-1
                  transition
                "
              />

            </div>

          </Link>

        </section>


        {/* =================================================
            TODAY'S MEDICATION
        ================================================= */}

        <section
          className="
            grid
            grid-cols-1
            lg:grid-cols-3
            gap-6
          "
        >

          <div
            className="
              lg:col-span-2
              rounded-2xl
              border
              border-white/10
              bg-white/5
              p-7
            "
          >

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
                className="
                  flex items-center gap-2
                  text-cyan-400
                  hover:text-cyan-300
                "
              >
                Manage
                <ArrowRight size={17} />
              </Link>

            </div>


            {medicines.length === 0 ? (

              <div className="py-12 text-center">

                <Pill
                  size={38}
                  className="mx-auto text-slate-600 mb-4"
                />

                <p className="text-slate-400">
                  No medicines added yet.
                </p>

                <Link
                  to="/medicines"
                  className="
                    inline-flex
                    items-center
                    gap-2
                    mt-5
                    px-5
                    py-3
                    rounded-xl
                    bg-cyan-400
                    text-slate-950
                    font-medium
                    hover:bg-cyan-300
                    transition
                  "
                >
                  Add medicine
                  <ArrowRight size={17} />
                </Link>

              </div>

            ) : (

              medicines.map((medicine) => (

                <div
                  key={medicine.id}
                  className="
                    flex
                    items-center
                    justify-between
                    gap-4
                    p-4
                    rounded-xl
                    bg-white/5
                    mb-3
                  "
                >

                  <div className="flex items-center gap-4">

                    <div
                      className="
                        w-11 h-11
                        rounded-xl
                        bg-cyan-400/10
                        flex items-center justify-center
                      "
                    >
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
                        {medicine.dosage}
                        {" • "}
                        {medicine.schedule}
                        {medicine.time
                          ? ` • ${medicine.time}`
                          : ""}
                      </p>

                    </div>

                  </div>


                  <button
                    type="button"
                    onClick={() =>
                      toggleTaken(medicine.id)
                    }
                    className={`
                      flex
                      items-center
                      gap-2
                      text-sm
                      font-medium
                      ${
                        medicine.taken
                          ? "text-emerald-400"
                          : "text-orange-400"
                      }
                    `}
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


          {/* =================================================
              AI INSIGHT
          ================================================= */}

          <div
            className="
              rounded-2xl
              border
              border-cyan-400/30
              bg-cyan-400/5
              p-7
            "
          >

            <div
              className="
                flex
                items-center
                gap-4
                mb-7
              "
            >

              <div
                className="
                  w-12 h-12
                  rounded-xl
                  bg-cyan-400/10
                  flex items-center justify-center
                "
              >
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

            {totalDoses === 0 ? (

              <p className="text-slate-300 leading-7">
                Add your medications to start
                generating personalized adherence
                insights.
              </p>

            ) : (

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

            )}


            <div
              className="
                mt-7
                rounded-xl
                border
                border-white/10
                bg-black/10
                p-5
              "
            >

              <p
                className="
                  text-xs
                  text-slate-500
                  uppercase
                  tracking-wider
                  mb-2
                "
              >
                Digital Twin Status
              </p>

              <p
                className={
                  totalDoses === 0
                    ? "text-slate-400 font-medium"
                    : remainingDoses === 0
                    ? "text-emerald-400 font-medium"
                    : "text-cyan-400 font-medium"
                }
              >
                {totalDoses === 0
                  ? "Waiting • Add medication data"
                  : remainingDoses === 0
                  ? "Stable • All doses completed"
                  : "Active • Medication tracking enabled"}
              </p>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default Dashboard;