import {
  BarChart3,
  TrendingUp,
  CheckCircle2,
  Clock3,
  Pill,
  ArrowLeft,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
} from "recharts";

import { Link } from "react-router-dom";

const weeklyData = [
  { day: "Mon", adherence: 100 },
  { day: "Tue", adherence: 75 },
  { day: "Wed", adherence: 100 },
  { day: "Thu", adherence: 75 },
  { day: "Fri", adherence: 100 },
  { day: "Sat", adherence: 100 },
  { day: "Sun", adherence: 92 },
];

const doseData = [
  { day: "Mon", taken: 4, total: 4 },
  { day: "Tue", taken: 3, total: 4 },
  { day: "Wed", taken: 4, total: 4 },
  { day: "Thu", taken: 3, total: 4 },
  { day: "Fri", taken: 4, total: 4 },
  { day: "Sat", taken: 4, total: 4 },
  { day: "Sun", taken: 3, total: 4 },
];

function Analytics() {
  return (
    <div className="min-h-screen bg-[#08111F] text-white">

      {/* NAVBAR */}
      <nav className="border-b border-white/10 bg-[#0A1724]/80 backdrop-blur-xl">
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
        <div className="mb-10">

          <p className="text-cyan-400 text-sm font-medium mb-2">
            MEDICATION ANALYTICS
          </p>

          <h2 className="text-4xl md:text-5xl font-bold mb-3">
            Your adherence insights
          </h2>

          <p className="text-slate-400 max-w-2xl">
            Track medication adherence, dose completion, and weekly
            medication patterns in one place.
          </p>

        </div>

        {/* SUMMARY CARDS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

          {/* OVERALL ADHERENCE */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">

            <div className="w-11 h-11 rounded-xl bg-cyan-400/10 flex items-center justify-center mb-5">
              <TrendingUp
                className="text-cyan-400"
                size={22}
              />
            </div>

            <p className="text-slate-500 text-sm">
              Overall adherence
            </p>

            <h3 className="text-3xl font-bold mt-2">
              92%
            </h3>

            <p className="text-emerald-400 text-sm mt-2">
              +4.2% this week
            </p>

          </div>

          {/* DOSES TAKEN */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">

            <div className="w-11 h-11 rounded-xl bg-emerald-400/10 flex items-center justify-center mb-5">
              <CheckCircle2
                className="text-emerald-400"
                size={22}
              />
            </div>

            <p className="text-slate-500 text-sm">
              Doses taken
            </p>

            <h3 className="text-3xl font-bold mt-2">
              25
            </h3>

            <p className="text-slate-500 text-sm mt-2">
              out of 28 scheduled
            </p>

          </div>

          {/* MISSED DOSES */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">

            <div className="w-11 h-11 rounded-xl bg-orange-400/10 flex items-center justify-center mb-5">
              <Clock3
                className="text-orange-400"
                size={22}
              />
            </div>

            <p className="text-slate-500 text-sm">
              Missed doses
            </p>

            <h3 className="text-3xl font-bold mt-2">
              3
            </h3>

            <p className="text-orange-400 text-sm mt-2">
              Needs attention
            </p>

          </div>

          {/* ACTIVE MEDICINES */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">

            <div className="w-11 h-11 rounded-xl bg-purple-400/10 flex items-center justify-center mb-5">
              <Pill
                className="text-purple-400"
                size={22}
              />
            </div>

            <p className="text-slate-500 text-sm">
              Active medicines
            </p>

            <h3 className="text-3xl font-bold mt-2">
              3
            </h3>

            <p className="text-slate-500 text-sm mt-2">
              Current schedule
            </p>

          </div>

        </section>

        {/* CHARTS */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

          {/* WEEKLY ADHERENCE */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">

            <div className="flex items-center justify-between mb-8">

              <div>
                <h3 className="text-xl font-semibold">
                  Weekly adherence
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Percentage of scheduled doses taken
                </p>
              </div>

              <BarChart3
                className="text-cyan-400"
                size={22}
              />

            </div>

            <div className="h-72">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart data={weeklyData}>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.08)"
                  />

                  <XAxis
                    dataKey="day"
                    stroke="#64748b"
                    tickLine={false}
                    axisLine={false}
                  />

                  <YAxis
                    domain={[0, 100]}
                    stroke="#64748b"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}%`}
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0A1724",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      color: "#fff",
                    }}
                    formatter={(value) => [
                      `${value}%`,
                      "Adherence",
                    ]}
                  />

                  <Bar
                    dataKey="adherence"
                    fill="#22d3ee"
                    radius={[6, 6, 0, 0]}
                  />

                </BarChart>
              </ResponsiveContainer>

            </div>

          </div>

          {/* DOSE COMPLETION */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">

            <div className="flex items-center justify-between mb-8">

              <div>
                <h3 className="text-xl font-semibold">
                  Dose completion
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Taken vs scheduled doses
                </p>
              </div>

              <TrendingUp
                className="text-emerald-400"
                size={22}
              />

            </div>

            <div className="h-72">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <LineChart data={doseData}>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.08)"
                  />

                  <XAxis
                    dataKey="day"
                    stroke="#64748b"
                    tickLine={false}
                    axisLine={false}
                  />

                  <YAxis
                    domain={[0, 4]}
                    stroke="#64748b"
                    tickLine={false}
                    axisLine={false}
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0A1724",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      color: "#fff",
                    }}
                  />

                  <Line
                    type="monotone"
                    dataKey="taken"
                    stroke="#34d399"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    name="Taken"
                  />

                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#64748b"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    name="Scheduled"
                  />

                </LineChart>
              </ResponsiveContainer>

            </div>

          </div>

        </section>

        {/* INSIGHT */}
        <section className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-7">

          <div className="flex items-start gap-4">

            <div className="w-12 h-12 rounded-xl bg-cyan-400/10 flex items-center justify-center shrink-0">

              <TrendingUp
                className="text-cyan-400"
                size={24}
              />

            </div>

            <div>

              <h3 className="text-xl font-semibold mb-2">
                DoseTwin insight
              </h3>

              <p className="text-slate-300 leading-relaxed">
                Your medication adherence is strong at 92%.
                Most scheduled doses are being taken consistently.
                The remaining missed doses are worth monitoring
                to maintain your current adherence level.
              </p>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default Analytics;