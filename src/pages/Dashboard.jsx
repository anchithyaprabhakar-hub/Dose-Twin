import {
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock3,
  HeartPulse,
  Pill,
  ShieldCheck,
  TrendingUp,
  UserRound,
} from "lucide-react";

function Dashboard() {
  const hour = new Date().getHours();
  const today = new Date();

const formattedDate = today.toLocaleDateString("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
});
  let greeting;

  if (hour >= 5 && hour < 12) {
    greeting = "GOOD MORNING";
  } else if (hour >= 12 && hour < 17) {
    greeting = "GOOD AFTERNOON";
  } else if (hour >= 17 && hour < 21) {
    greeting = "GOOD EVENING";
  } else {
    greeting = "GOOD NIGHT";
  }

  return (
    <div className="min-h-screen bg-[#08111F] text-white">

      {/* NAVBAR */}
      <nav className="border-b border-white/10 bg-[#0A1724]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          {/* LOGO */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-400 to-red-400" />

            <div>
              <h1 className="text-xl font-bold">DoseTwin</h1>
              <p className="text-xs text-slate-500">
                Smart Medication Platform
              </p>
            </div>
          </div>

          {/* RIGHT NAV */}
          <div className="flex items-center gap-4">

            <button className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 transition">
              <Bell size={20} className="text-slate-300" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-400" />
            </button>

            <div className="hidden sm:flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-r from-cyan-400 to-teal-400 flex items-center justify-center">
                <UserRound size={18} className="text-[#08111F]" />
              </div>

              <div>
                <p className="text-sm font-medium">Welcome</p>
                <p className="text-xs text-slate-500">Patient</p>
              </div>
            </div>

          </div>
        </div>
      </nav>


      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-6 py-10">

        {/* HEADER */}
        <section className="mb-10">

          <p className="text-cyan-400 text-sm font-medium mb-2">
            {greeting}
          </p>

          <h2 className="text-4xl md:text-5xl font-bold mb-3">
            Your medication twin is ready.
          </h2>

          <p className="text-slate-400 max-w-2xl">
            Track your medication schedule, adherence, and digital twin
            insights from one place.
          </p>

        </section>


        {/* STATUS CARDS */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

          {/* ADHERENCE */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/[0.07] transition">

            <div className="flex items-center justify-between mb-5">

              <div className="w-11 h-11 rounded-xl bg-cyan-400/10 flex items-center justify-center">
                <TrendingUp className="text-cyan-400" size={22} />
              </div>

              <span className="text-xs text-emerald-400">
                +4.2%
              </span>

            </div>

            <p className="text-slate-400 text-sm">
              Medication adherence
            </p>

            <h3 className="text-3xl font-bold mt-1">
              92%
            </h3>

            <div className="w-full h-2 bg-white/10 rounded-full mt-4">
              <div className="h-2 w-[92%] bg-gradient-to-r from-cyan-400 to-teal-400 rounded-full" />
            </div>

          </div>


          {/* TODAY'S DOSES */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/[0.07] transition">

            <div className="w-11 h-11 rounded-xl bg-purple-400/10 flex items-center justify-center mb-5">
              <Pill className="text-purple-400" size={22} />
            </div>

            <p className="text-slate-400 text-sm">
              Today's doses
            </p>

            <h3 className="text-3xl font-bold mt-1">
              3 / 4
            </h3>

            <p className="text-xs text-slate-500 mt-2">
              One dose remaining
            </p>

          </div>


          {/* NEXT DOSE */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/[0.07] transition">

            <div className="w-11 h-11 rounded-xl bg-orange-400/10 flex items-center justify-center mb-5">
              <Clock3 className="text-orange-400" size={22} />
            </div>

            <p className="text-slate-400 text-sm">
              Next dose
            </p>

            <h3 className="text-3xl font-bold mt-1">
              7:30 PM
            </h3>

            <p className="text-xs text-slate-500 mt-2">
              Vitamin D
            </p>

          </div>


          {/* DIGITAL TWIN */}
          <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-6">

            <div className="flex items-center justify-between mb-5">

              <div className="w-11 h-11 rounded-xl bg-cyan-400/10 flex items-center justify-center">
                <HeartPulse className="text-cyan-400" size={22} />
              </div>

              <span className="flex items-center gap-1 text-xs text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                LIVE
              </span>

            </div>

            <p className="text-slate-400 text-sm">
              Digital Twin
            </p>

            <h3 className="text-xl font-bold mt-1">
              Synced
            </h3>

            <p className="text-xs text-slate-500 mt-2">
              Last updated 2 min ago
            </p>

          </div>

        </section>


        {/* LOWER GRID */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">


          {/* TODAY'S MEDICATION */}
          <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-6">

            <div className="flex items-center justify-between mb-6">

              <div>
                <h3 className="text-xl font-semibold">
                  Today's medication
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  {formattedDate}
                </p>
              </div>

              <CalendarDays className="text-slate-500" size={22} />

            </div>


            {/* MEDICATION 1 */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 mb-3">

              <div className="flex items-center gap-4">

                <div className="w-10 h-10 rounded-xl bg-cyan-400/10 flex items-center justify-center">
                  <Pill className="text-cyan-400" size={20} />
                </div>

                <div>
                  <p className="font-medium">
                    Metformin
                  </p>

                  <p className="text-xs text-slate-500">
                    500 mg • Morning
                  </p>
                </div>

              </div>

              <div className="flex items-center gap-2 text-emerald-400 text-sm">
                <CheckCircle2 size={18} />
                Taken
              </div>

            </div>


            {/* MEDICATION 2 */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 mb-3">

              <div className="flex items-center gap-4">

                <div className="w-10 h-10 rounded-xl bg-purple-400/10 flex items-center justify-center">
                  <Pill className="text-purple-400" size={20} />
                </div>

                <div>
                  <p className="font-medium">
                    Omega 3
                  </p>

                  <p className="text-xs text-slate-500">
                    1000 mg • Afternoon
                  </p>
                </div>

              </div>

              <div className="flex items-center gap-2 text-emerald-400 text-sm">
                <CheckCircle2 size={18} />
                Taken
              </div>

            </div>


            {/* MEDICATION 3 */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">

              <div className="flex items-center gap-4">

                <div className="w-10 h-10 rounded-xl bg-orange-400/10 flex items-center justify-center">
                  <Pill className="text-orange-400" size={20} />
                </div>

                <div>
                  <p className="font-medium">
                    Vitamin D
                  </p>

                  <p className="text-xs text-slate-500">
                    1000 IU • Evening
                  </p>
                </div>

              </div>

              <div className="flex items-center gap-2 text-orange-400 text-sm">
                <Clock3 size={18} />
                Upcoming
              </div>

            </div>

          </div>


          {/* AI INSIGHT */}
          <div className="rounded-2xl border border-cyan-400/20 bg-gradient-to-b from-cyan-400/10 to-white/5 p-6">

            <div className="flex items-center gap-3 mb-6">

              <div className="w-11 h-11 rounded-xl bg-cyan-400/10 flex items-center justify-center">
                <ShieldCheck className="text-cyan-400" size={22} />
              </div>

              <div>
                <h3 className="font-semibold">
                  AI Health Insight
                </h3>

                <p className="text-xs text-slate-500">
                  Powered by DoseTwin
                </p>
              </div>

            </div>

            <p className="text-slate-300 leading-relaxed">
              Your medication adherence is looking strong today.
              Keep following your scheduled doses to maintain your
              current adherence score.
            </p>

            <div className="mt-6 p-4 rounded-xl bg-black/20 border border-white/5">

              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">
                Digital Twin Status
              </p>

              <p className="text-sm text-emerald-400">
                Stable • No alerts detected
              </p>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default Dashboard;