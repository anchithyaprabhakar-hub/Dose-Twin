import { useEffect, useState } from "react";
import {
  AlertTriangle,
  BatteryMedium,
  Clock3,
  Cpu,
  History,
  Link2,
  RefreshCw,
  Wifi,
  Activity,
  Pill,
} from "lucide-react";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const STORAGE_KEY = "dosetwin_medicines";

/* =========================================================
   WEEKLY ADHERENCE
========================================================= */

const weeklyData = [
  { day: "Mon", adherence: 100 },
  { day: "Tue", adherence: 100 },
  { day: "Wed", adherence: 86 },
  { day: "Thu", adherence: 100 },
  { day: "Fri", adherence: 100 },
  { day: "Sat", adherence: 86 },
  { day: "Sun", adherence: 100 },
];

/* =========================================================
   SYNC LOG
========================================================= */

const syncLog = [
  {
    type: "success",
    title: "Compartment synchronized",
    time: "Today · 08:04 AM",
  },
  {
    type: "success",
    title: "Dispense confirmed",
    time: "Today · 08:02 AM",
  },
  {
    type: "warning",
    title: "Missed dispense detected",
    time: "Yesterday · 09:15 PM",
  },
  {
    type: "sync",
    title: "Firmware synced, v2.4.1",
    time: "2 days ago",
  },
];

/* =========================================================
   RECENT ACTIVITY
========================================================= */

const recentActivity = [
  {
    type: "success",
    title: "Medication taken",
    time: "Today · 08:02 AM",
  },
  {
    type: "warning",
    title: "Medication missed",
    time: "Yesterday · 09:15 PM",
  },
  {
    type: "success",
    title: "Medication taken",
    time: "Yesterday · 08:05 AM",
  },
  {
    type: "success",
    title: "Medication taken",
    time: "2 days ago · 10:02 PM",
  },
];

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
   DIGITAL TWIN
========================================================= */

function DigitalTwin() {
  const [medicines, setMedicines] = useState(
    loadMedicines
  );

  /*
   * AUTOMATIC MEDICINE SYNC
   *
   * You do NOT need to modify Medicines.jsx.
   *
   * The Digital Twin checks the same localStorage
   * key every 500ms.
   *
   * Therefore:
   *
   * Add medicine     → automatically appears
   * Delete medicine  → automatically disappears
   * Edit medicine    → automatically updates
   * Take medicine    → automatically updates
   */

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

    const interval = setInterval(
      checkForChanges,
      500
    );

    /*
     * Also detect changes from another browser tab.
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

  return (
    <div className="min-h-screen bg-[#08111F] text-white">

      <main className="max-w-[1500px] mx-auto px-6 md:px-8 py-8">

        {/* =================================================
            HEADER
        ================================================= */}

        <section className="mb-7">

          <p className="text-cyan-400 text-sm font-medium tracking-wide mb-2">
            DIGITAL HEALTH MODEL
          </p>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Digital Twin
          </h1>

          <p className="text-slate-400 text-lg mt-3 max-w-4xl">
            A live virtual model of your dispenser,
            mirrored from your medicines and dose history.
          </p>

        </section>


        {/* =================================================
            DISPENSER STATUS
        ================================================= */}

        <section className="rounded-3xl border border-white/10 bg-[#0D1B30] p-6 md:p-7 mb-7">

          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">

            {/* DEVICE */}

            <div className="flex items-center gap-4">

              <div className="w-4 h-4 rounded-full bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]" />

              <div>

                <h2 className="text-xl font-semibold">
                  DoseTwin Dispenser
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  DT-100 · DT100-8842-KJ
                </p>

              </div>

            </div>


            {/* DEVICE INFORMATION */}

            <div className="flex flex-wrap gap-7">

              <DeviceMetric
                icon={<Wifi size={18} />}
                label="Network"
                value="Home-5G"
              />

              <DeviceMetric
                icon={<BatteryMedium size={18} />}
                label="Battery"
                value="78%"
              />

              <DeviceMetric
                icon={<RefreshCw size={18} />}
                label="Last sync"
                value="2 min ago"
              />

              <DeviceMetric
                icon={<Cpu size={18} />}
                label="Firmware"
                value="v2.4.1"
              />

            </div>

          </div>

        </section>


        {/* =================================================
            COMPARTMENTS
        ================================================= */}

        <section className="rounded-3xl border border-white/10 bg-[#0D1B30] p-6 md:p-7 mb-7">

          <div className="mb-6">

            <h2 className="text-xl font-semibold">
              Compartments
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Each slot mirrors a medicine from your
              Medicines page.
            </p>

          </div>


          {/* =================================================
              NO MEDICINES
          ================================================= */}

          {medicines.length === 0 ? (

            <div className="py-16 text-center">

              <div className="w-16 h-16 mx-auto rounded-2xl bg-cyan-400/10 flex items-center justify-center mb-5">

                <Pill
                  size={30}
                  className="text-cyan-400"
                />

              </div>

              <h3 className="text-xl font-semibold">
                No medicines in your dispenser
              </h3>

              <p className="text-slate-500 mt-2">
                Add a medicine from the Medicines page
                to see it here.
              </p>

            </div>

          ) : (

            /* =================================================
               MEDICINE COMPARTMENTS
            ================================================= */

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">

              {medicines.map(
                (medicine, index) => (
                  <Compartment
                    key={
                      medicine.id ?? index
                    }
                    medicine={medicine}
                    index={index}
                  />
                )
              )}

            </div>

          )}

        </section>


        {/* =================================================
            WEEKLY ADHERENCE + SYNC LOG
        ================================================= */}

        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-7">


          {/* =================================================
              WEEKLY ADHERENCE
          ================================================= */}

          <div className="rounded-3xl border border-white/10 bg-[#0D1B30] p-6">

            <div className="flex items-center gap-3 mb-1">

              <Activity
                size={20}
                className="text-cyan-400"
              />

              <h2 className="text-xl font-semibold">
                Weekly Adherence
              </h2>

            </div>

            <p className="text-sm text-slate-500 mb-6">
              Doses taken vs. scheduled, last 7 days
            </p>


            <div className="h-[300px] w-full">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <AreaChart data={weeklyData}>

                  <defs>

                    <linearGradient
                      id="adherenceGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >

                      <stop
                        offset="0%"
                        stopColor="#2DD4BF"
                        stopOpacity={0.28}
                      />

                      <stop
                        offset="100%"
                        stopColor="#2DD4BF"
                        stopOpacity={0.02}
                      />

                    </linearGradient>

                  </defs>


                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.06)"
                  />


                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "#64748B",
                      fontSize: 13,
                    }}
                  />


                  <YAxis
                    domain={[0, 100]}
                    axisLine={false}
                    tickLine={false}
                    ticks={[
                      0,
                      25,
                      50,
                      75,
                      100,
                    ]}
                    tick={{
                      fill: "#64748B",
                      fontSize: 13,
                    }}
                  />


                  <Tooltip
                    contentStyle={{
                      backgroundColor:
                        "#0B1728",

                      border:
                        "1px solid rgba(255,255,255,0.1)",

                      borderRadius: "12px",

                      color: "#fff",
                    }}

                    formatter={(value) => [
                      `${value}%`,
                      "Adherence",
                    ]}
                  />


                  <Area
                    type="monotone"
                    dataKey="adherence"
                    stroke="#2DD4BF"
                    strokeWidth={3}
                    fill="url(#adherenceGradient)"
                  />

                </AreaChart>

              </ResponsiveContainer>

            </div>

          </div>


          {/* =================================================
              SYNC LOG
          ================================================= */}

          <div className="rounded-3xl border border-white/10 bg-[#0D1B30] p-6">

            <div className="flex items-center gap-3 mb-1">

              <History
                size={20}
                className="text-slate-400"
              />

              <h2 className="text-xl font-semibold">
                Dispense & sync log
              </h2>

            </div>


            <div className="space-y-3 mt-6">

              {syncLog.map(
                (item, index) => (
                  <LogItem
                    key={index}
                    item={item}
                  />
                )
              )}

            </div>

          </div>

        </section>


        {/* =================================================
            RECENT DOSE ACTIVITY
        ================================================= */}

        <section className="rounded-3xl border border-white/10 bg-[#0D1B30] p-6 mb-8">

          <div className="flex items-center gap-3 mb-6">

            <History
              size={20}
              className="text-slate-400"
            />

            <h2 className="text-xl font-semibold">
              Recent dose activity
            </h2>

          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

            {recentActivity.map(
              (item, index) => (
                <LogItem
                  key={index}
                  item={item}
                />
              )
            )}

          </div>

        </section>

      </main>

    </div>
  );
}


/* =========================================================
   DEVICE METRIC
========================================================= */

function DeviceMetric({
  icon,
  label,
  value,
}) {
  return (
    <div className="flex items-center gap-3">

      <div className="text-slate-500">
        {icon}
      </div>

      <div>

        <p className="text-xs text-slate-500">
          {label}
        </p>

        <p className="text-sm text-slate-300 font-medium">
          {value}
        </p>

      </div>

    </div>
  );
}


/* =========================================================
   MEDICINE COMPARTMENT
========================================================= */

function Compartment({
  medicine,
  index,
}) {

  /*
   * Try to use a stock percentage if one exists.
   *
   * If the current Medicines page does not have
   * stock information yet, the compartment starts
   * visually full.
   */

  const percentage =
    medicine.remainingPercentage ??
    medicine.stockPercentage ??
    medicine.percentage ??
    100;

  const numericPercentage =
    Number(percentage);

  const safePercentage =
    Math.max(
      8,
      Math.min(
        100,
        Number.isFinite(
          numericPercentage
        )
          ? numericPercentage
          : 100
      )
    );

  const warning =
    safePercentage <= 20;


  return (
    <div
      className={`rounded-2xl border p-4 text-center transition ${
        warning
          ? "border-orange-400/20 bg-[#101E33]"
          : "border-white/5 bg-[#101E33]"
      }`}
    >

      {/* SLOT */}

      <p className="text-xs text-slate-500 font-medium tracking-wide mb-4">
        SLOT {index + 1}
      </p>


      {/* MEDICINE LEVEL */}

      <div className="relative h-28 w-12 mx-auto mb-4 rounded-full border border-white/10 bg-[#17253A] overflow-hidden">

        <div
          className={`absolute bottom-0 left-0 right-0 rounded-full transition-all duration-700 ${
            warning
              ? "bg-gradient-to-t from-orange-500 to-red-400"
              : "bg-gradient-to-t from-teal-400 to-cyan-300"
          }`}
          style={{
            height: `${safePercentage}%`,
          }}
        />

      </div>


      {/* MEDICINE NAME */}

      <h3 className="font-semibold text-sm leading-tight min-h-[40px] flex items-center justify-center">
        {medicine.name}
      </h3>


      {/* DOSAGE */}

      <p className="text-xs text-slate-500 mt-1">
        {medicine.dosage ||
          "Dose not specified"}
      </p>


      {/* SCHEDULE / TIME */}

      <div className="flex items-center justify-center gap-1.5 mt-4 text-xs text-slate-400">

        <Clock3 size={13} />

        <span>
          {medicine.time ||
            medicine.schedule ||
            "Schedule not set"}
        </span>

      </div>


      {/* INSTRUCTIONS */}

      {medicine.instructions && (
        <p className="text-[11px] text-slate-600 mt-2 line-clamp-2">
          {medicine.instructions}
        </p>
      )}


      {/* STOCK STATUS */}

      <p
        className={`text-xs mt-2 ${
          warning
            ? "text-orange-400"
            : "text-slate-500"
        }`}
      >

        {warning && (
          <AlertTriangle
            size={12}
            className="inline mr-1"
          />
        )}

        {warning
          ? "Low stock"
          : "Stock synced"}

      </p>

    </div>
  );
}


/* =========================================================
   LOG ITEM
========================================================= */

function LogItem({ item }) {

  let icon;
  let iconClass;


  if (item.type === "warning") {

    icon = (
      <AlertTriangle size={18} />
    );

    iconClass =
      "bg-orange-400/10 text-orange-400";

  } else if (
    item.type === "sync"
  ) {

    icon = (
      <RefreshCw size={18} />
    );

    iconClass =
      "bg-slate-400/10 text-slate-400";

  } else {

    icon = (
      <Link2 size={18} />
    );

    iconClass =
      "bg-cyan-400/10 text-cyan-400";
  }


  return (
    <div className="flex items-center gap-4 rounded-xl bg-[#111F34] px-4 py-3.5">

      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconClass}`}
      >
        {icon}
      </div>


      <div className="min-w-0">

        <p className="text-sm font-medium text-slate-200 truncate">
          {item.title}
        </p>

        <p className="text-xs text-slate-500 mt-1">
          {item.time}
        </p>

      </div>

    </div>
  );
}


export default DigitalTwin;