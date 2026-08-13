import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Battery,
  CheckCircle2,
  Clock3,
  Cpu,
  History,
  Pill,
  RefreshCw,
  Wifi,
} from "lucide-react";

const STORAGE_KEY = "dosetwin_medicines";
const MEDICINE_EVENT = "dosetwin-medicines-updated";


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

    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch (error) {
    console.error(
      "Could not load medicines:",
      error
    );

    return [];
  }
}


/* =========================================================
   FORMAT TIME
========================================================= */

function formatTime(time) {
  if (!time) {
    return "Not set";
  }

  /*
    Already formatted:
    "8:00 AM"
  */

  if (
    time.includes("AM") ||
    time.includes("PM")
  ) {
    return time;
  }

  /*
    Convert:
    "08:00" → "8:00 AM"
  */

  const parts = time.split(":");

  if (parts.length !== 2) {
    return time;
  }

  let hour = Number(parts[0]);
  const minute = parts[1];

  if (Number.isNaN(hour)) {
    return time;
  }

  const period =
    hour >= 12 ? "PM" : "AM";

  hour = hour % 12 || 12;

  return `${hour}:${minute} ${period}`;
}


/* =========================================================
   GET PRIMARY TIME
========================================================= */

function getMedicineTime(medicine) {
  if (
    Array.isArray(medicine.doseTimes) &&
    medicine.doseTimes.length > 0 &&
    medicine.doseTimes[0]
  ) {
    return formatTime(
      medicine.doseTimes[0]
    );
  }

  if (medicine.time) {
    return formatTime(
      medicine.time
    );
  }

  return "Not set";
}


/* =========================================================
   GET STOCK
========================================================= */

function getStock(medicine) {
  const stock = Number(
    medicine.stock
  );

  if (Number.isNaN(stock)) {
    return 0;
  }

  return Math.max(0, stock);
}


/* =========================================================
   GET LOW STOCK LIMIT
========================================================= */

function getLowStockLimit(medicine) {
  const limit = Number(
    medicine.lowStockAlert
  );

  if (Number.isNaN(limit)) {
    return 5;
  }

  return Math.max(0, limit);
}


/* =========================================================
   LOW STOCK CHECK
========================================================= */

function isLowStock(medicine) {
  const stock = getStock(
    medicine
  );

  const lowStockLimit =
    getLowStockLimit(
      medicine
    );

  return stock <= lowStockLimit;
}


/* =========================================================
   MAIN COMPONENT
========================================================= */

function DigitalTwin() {
  const [medicines, setMedicines] =
    useState(loadMedicines);

  const [lastSync, setLastSync] =
    useState("Just now");


  /* =======================================================
     AUTOMATIC MEDICINE SYNC
  ======================================================= */

  useEffect(() => {
    const syncMedicines = () => {
      setMedicines(
        loadMedicines()
      );

      setLastSync(
        "Just now"
      );
    };


    /*
      Same browser tab.

      Medicines.jsx dispatches:

      dosetwin-medicines-updated
    */

    window.addEventListener(
      MEDICINE_EVENT,
      syncMedicines
    );


    /*
      Different browser tabs.
    */

    window.addEventListener(
      "storage",
      syncMedicines
    );


    /*
      Also refresh once when component mounts.
    */

    syncMedicines();


    return () => {
      window.removeEventListener(
        MEDICINE_EVENT,
        syncMedicines
      );

      window.removeEventListener(
        "storage",
        syncMedicines
      );
    };
  }, []);


  /* =======================================================
     DEVICE INFORMATION
  ======================================================= */

  const device = {
    name: "DoseTwin Dispenser",
    id: "DT-100 · DT100-8842-KJ",
    network: "Home-5G",
    battery: "78%",
    firmware: "v2.4.1",
  };


  /* =======================================================
     CALCULATE LOW STOCK MEDICINES
  ======================================================= */

  const lowStockMedicines =
    useMemo(() => {
      return medicines.filter(
        (medicine) =>
          isLowStock(medicine)
      );
    }, [medicines]);


  /* =======================================================
     RECENT ACTIVITY
  ======================================================= */

  const recentActivity =
    useMemo(() => {
      return medicines
        .slice(0, 4)
        .map((medicine) => ({
          name: medicine.name,
          taken: medicine.taken,
          time: getMedicineTime(
            medicine
          ),
        }));
    }, [medicines]);


  /* =======================================================
     MANUAL SYNC
  ======================================================= */

  const handleSync = () => {
    setMedicines(
      loadMedicines()
    );

    setLastSync(
      "Just now"
    );
  };


  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#08111F] text-white">

      <main className="max-w-[1400px] mx-auto px-6 md:px-8 py-10">


        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <section className="mb-8">

          <p className="text-cyan-400 text-sm font-medium mb-3">
            DIGITAL MEDICATION MODEL
          </p>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">

            <div>

              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Digital Twin
              </h1>

              <p className="text-lg text-slate-400 mt-3 max-w-3xl">
                A live virtual model of your dispenser,
                mirrored from your medicines, stock levels,
                and dose history.
              </p>

            </div>


            <button
              onClick={handleSync}
              className="
                flex
                items-center
                justify-center
                gap-2
                px-5
                py-3
                rounded-xl
                border
                border-white/10
                bg-white/5
                hover:bg-white/10
                text-slate-300
                transition
              "
            >

              <RefreshCw size={17} />

              Sync now

            </button>

          </div>

        </section>


        {/* =================================================
            DISPENSER STATUS
        ================================================= */}

        <section
          className="
            rounded-3xl
            border
            border-white/10
            bg-[#0D1B30]
            p-6
            md:p-7
            mb-8
          "
        >

          <div
            className="
              flex
              flex-col
              xl:flex-row
              xl:items-center
              xl:justify-between
              gap-7
            "
          >

            {/* DEVICE */}

            <div className="flex items-center gap-4">

              <div
                className="
                  w-12
                  h-12
                  rounded-full
                  bg-cyan-400/10
                  flex
                  items-center
                  justify-center
                "
              >

                <span
                  className="
                    w-4
                    h-4
                    rounded-full
                    bg-cyan-400
                    shadow-[0_0_18px_rgba(34,211,238,0.8)]
                  "
                />

              </div>


              <div>

                <h2 className="text-xl font-semibold">
                  {device.name}
                </h2>

                <p className="text-sm text-slate-500">
                  {device.id}
                </p>

              </div>

            </div>


            {/* DEVICE STATS */}

            <div
              className="
                grid
                grid-cols-2
                md:grid-cols-4
                gap-6
              "
            >

              <div className="flex items-center gap-3">

                <Wifi
                  size={20}
                  className="text-slate-500"
                />

                <div>

                  <p className="text-xs text-slate-500">
                    Network
                  </p>

                  <p className="text-sm font-medium">
                    {device.network}
                  </p>

                </div>

              </div>


              <div className="flex items-center gap-3">

                <Battery
                  size={20}
                  className="text-slate-500"
                />

                <div>

                  <p className="text-xs text-slate-500">
                    Battery
                  </p>

                  <p className="text-sm font-medium">
                    {device.battery}
                  </p>

                </div>

              </div>


              <div className="flex items-center gap-3">

                <RefreshCw
                  size={20}
                  className="text-slate-500"
                />

                <div>

                  <p className="text-xs text-slate-500">
                    Last sync
                  </p>

                  <p className="text-sm font-medium">
                    {lastSync}
                  </p>

                </div>

              </div>


              <div className="flex items-center gap-3">

                <Cpu
                  size={20}
                  className="text-slate-500"
                />

                <div>

                  <p className="text-xs text-slate-500">
                    Firmware
                  </p>

                  <p className="text-sm font-medium">
                    {device.firmware}
                  </p>

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* =================================================
            LOW STOCK ALERT
        ================================================= */}

        {lowStockMedicines.length > 0 && (

          <section
            className="
              rounded-2xl
              border
              border-orange-400/20
              bg-orange-400/5
              p-5
              mb-8
            "
          >

            <div className="flex items-start gap-4">

              <div
                className="
                  w-11
                  h-11
                  shrink-0
                  rounded-xl
                  bg-orange-400/10
                  flex
                  items-center
                  justify-center
                "
              >

                <AlertTriangle
                  size={22}
                  className="text-orange-400"
                />

              </div>


              <div className="flex-1">

                <h3 className="font-semibold text-orange-300">
                  Low stock detected
                </h3>

                <p className="text-sm text-slate-400 mt-1">
                  {lowStockMedicines.length === 1
                    ? "1 medicine"
                    : `${lowStockMedicines.length} medicines`}
                  {" "}
                  need attention.
                </p>


                <div className="flex flex-wrap gap-2 mt-4">

                  {lowStockMedicines.map(
                    (medicine) => {

                      const stock =
                        getStock(
                          medicine
                        );

                      return (
                        <span
                          key={medicine.id}
                          className="
                            inline-flex
                            items-center
                            gap-2
                            px-3
                            py-2
                            rounded-lg
                            bg-orange-400/10
                            border
                            border-orange-400/10
                            text-orange-300
                            text-sm
                          "
                        >

                          <Pill size={14} />

                          {medicine.name}

                          <span className="font-semibold">
                            {stock} left
                          </span>

                        </span>
                      );
                    }
                  )}

                </div>

              </div>

            </div>

          </section>

        )}


        {/* =================================================
            COMPARTMENTS
        ================================================= */}

        <section
          className="
            rounded-3xl
            border
            border-white/10
            bg-[#0D1B30]
            p-6
            md:p-8
            mb-8
          "
        >

          <div className="mb-7">

            <h2 className="text-2xl font-semibold">
              Compartments
            </h2>

            <p className="text-slate-500 mt-1">
              Each slot mirrors a medicine from your
              Medicines page.
            </p>

          </div>


          {medicines.length === 0 ? (

            <div
              className="
                py-16
                text-center
                rounded-2xl
                border
                border-dashed
                border-white/10
              "
            >

              <Pill
                size={40}
                className="mx-auto text-slate-600 mb-4"
              />

              <h3 className="text-xl font-semibold">
                No medicines connected
              </h3>

              <p className="text-slate-500 mt-2">
                Add a medicine from the Medicines page.
              </p>

            </div>

          ) : (

            <div
              className="
                grid
                grid-cols-1
                sm:grid-cols-2
                lg:grid-cols-3
                xl:grid-cols-4
                gap-5
              "
            >

              {medicines.map(
                (medicine, index) => {

                  const stock =
                    getStock(
                      medicine
                    );

                  const lowStock =
                    isLowStock(
                      medicine
                    );

                  const lowStockLimit =
                    getLowStockLimit(
                      medicine
                    );

                  const stockPercentage =
                    lowStockLimit === 0
                      ? stock > 0
                        ? 100
                        : 0
                      : Math.min(
                          100,
                          Math.max(
                            0,
                            (stock /
                              Math.max(
                                lowStockLimit *
                                  4,
                                1
                              )) *
                              100
                          )
                        );


                  return (
                    <div
                      key={medicine.id}
                      className={`
                        rounded-2xl
                        border
                        p-5
                        transition
                        ${
                          lowStock
                            ? `
                              border-orange-400/30
                              bg-orange-400/[0.04]
                            `
                            : `
                              border-white/10
                              bg-[#101F35]
                            `
                        }
                      `}
                    >

                      {/* SLOT */}

                      <div className="text-center">

                        <p className="text-xs font-medium text-slate-500 tracking-wider">
                          SLOT {index + 1}
                        </p>


                        {/* PILL VISUAL */}

                        <div className="h-36 flex items-center justify-center">

                          <div
                            className={`
                              w-14
                              h-32
                              rounded-full
                              transition
                              ${
                                lowStock
                                  ? `
                                    bg-gradient-to-b
                                    from-orange-400
                                    to-orange-500
                                    shadow-[0_0_25px_rgba(251,146,60,0.15)]
                                  `
                                  : `
                                    bg-gradient-to-b
                                    from-cyan-300
                                    to-teal-400
                                    shadow-[0_0_25px_rgba(45,212,191,0.12)]
                                  `
                              }
                            `}
                          />

                        </div>


                        {/* NAME */}

                        <h3 className="text-lg font-semibold truncate">
                          {medicine.name}
                        </h3>

                        <p className="text-sm text-slate-500 mt-1">
                          {medicine.dosage}
                        </p>


                        {/* TIME */}

                        <div className="flex items-center justify-center gap-2 mt-4">

                          <Clock3
                            size={15}
                            className="text-slate-500"
                          />

                          <span className="text-sm text-slate-400">
                            {getMedicineTime(
                              medicine
                            )}
                          </span>

                        </div>


                        {/* INSTRUCTIONS */}

                        {(medicine.instructions ||
                          medicine.notes) && (

                          <p
                            className="
                              text-xs
                              text-slate-500
                              mt-3
                              line-clamp-2
                              min-h-[32px]
                            "
                          >
                            {medicine.instructions ||
                              medicine.notes}
                          </p>

                        )}


                        {/* =================================================
                            STOCK STATUS — IMPORTANT FIX
                        ================================================= */}

                        <div className="mt-5 pt-4 border-t border-white/10">

                          <div className="flex items-center justify-between gap-2">

                            <span className="text-xs text-slate-500">
                              Stock
                            </span>


                            {lowStock ? (

                              <span
                                className="
                                  flex
                                  items-center
                                  gap-1.5
                                  text-xs
                                  font-semibold
                                  text-orange-400
                                "
                              >

                                <AlertTriangle size={13} />

                                LOW STOCK

                              </span>

                            ) : (

                              <span
                                className="
                                  flex
                                  items-center
                                  gap-1.5
                                  text-xs
                                  font-medium
                                  text-emerald-400
                                "
                              >

                                <CheckCircle2 size={13} />

                                STOCK OK

                              </span>

                            )}

                          </div>


                          {/* STOCK BAR */}

                          <div
                            className="
                              mt-2
                              h-2
                              rounded-full
                              bg-slate-800
                              overflow-hidden
                            "
                          >

                            <div
                              className={`
                                h-full
                                rounded-full
                                transition-all
                                ${
                                  lowStock
                                    ? "bg-orange-400"
                                    : "bg-cyan-400"
                                }
                              `}
                              style={{
                                width: `${stockPercentage}%`,
                              }}
                            />

                          </div>


                          {/* STOCK NUMBERS */}

                          <div className="flex items-center justify-between mt-2">

                            <span
                              className={`
                                text-xs
                                ${
                                  lowStock
                                    ? "text-orange-400 font-medium"
                                    : "text-slate-500"
                                }
                              `}
                            >

                              {stock}{" "}
                              {stock === 1
                                ? "dose"
                                : "doses"}{" "}
                              left

                            </span>


                            <span className="text-[11px] text-slate-600">

                              Alert at{" "}
                              {lowStockLimit}

                            </span>

                          </div>


                          {/* EXPLICIT LOW STOCK MESSAGE */}

                          {lowStock && (

                            <div
                              className="
                                mt-3
                                flex
                                items-center
                                justify-center
                                gap-2
                                rounded-lg
                                bg-orange-400/10
                                border
                                border-orange-400/10
                                py-2
                                text-xs
                                text-orange-400
                              "
                            >

                              <AlertTriangle size={14} />

                              Refill required

                            </div>

                          )}

                        </div>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          )}

        </section>


        {/* =================================================
            WEEKLY / LOG
        ================================================= */}

        <section
          className="
            grid
            grid-cols-1
            lg:grid-cols-2
            gap-6
          "
        >

          {/* WEEKLY ADHERENCE */}

          <div
            className="
              rounded-3xl
              border
              border-white/10
              bg-[#0D1B30]
              p-6
              md:p-7
            "
          >

            <div className="flex items-center gap-3 mb-1">

              <Activity
                size={21}
                className="text-cyan-400"
              />

              <h2 className="text-2xl font-semibold">
                Weekly Adherence
              </h2>

            </div>

            <p className="text-slate-500 mb-7">
              Doses taken vs. scheduled, last 7 days
            </p>


            {/* SIMPLE VISUAL */}

            <div className="h-56 flex items-end justify-between gap-3">

              {[
                82,
                91,
                76,
                95,
                88,
                72,
                90,
              ].map(
                (value, index) => (

                  <div
                    key={index}
                    className="
                      flex
                      flex-1
                      h-full
                      items-end
                    "
                  >

                    <div
                      className="
                        w-full
                        rounded-t-xl
                        bg-gradient-to-t
                        from-cyan-500/30
                        to-cyan-400
                        transition-all
                      "
                      style={{
                        height: `${value}%`,
                      }}
                    />

                  </div>

                )
              )}

            </div>


            <div
              className="
                grid
                grid-cols-7
                mt-3
                text-center
                text-xs
                text-slate-600
              "
            >

              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>

            </div>

          </div>


          {/* DISPENSE LOG */}

          <div
            className="
              rounded-3xl
              border
              border-white/10
              bg-[#0D1B30]
              p-6
              md:p-7
            "
          >

            <div className="flex items-center gap-3 mb-1">

              <History
                size={21}
                className="text-slate-400"
              />

              <h2 className="text-2xl font-semibold">
                Dispense & sync log
              </h2>

            </div>

            <p className="text-slate-500 mb-6">
              Latest medication activity
            </p>


            <div className="space-y-3">

              {recentActivity.length === 0 ? (

                <div className="py-10 text-center text-slate-600">
                  No activity yet.
                </div>

              ) : (

                recentActivity.map(
                  (activity, index) => (

                    <div
                      key={`${activity.name}-${index}`}
                      className="
                        flex
                        items-center
                        gap-4
                        rounded-xl
                        bg-white/[0.03]
                        border
                        border-white/5
                        p-4
                      "
                    >

                      <div
                        className={`
                          w-10
                          h-10
                          rounded-lg
                          flex
                          items-center
                          justify-center
                          ${
                            activity.taken
                              ? "bg-cyan-400/10"
                              : "bg-orange-400/10"
                          }
                        `}
                      >

                        {activity.taken ? (

                          <Pill
                            size={18}
                            className="text-cyan-400"
                          />

                        ) : (

                          <AlertTriangle
                            size={18}
                            className="text-orange-400"
                          />

                        )}

                      </div>


                      <div className="flex-1">

                        <p className="font-medium">
                          {activity.taken
                            ? `${activity.name} taken`
                            : `${activity.name} pending`}
                        </p>

                        <p className="text-xs text-slate-500 mt-1">
                          {activity.time}
                        </p>

                      </div>

                    </div>

                  )
                )

              )}

            </div>

          </div>

        </section>


        {/* =================================================
            RECENT DOSE ACTIVITY
        ================================================= */}

        {medicines.length > 0 && (

          <section
            className="
              rounded-3xl
              border
              border-white/10
              bg-[#0D1B30]
              p-6
              md:p-7
              mt-6
            "
          >

            <div className="flex items-center gap-3 mb-6">

              <History
                size={21}
                className="text-slate-400"
              />

              <h2 className="text-2xl font-semibold">
                Recent dose activity
              </h2>

            </div>


            <div
              className="
                grid
                grid-cols-1
                md:grid-cols-2
                gap-4
              "
            >

              {medicines
                .slice(0, 4)
                .map(
                  (medicine) => (

                    <div
                      key={medicine.id}
                      className="
                        rounded-xl
                        bg-white/[0.03]
                        border
                        border-white/5
                        p-4
                        flex
                        items-center
                        gap-4
                      "
                    >

                      <div
                        className={`
                          w-10
                          h-10
                          rounded-lg
                          flex
                          items-center
                          justify-center
                          ${
                            medicine.taken
                              ? "bg-cyan-400/10"
                              : "bg-orange-400/10"
                          }
                        `}
                      >

                        {medicine.taken ? (

                          <Pill
                            size={18}
                            className="text-cyan-400"
                          />

                        ) : (

                          <AlertTriangle
                            size={18}
                            className="text-orange-400"
                          />

                        )}

                      </div>


                      <div>

                        <p className="font-medium">
                          {medicine.name}{" "}
                          {medicine.taken
                            ? "taken"
                            : "pending"}
                        </p>

                        <p className="text-xs text-slate-500 mt-1">
                          {getMedicineTime(
                            medicine
                          )}
                        </p>

                      </div>

                    </div>

                  )
                )}

            </div>

          </section>

        )}

      </main>

    </div>
  );
}

export default DigitalTwin;