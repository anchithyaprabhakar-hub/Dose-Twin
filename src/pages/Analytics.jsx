import { useEffect, useMemo, useState } from "react";

import {
  Activity,
  BarChart3,
  CheckCircle2,
  Clock3,
  Pill,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

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
    console.error(
      "Could not load medicines:",
      error
    );

    return [];
  }
}


/* =========================================================
   ANALYTICS
========================================================= */

function Analytics() {
  const [medicines, setMedicines] = useState(
    loadMedicines
  );


  /* =======================================================
     AUTOMATIC MEDICINE SYNC

     Analytics automatically watches the same localStorage
     used by the Medicines page.

     No manual changes are required in Medicines.jsx.
  ======================================================= */

  useEffect(() => {
    let previousData =
      localStorage.getItem(STORAGE_KEY);

    const checkForChanges = () => {
      const currentData =
        localStorage.getItem(STORAGE_KEY);

      if (currentData !== previousData) {
        previousData = currentData;

        setMedicines(loadMedicines());
      }
    };

    /*
      Check for changes every 500ms.
    */

    const interval = setInterval(
      checkForChanges,
      500
    );


    /*
      Also detect changes from another browser tab.
    */

    const handleStorageChange = (event) => {
      if (event.key === STORAGE_KEY) {
        previousData = event.newValue;

        setMedicines(loadMedicines());
      }
    };

    window.addEventListener(
      "storage",
      handleStorageChange
    );


    return () => {
      clearInterval(interval);

      window.removeEventListener(
        "storage",
        handleStorageChange
      );
    };
  }, []);


  /* =======================================================
     CALCULATIONS
  ======================================================= */

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

  const remainingPercentage =
    totalMedicines === 0
      ? 0
      : Math.round(
          (remainingCount / totalMedicines) * 100
        );


  /* =======================================================
     SCHEDULE DATA
  ======================================================= */

  const scheduleData = useMemo(() => {
    const schedules = {
      Morning: 0,
      Afternoon: 0,
      Evening: 0,
      Night: 0,
    };

    medicines.forEach((medicine) => {
      if (
        schedules[medicine.schedule] !==
        undefined
      ) {
        schedules[medicine.schedule]++;
      }
    });

    return schedules;
  }, [medicines]);


  const maxScheduleValue = Math.max(
    ...Object.values(scheduleData),
    1
  );


  return (
    <div className="min-h-screen bg-[#08111F] text-white">

      <main className="max-w-[1400px] mx-auto px-6 md:px-8 py-10">

        {/* =================================================
            HEADER
        ================================================= */}

        <section className="mb-10">

          <p className="text-cyan-400 text-sm font-medium tracking-wide mb-3">
            HEALTH ANALYTICS
          </p>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Medication analytics
          </h1>

          <p className="text-lg text-slate-400 mt-4 max-w-3xl">
            Monitor your medication adherence,
            dose completion, and schedule patterns.
          </p>

        </section>


        {/* =================================================
            OVERVIEW CARDS
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
              border-cyan-400/20
              bg-cyan-400/5
              p-7
            "
          >

            <div className="flex items-center justify-between mb-7">

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

              <span className="text-emerald-400 text-sm font-medium">
                Live
              </span>

            </div>

            <p className="text-slate-400">
              Overall adherence
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
                mb-7
              "
            >

              <Pill
                size={23}
                className="text-purple-400"
              />

            </div>

            <p className="text-slate-400">
              Total medicines
            </p>

            <h2 className="text-4xl font-bold mt-2">
              {totalMedicines}
            </h2>

            <p className="text-sm text-slate-500 mt-2">
              Active medications
            </p>

          </div>


          {/* COMPLETED */}

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
                mb-7
              "
            >

              <CheckCircle2
                size={23}
                className="text-emerald-400"
              />

            </div>

            <p className="text-slate-400">
              Doses completed
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
                mb-7
              "
            >

              <Clock3
                size={23}
                className="text-orange-400"
              />

            </div>

            <p className="text-slate-400">
              Doses remaining
            </p>

            <h2 className="text-4xl font-bold mt-2 text-orange-400">
              {remainingCount}
            </h2>

            <p className="text-sm text-slate-500 mt-2">
              Still upcoming
            </p>

          </div>

        </section>


        {/* =================================================
            MAIN ANALYTICS
        ================================================= */}

        <section
          className="
            grid
            grid-cols-1
            lg:grid-cols-3
            gap-6
            mb-10
          "
        >

          {/* ADHERENCE OVERVIEW */}

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

            <div className="flex items-center justify-between mb-8">

              <div>

                <h2 className="text-2xl font-semibold">
                  Adherence overview
                </h2>

                <p className="text-slate-500 mt-1">
                  Today's medication performance
                </p>

              </div>

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

                <BarChart3
                  size={23}
                  className="text-cyan-400"
                />

              </div>

            </div>


            <div
              className="
                flex
                flex-col
                md:flex-row
                items-center
                gap-10
              "
            >

              {/* CIRCULAR ADHERENCE */}

              <div
                className="
                  relative
                  w-48
                  h-48
                  rounded-full
                  flex
                  items-center
                  justify-center
                  shrink-0
                "
                style={{
                  background: `conic-gradient(
                    #22d3ee ${adherence * 3.6}deg,
                    #1e293b ${adherence * 3.6}deg
                  )`,
                }}
              >

                <div
                  className="
                    w-36
                    h-36
                    rounded-full
                    bg-[#101c2d]
                    flex
                    flex-col
                    items-center
                    justify-center
                  "
                >

                  <span className="text-4xl font-bold">
                    {adherence}%
                  </span>

                  <span className="text-sm text-slate-500">
                    adherence
                  </span>

                </div>

              </div>


              {/* BREAKDOWN */}

              <div className="flex-1 w-full space-y-6">

                {/* COMPLETED */}

                <div>

                  <div className="flex justify-between mb-2">

                    <span className="text-slate-400">
                      Completed
                    </span>

                    <span className="text-emerald-400">
                      {takenCount}
                    </span>

                  </div>

                  <div className="h-2 bg-slate-700/60 rounded-full overflow-hidden">

                    <div
                      className="
                        h-full
                        bg-emerald-400
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


                {/* REMAINING */}

                <div>

                  <div className="flex justify-between mb-2">

                    <span className="text-slate-400">
                      Remaining
                    </span>

                    <span className="text-orange-400">
                      {remainingCount}
                    </span>

                  </div>

                  <div className="h-2 bg-slate-700/60 rounded-full overflow-hidden">

                    <div
                      className="
                        h-full
                        bg-orange-400
                        rounded-full
                        transition-all
                        duration-500
                      "
                      style={{
                        width: `${remainingPercentage}%`,
                      }}
                    />

                  </div>

                </div>

              </div>

            </div>

          </div>


          {/* DIGITAL TWIN STATUS */}

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
                w-12
                h-12
                rounded-xl
                bg-cyan-400/10
                flex
                items-center
                justify-center
                mb-7
              "
            >

              <Activity
                size={23}
                className="text-cyan-400"
              />

            </div>

            <p className="text-slate-400">
              Digital Twin status
            </p>

            <h2 className="text-2xl font-bold mt-2">
              {totalMedicines === 0
                ? "Waiting"
                : adherence >= 80
                ? "Stable"
                : "Needs attention"}
            </h2>

            <p className="text-sm text-slate-500 mt-3 leading-6">

              {totalMedicines === 0
                ? "Add medicines to begin generating medication analytics."
                : adherence >= 80
                ? "Your current medication adherence is within a stable range."
                : "Your current adherence has fallen below the preferred level."}

            </p>


            <div
              className={`
                mt-7
                rounded-xl
                border
                p-4
                ${
                  totalMedicines === 0
                    ? "border-slate-400/20 bg-slate-400/5"
                    : adherence >= 80
                    ? "border-emerald-400/20 bg-emerald-400/5"
                    : "border-orange-400/20 bg-orange-400/5"
                }
              `}
            >

              <div className="flex items-center gap-3">

                <span
                  className={`
                    w-2
                    h-2
                    rounded-full
                    ${
                      totalMedicines === 0
                        ? "bg-slate-400"
                        : adherence >= 80
                        ? "bg-emerald-400"
                        : "bg-orange-400"
                    }
                  `}
                />

                <span
                  className={`
                    text-sm
                    font-medium
                    ${
                      totalMedicines === 0
                        ? "text-slate-400"
                        : adherence >= 80
                        ? "text-emerald-400"
                        : "text-orange-400"
                    }
                  `}
                >

                  {totalMedicines === 0
                    ? "No medication data"
                    : "System synchronized"}

                </span>

              </div>

            </div>

          </div>

        </section>


        {/* =================================================
            MEDICATION SCHEDULE + MEDICINE STATUS
        ================================================= */}

        <section
          className="
            grid
            grid-cols-1
            lg:grid-cols-2
            gap-6
          "
        >

          {/* MEDICATION SCHEDULE */}

          <div
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
                Medication schedule
              </h2>

              <p className="text-slate-500 mt-1">
                Distribution of medicines throughout the day
              </p>

            </div>


            <div className="space-y-6">

              {Object.entries(
                scheduleData
              ).map(
                ([schedule, value]) => (

                  <div key={schedule}>

                    <div className="flex justify-between mb-2">

                      <span className="text-slate-300">
                        {schedule}
                      </span>

                      <span className="text-slate-500">
                        {value} medicine
                        {value === 1
                          ? ""
                          : "s"}
                      </span>

                    </div>

                    <div
                      className="
                        h-3
                        bg-slate-700/60
                        rounded-full
                        overflow-hidden
                      "
                    >

                      <div
                        className="
                          h-full
                          bg-gradient-to-r
                          from-cyan-400
                          to-teal-400
                          rounded-full
                          transition-all
                          duration-500
                        "
                        style={{
                          width: `${
                            (value /
                              maxScheduleValue) *
                            100
                          }%`,
                        }}
                      />

                    </div>

                  </div>

                )
              )}

            </div>

          </div>


          {/* MEDICINE STATUS */}

          <div
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
                Medicine status
              </h2>

              <p className="text-slate-500 mt-1">
                Current adherence by medicine
              </p>

            </div>


            {medicines.length === 0 ? (

              <div className="text-center py-10">

                <Pill
                  size={36}
                  className="
                    mx-auto
                    text-slate-600
                    mb-3
                  "
                />

                <p className="text-slate-500">
                  No medicines available.
                </p>

              </div>

            ) : (

              <div className="space-y-4">

                {medicines.map(
                  (medicine) => (

                    <div
                      key={medicine.id}
                      className="
                        flex
                        items-center
                        justify-between
                        gap-4
                        rounded-xl
                        bg-white/5
                        p-4
                      "
                    >

                      <div className="flex items-center gap-4">

                        <div
                          className="
                            w-10
                            h-10
                            rounded-lg
                            bg-cyan-400/10
                            flex
                            items-center
                            justify-center
                            shrink-0
                          "
                        >

                          <Pill
                            size={19}
                            className="text-cyan-400"
                          />

                        </div>

                        <div>

                          <p className="font-medium">
                            {medicine.name}
                          </p>

                          <p className="text-xs text-slate-500">
                            {medicine.dosage}
                            {" · "}
                            {medicine.schedule}
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
                            shrink-0
                          "
                        >

                          <CheckCircle2
                            size={17}
                          />

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
                            shrink-0
                          "
                        >

                          <AlertCircle
                            size={17}
                          />

                          Pending

                        </span>

                      )}

                    </div>

                  )
                )}

              </div>

            )}

          </div>

        </section>


        {/* =================================================
            LIVE SYNC MESSAGE
        ================================================= */}

        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-600">

          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />

          Analytics automatically synchronized with your medicines

        </div>

      </main>

    </div>
  );
}

export default Analytics;