import {
  UsersRound,
  UserRound,
  ShieldCheck,
  Bell,
  Activity,
} from "lucide-react";

function Caregiver() {
  return (
    <div className="min-h-screen bg-[#08111F] text-white">
      <main className="max-w-[1400px] mx-auto px-8 py-12">

        {/* HEADER */}

        <section className="mb-12">
          <p className="text-cyan-400 text-sm font-medium mb-3">
            CAREGIVER
          </p>

          <h1 className="text-5xl font-bold tracking-tight">
            Caregiver support
          </h1>

          <p className="text-lg text-slate-400 mt-4 max-w-3xl">
            Keep trusted caregivers informed about medication
            adherence and important medication activity.
          </p>
        </section>


        {/* CAREGIVER STATUS */}

        <section className="rounded-2xl border border-white/10 bg-white/5 p-8 mb-8">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-5">

              <div className="w-16 h-16 rounded-2xl bg-cyan-400/10 flex items-center justify-center">
                <UsersRound
                  size={32}
                  className="text-cyan-400"
                />
              </div>

              <div>
                <p className="text-sm text-slate-500 uppercase tracking-wider">
                  Caregiver connection
                </p>

                <h2 className="text-2xl font-bold mt-1">
                  Active
                </h2>

                <p className="text-slate-400 mt-1">
                  Your caregiver connection is currently active.
                </p>
              </div>

            </div>

            <span className="flex items-center gap-2 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              CONNECTED
            </span>

          </div>

        </section>


        {/* CARDS */}

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

          {/* CAREGIVER */}

          <div className="rounded-2xl border border-white/10 bg-white/5 p-7">

            <div className="w-12 h-12 rounded-xl bg-purple-400/10 flex items-center justify-center mb-6">

              <UserRound
                size={23}
                className="text-purple-400"
              />

            </div>

            <p className="text-slate-400">
              Primary caregiver
            </p>

            <h2 className="text-2xl font-bold mt-2">
              Family Member
            </h2>

            <p className="text-sm text-slate-500 mt-2">
              Trusted caregiver
            </p>

          </div>


          {/* MONITORING */}

          <div className="rounded-2xl border border-white/10 bg-white/5 p-7">

            <div className="w-12 h-12 rounded-xl bg-cyan-400/10 flex items-center justify-center mb-6">

              <Activity
                size={23}
                className="text-cyan-400"
              />

            </div>

            <p className="text-slate-400">
              Medication monitoring
            </p>

            <h2 className="text-2xl font-bold mt-2">
              Active
            </h2>

            <p className="text-sm text-slate-500 mt-2">
              Adherence information is being monitored.
            </p>

          </div>


          {/* ALERTS */}

          <div className="rounded-2xl border border-white/10 bg-white/5 p-7">

            <div className="w-12 h-12 rounded-xl bg-emerald-400/10 flex items-center justify-center mb-6">

              <ShieldCheck
                size={23}
                className="text-emerald-400"
              />

            </div>

            <p className="text-slate-400">
              Safety status
            </p>

            <h2 className="text-2xl font-bold mt-2">
              No alerts
            </h2>

            <p className="text-sm text-emerald-400 mt-2">
              Everything looks stable.
            </p>

          </div>

        </section>


        {/* NOTIFICATIONS */}

        <section className="mt-6 rounded-2xl border border-cyan-400/30 bg-cyan-400/5 p-7">

          <div className="flex items-center gap-4">

            <div className="w-12 h-12 rounded-xl bg-cyan-400/10 flex items-center justify-center">

              <Bell
                size={23}
                className="text-cyan-400"
              />

            </div>

            <div>

              <h3 className="text-xl font-semibold">
                Caregiver notifications
              </h3>

              <p className="text-slate-400 mt-1">
                Notifications are enabled for important medication events.
              </p>

            </div>

          </div>

        </section>

      </main>
    </div>
  );
}

export default Caregiver;