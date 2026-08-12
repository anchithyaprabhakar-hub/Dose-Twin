import {
  Activity,
  HeartPulse,
  Pill,
  TrendingUp,
  ShieldCheck,
  Clock3,
} from "lucide-react";

function DigitalTwin() {
  return (
    <div className="min-h-screen bg-[#08111F] text-white">

      <main className="max-w-[1400px] mx-auto px-8 py-12">

        {/* HEADER */}

        <section className="mb-12">

          <p className="text-cyan-400 text-sm font-medium mb-3">
            DIGITAL TWIN
          </p>

          <h1 className="text-5xl font-bold tracking-tight">
            Your medication twin
          </h1>

          <p className="text-lg text-slate-400 mt-4 max-w-3xl">
            A live representation of your medication schedule,
            adherence, and treatment patterns.
          </p>

        </section>


        {/* STATUS */}

        <section
          className="
            rounded-2xl
            border
            border-cyan-400/30
            bg-cyan-400/5
            p-8
            mb-8
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
                  flex
                  items-center
                  justify-center
                "
              >

                <HeartPulse
                  size={32}
                  className="text-cyan-400"
                />

              </div>

              <div>

                <p className="text-sm text-slate-500 uppercase tracking-wider">
                  Twin status
                </p>

                <h2 className="text-2xl font-bold mt-1">
                  Synchronized
                </h2>

                <p className="text-slate-400 mt-1">
                  Medication data is up to date.
                </p>

              </div>

            </div>


            <div className="flex items-center gap-2 text-emerald-400">

              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />

              LIVE

            </div>

          </div>

        </section>


        {/* STATS */}

        <section
          className="
            grid
            grid-cols-1
            sm:grid-cols-2
            xl:grid-cols-4
            gap-6
            mb-8
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

            <div
              className="
                w-12
                h-12
                rounded-xl
                bg-cyan-400/10
                flex
                items-center
                justify-center
                mb-6
              "
            >

              <TrendingUp
                size={23}
                className="text-cyan-400"
              />

            </div>

            <p className="text-slate-400">
              Medication adherence
            </p>

            <h2 className="text-4xl font-bold mt-2">
              92%
            </h2>

            <p className="text-sm text-emerald-400 mt-2">
              +4.2% this week
            </p>

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
              Doses today
            </p>

            <h2 className="text-4xl font-bold mt-2">
              3 / 3
            </h2>

            <p className="text-sm text-emerald-400 mt-2">
              All doses completed
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
              Next dose
            </p>

            <h2 className="text-3xl font-bold mt-2">
              Completed
            </h2>

            <p className="text-sm text-slate-500 mt-2">
              No doses remaining
            </p>

          </div>


          {/* SAFETY */}

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

              <ShieldCheck
                size={23}
                className="text-emerald-400"
              />

            </div>

            <p className="text-slate-400">
              Twin health status
            </p>

            <h2 className="text-3xl font-bold mt-2">
              Stable
            </h2>

            <p className="text-sm text-emerald-400 mt-2">
              No alerts detected
            </p>

          </div>

        </section>


        {/* LOWER CONTENT */}

        <section
          className="
            grid
            grid-cols-1
            lg:grid-cols-2
            gap-6
          "
        >

          {/* TWIN MODEL */}

          <div
            className="
              rounded-2xl
              border
              border-white/10
              bg-white/5
              p-8
            "
          >

            <div className="flex items-center gap-4 mb-8">

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

                <Activity
                  size={23}
                  className="text-cyan-400"
                />

              </div>

              <div>

                <h2 className="text-2xl font-semibold">
                  Twin activity
                </h2>

                <p className="text-slate-500">
                  Current medication state
                </p>

              </div>

            </div>


            <div className="space-y-5">

              <div
                className="
                  flex
                  items-center
                  justify-between
                  p-4
                  rounded-xl
                  bg-white/5
                "
              >

                <span className="text-slate-400">
                  Medication sync
                </span>

                <span className="text-emerald-400 font-medium">
                  Active
                </span>

              </div>


              <div
                className="
                  flex
                  items-center
                  justify-between
                  p-4
                  rounded-xl
                  bg-white/5
                "
              >

                <span className="text-slate-400">
                  Adherence monitoring
                </span>

                <span className="text-emerald-400 font-medium">
                  Active
                </span>

              </div>


              <div
                className="
                  flex
                  items-center
                  justify-between
                  p-4
                  rounded-xl
                  bg-white/5
                "
              >

                <span className="text-slate-400">
                  Schedule monitoring
                </span>

                <span className="text-emerald-400 font-medium">
                  Active
                </span>

              </div>


              <div
                className="
                  flex
                  items-center
                  justify-between
                  p-4
                  rounded-xl
                  bg-white/5
                "
              >

                <span className="text-slate-400">
                  Alert status
                </span>

                <span className="text-cyan-400 font-medium">
                  Clear
                </span>

              </div>

            </div>

          </div>


          {/* INSIGHT */}

          <div
            className="
              rounded-2xl
              border
              border-cyan-400/30
              bg-cyan-400/5
              p-8
            "
          >

            <div className="flex items-center gap-4 mb-8">

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

                <HeartPulse
                  size={23}
                  className="text-cyan-400"
                />

              </div>

              <div>

                <h2 className="text-2xl font-semibold">
                  Digital Twin insight
                </h2>

                <p className="text-slate-500">
                  Medication pattern analysis
                </p>

              </div>

            </div>


            <p className="text-slate-300 leading-7">

              Your current medication pattern
              indicates strong adherence. Your
              medication twin is synchronized with
              the latest schedule information.

            </p>


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

              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">
                Current recommendation
              </p>

              <p className="text-emerald-400 font-medium">
                Continue following your current medication schedule.
              </p>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default DigitalTwin;