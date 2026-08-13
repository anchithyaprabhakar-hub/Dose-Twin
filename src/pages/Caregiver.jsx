import { useEffect, useMemo, useState } from "react";
import {
  UsersRound,
  Pill,
  CheckCircle2,
  Clock3,
  AlertCircle,
  TrendingUp,
  ShieldCheck,
  Bell,
  UserPlus,
} from "lucide-react";

const STORAGE_KEY = "dosetwin_medicines";

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

function Caregiver() {
  const [medicines, setMedicines] = useState(loadMedicines);

  /*
   * ========================================================
   * AUTOMATIC MEDICINE SYNC
   * ========================================================
   */

  useEffect(() => {
    let previousData = localStorage.getItem(STORAGE_KEY);

    const checkForChanges = () => {
      const currentData = localStorage.getItem(STORAGE_KEY);

      if (currentData !== previousData) {
        previousData = currentData;
        setMedicines(loadMedicines());
      }
    };

    const interval = setInterval(checkForChanges, 500);

    const handleStorageChange = (event) => {
      if (event.key === STORAGE_KEY) {
        previousData = event.newValue;
        setMedicines(loadMedicines());
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener(
        "storage",
        handleStorageChange
      );
    };
  }, []);

  /*
   * ========================================================
   * CALCULATIONS
   * ========================================================
   */

  const totalMedicines = medicines.length;

  const takenCount = medicines.filter(
    (medicine) => medicine.taken
  ).length;

  const remainingCount =
    totalMedicines - takenCount;

  const adherence =
    totalMedicines === 0
      ? 0
      : Math.round(
          (takenCount / totalMedicines) * 100
        );

  const pendingMedicines = medicines.filter(
    (medicine) => !medicine.taken
  );

  const caregiverStatus = useMemo(() => {
    if (totalMedicines === 0) {
      return {
        title: "Waiting for medication data",
        message:
          "No medicines have been added yet.",
        color: "text-slate-400",
        bg: "bg-slate-400/5",
        border: "border-slate-400/20",
      };
    }

    if (adherence >= 80) {
      return {
        title: "Medication routine looks stable",
        message:
          "The patient's current adherence is within the expected range.",
        color: "text-emerald-400",
        bg: "bg-emerald-400/5",
        border: "border-emerald-400/20",
      };
    }

    return {
      title: "Attention recommended",
      message:
        "Some scheduled medicines are still pending.",
      color: "text-orange-400",
      bg: "bg-orange-400/5",
      border: "border-orange-400/20",
    };
  }, [totalMedicines, adherence]);

  return (
    <div className="min-h-screen bg-[#08111F] text-white">

      <main className="max-w-[1400px] mx-auto px-6 md:px-8 py-10">

        {/* ==================================================
            HEADER
        ================================================== */}

        <section className="mb-10">

          <p className="text-cyan-400 text-sm font-medium tracking-wide mb-3">
            CAREGIVER MONITORING
          </p>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">

            <div>

              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Caregiver
              </h1>

              <p className="text-lg text-slate-400 mt-4 max-w-3xl">
                Monitor medication adherence and stay
                informed about the patient's medication routine.
              </p>

            </div>

            <button
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                px-6
                py-3
                rounded-xl
                bg-cyan-400
                text-[#06111F]
                font-semibold
                hover:bg-cyan-300
                transition
                shrink-0
              "
            >
              <UserPlus size={19} />
              Add Caregiver
            </button>

          </div>

        </section>


        {/* ==================================================
            CAREGIVER PROFILE
        ================================================== */}

        <section
          className="
            rounded-2xl
            border
            border-white/10
            bg-white/5
            p-7
            mb-6
          "
        >

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

            <div className="flex items-center gap-5">

              <div
                className="
                  w-16
                  h-16
                  rounded-2xl
                  bg-cyan-400/10
                  border
                  border-cyan-400/20
                  flex
                  items-center
                  justify-center
                "
              >

                <UsersRound
                  size={29}
                  className="text-cyan-400"
                />

              </div>

              <div>

                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Primary caregiver
                </p>

                <h2 className="text-2xl font-semibold mt-1">
                  Family Caregiver
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Medication monitoring enabled
                </p>

              </div>

            </div>

            <div className="flex items-center gap-3">

              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />

              <span className="text-sm text-emerald-400 font-medium">
                Monitoring active
              </span>

            </div>

          </div>

        </section>


        {/* ==================================================
            OVERVIEW
        ================================================== */}

        <section
          className="
            grid
            grid-cols-1
            sm:grid-cols-2
            xl:grid-cols-4
            gap-6
            mb-6
          "
        >

          {/* ADHERENCE */}

          <div
            className="
              rounded-2xl
              border
              border-cyan-400/20
              bg-cyan-400/5
              p-7
            "
          >

            <div className="flex items-center justify-between mb-6">

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

                <TrendingUp
                  size={23}
                  className="text-cyan-400"
                />

              </div>

              <span className="text-xs text-emerald-400 font-medium">
                LIVE
              </span>

            </div>

            <p className="text-slate-400">
              Adherence
            </p>

            <h2 className="text-4xl font-bold mt-2">
              {adherence}%
            </h2>

            <div className="mt-5 h-2 bg-slate-700/60 rounded-full overflow-hidden">

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

          </div>


          {/* TOTAL MEDICINES */}

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
                w-12
                h-12
                rounded-xl
                bg-purple-400/10
                flex
                items-center
                justify-center
                mb-6
              "
            >

              <Pill
                size={23}
                className="text-purple-400"
              />

            </div>

            <p className="text-slate-400">
              Active medicines
            </p>

            <h2 className="text-4xl font-bold mt-2">
              {totalMedicines}
            </h2>

            <p className="text-sm text-slate-500 mt-2">
              From Medicines page
            </p>

          </div>


          {/* TAKEN */}

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
                w-12
                h-12
                rounded-xl
                bg-emerald-400/10
                flex
                items-center
                justify-center
                mb-6
              "
            >

              <CheckCircle2
                size={23}
                className="text-emerald-400"
              />

            </div>

            <p className="text-slate-400">
              Doses taken
            </p>

            <h2 className="text-4xl font-bold mt-2 text-emerald-400">
              {takenCount}
            </h2>

            <p className="text-sm text-slate-500 mt-2">
              Completed today
            </p>

          </div>


          {/* REMAINING */}

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
                w-12
                h-12
                rounded-xl
                bg-orange-400/10
                flex
                items-center
                justify-center
                mb-6
              "
            >

              <Clock3
                size={23}
                className="text-orange-400"
              />

            </div>

            <p className="text-slate-400">
              Pending doses
            </p>

            <h2 className="text-4xl font-bold mt-2 text-orange-400">
              {remainingCount}
            </h2>

            <p className="text-sm text-slate-500 mt-2">
              Require attention
            </p>

          </div>

        </section>


        {/* ==================================================
            STATUS + ALERTS
        ================================================== */}

        <section
          className="
            grid
            grid-cols-1
            lg:grid-cols-3
            gap-6
            mb-6
          "
        >

          {/* STATUS */}

          <div
            className={`
              lg:col-span-2
              rounded-2xl
              border
              ${caregiverStatus.border}
              ${caregiverStatus.bg}
              p-7
            `}
          >

            <div className="flex items-start gap-5">

              <div
                className="
                  w-12
                  h-12
                  rounded-xl
                  bg-white/5
                  flex
                  items-center
                  justify-center
                  shrink-0
                "
              >

                <ShieldCheck
                  size={24}
                  className={caregiverStatus.color}
                />

              </div>

              <div>

                <p className="text-sm text-slate-500">
                  Medication status
                </p>

                <h2
                  className={`text-2xl font-bold mt-1 ${caregiverStatus.color}`}
                >
                  {caregiverStatus.title}
                </h2>

                <p className="text-slate-400 mt-3 leading-6">
                  {caregiverStatus.message}
                </p>

              </div>

            </div>

          </div>


          {/* ALERT */}

          <div
            className="
              rounded-2xl
              border
              border-orange-400/20
              bg-orange-400/5
              p-7
            "
          >

            <div className="flex items-center justify-between mb-5">

              <div
                className="
                  w-12
                  h-12
                  rounded-xl
                  bg-orange-400/10
                  flex
                  items-center
                  justify-center
                "
              >

                <Bell
                  size={23}
                  className="text-orange-400"
                />

              </div>

              {pendingMedicines.length > 0 && (
                <span
                  className="
                    px-3
                    py-1
                    rounded-full
                    bg-orange-400/10
                    text-orange-400
                    text-xs
                    font-medium
                  "
                >
                  {pendingMedicines.length} pending
                </span>
              )}

            </div>

            <p className="text-slate-400">
              Caregiver alerts
            </p>

            <h2 className="text-2xl font-bold mt-2">
              {pendingMedicines.length === 0
                ? "No alerts"
                : "Attention needed"}
            </h2>

            <p className="text-sm text-slate-500 mt-3 leading-6">
              {pendingMedicines.length === 0
                ? "All currently scheduled medicines have been marked as taken."
                : `${pendingMedicines.length} medicine${
                    pendingMedicines.length === 1
                      ? ""
                      : "s"
                  } still pending.`}
            </p>

          </div>

        </section>


        {/* ==================================================
            MEDICATION MONITORING
        ================================================== */}

        <section
          className="
            rounded-2xl
            border
            border-white/10
            bg-white/5
            p-7
          "
        >

          <div className="mb-8">

            <h2 className="text-2xl font-semibold">
              Medication monitoring
            </h2>

            <p className="text-slate-500 mt-1">
              Live medication status from the patient's Medicines page.
            </p>

          </div>


          {medicines.length === 0 ? (

            <div className="py-14 text-center">

              <Pill
                size={40}
                className="mx-auto text-slate-600 mb-4"
              />

              <h3 className="text-lg font-semibold">
                No medicines available
              </h3>

              <p className="text-slate-500 mt-2">
                Add a medicine from the Medicines page.
              </p>

            </div>

          ) : (

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {medicines.map((medicine) => (

                <div
                  key={medicine.id}
                  className="
                    rounded-xl
                    border
                    border-white/10
                    bg-white/5
                    p-5
                  "
                >

                  <div className="flex items-center justify-between gap-4">

                    <div className="flex items-center gap-4">

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

                      <div>

                        <h3 className="font-semibold">
                          {medicine.name}
                        </h3>

                        <p className="text-sm text-slate-500 mt-1">
                          {medicine.dosage}
                          {medicine.schedule
                            ? ` · ${medicine.schedule}`
                            : ""}
                        </p>

                      </div>

                    </div>


                    {medicine.taken ? (

                      <span
                        className="
                          flex
                          items-center
                          gap-2
                          text-emerald-400
                          text-sm
                          font-medium
                          shrink-0
                        "
                      >

                        <CheckCircle2 size={17} />

                        Taken

                      </span>

                    ) : (

                      <span
                        className="
                          flex
                          items-center
                          gap-2
                          text-orange-400
                          text-sm
                          font-medium
                          shrink-0
                        "
                      >

                        <AlertCircle size={17} />

                        Pending

                      </span>

                    )}

                  </div>


                  <div
                    className="
                      mt-5
                      pt-4
                      border-t
                      border-white/10
                      flex
                      items-center
                      justify-between
                      text-sm
                    "
                  >

                    <span className="text-slate-500">
                      Scheduled time
                    </span>

                    <span className="text-slate-300">
                      {medicine.time || "Not specified"}
                    </span>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>


        {/* ==================================================
            SYNC INDICATOR
        ================================================== */}

        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-600">

          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />

          Caregiver monitoring automatically synchronized

        </div>

      </main>

    </div>
  );
}

export default Caregiver;