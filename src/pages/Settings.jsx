import {
  Settings as SettingsIcon,
  Bell,
  ShieldCheck,
  UserRound,
  Database,
} from "lucide-react";

function Settings() {
  return (
    <div className="min-h-screen bg-[#08111F] text-white">
      <main className="max-w-[1400px] mx-auto px-8 py-12">

        {/* HEADER */}

        <section className="mb-12">

          <p className="text-cyan-400 text-sm font-medium mb-3">
            SETTINGS
          </p>

          <h1 className="text-5xl font-bold tracking-tight">
            Settings
          </h1>

          <p className="text-lg text-slate-400 mt-4 max-w-3xl">
            Manage your DoseTwin preferences, notifications,
            and medication data.
          </p>

        </section>


        {/* SETTINGS */}

        <section className="space-y-5">

          {/* PROFILE */}

          <div className="rounded-2xl border border-white/10 bg-white/5 p-7">

            <div className="flex items-center gap-5">

              <div className="w-12 h-12 rounded-xl bg-cyan-400/10 flex items-center justify-center">

                <UserRound
                  size={23}
                  className="text-cyan-400"
                />

              </div>

              <div>

                <h2 className="text-xl font-semibold">
                  Profile
                </h2>

                <p className="text-slate-500 mt-1">
                  Manage your patient profile information.
                </p>

              </div>

            </div>

          </div>


          {/* NOTIFICATIONS */}

          <div className="rounded-2xl border border-white/10 bg-white/5 p-7">

            <div className="flex items-center gap-5">

              <div className="w-12 h-12 rounded-xl bg-purple-400/10 flex items-center justify-center">

                <Bell
                  size={23}
                  className="text-purple-400"
                />

              </div>

              <div>

                <h2 className="text-xl font-semibold">
                  Notifications
                </h2>

                <p className="text-slate-500 mt-1">
                  Medication reminders and important alerts.
                </p>

              </div>

            </div>

          </div>


          {/* PRIVACY */}

          <div className="rounded-2xl border border-white/10 bg-white/5 p-7">

            <div className="flex items-center gap-5">

              <div className="w-12 h-12 rounded-xl bg-emerald-400/10 flex items-center justify-center">

                <ShieldCheck
                  size={23}
                  className="text-emerald-400"
                />

              </div>

              <div>

                <h2 className="text-xl font-semibold">
                  Privacy & Security
                </h2>

                <p className="text-slate-500 mt-1">
                  Manage your medication data and security preferences.
                </p>

              </div>

            </div>

          </div>


          {/* DATA */}

          <div className="rounded-2xl border border-white/10 bg-white/5 p-7">

            <div className="flex items-center gap-5">

              <div className="w-12 h-12 rounded-xl bg-orange-400/10 flex items-center justify-center">

                <Database
                  size={23}
                  className="text-orange-400"
                />

              </div>

              <div>

                <h2 className="text-xl font-semibold">
                  Medication Data
                </h2>

                <p className="text-slate-500 mt-1">
                  Your medication data is stored locally and synchronized
                  with the DoseTwin interface.
                </p>

              </div>

            </div>

          </div>


          {/* SYSTEM */}

          <div className="rounded-2xl border border-cyan-400/30 bg-cyan-400/5 p-7">

            <div className="flex items-center gap-5">

              <div className="w-12 h-12 rounded-xl bg-cyan-400/10 flex items-center justify-center">

                <SettingsIcon
                  size={23}
                  className="text-cyan-400"
                />

              </div>

              <div>

                <h2 className="text-xl font-semibold">
                  DoseTwin System
                </h2>

                <p className="text-slate-400 mt-1">
                  System status:{" "}
                  <span className="text-emerald-400">
                    Operational
                  </span>
                </p>

              </div>

            </div>

          </div>

        </section>

      </main>
    </div>
  );
}

export default Settings;