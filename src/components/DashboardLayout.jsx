import {
  BarChart3,
  Bell,
  ChevronLeft,
  ChevronRight,
  HeartPulse,
  LayoutDashboard,
  Pill,
  Settings,
  UsersRound,
  UserRound,
} from "lucide-react";

import { NavLink, Outlet } from "react-router-dom";
import { useState } from "react";

const navigation = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Medicines",
    path: "/medicines",
    icon: Pill,
  },
  {
    name: "Digital Twin",
    path: "/digital-twin",
    icon: HeartPulse,
  },
  {
    name: "Analytics",
    path: "/analytics",
    icon: BarChart3,
  },
  {
    name: "Caregiver",
    path: "/caregiver",
    icon: UsersRound,
  },
  {
    name: "Settings",
    path: "/settings",
    icon: Settings,
  },
];

function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#08111F] text-white">

      {/* SIDEBAR */}

      <aside
        className={`
          fixed
          left-0
          top-0
          bottom-0
          z-50
          border-r
          border-white/10
          bg-[#091629]
          transition-all
          duration-300
          ${collapsed ? "w-20" : "w-72"}
        `}
      >

        {/* LOGO */}

        <div
          className={`
            h-24
            flex
            items-center
            border-b
            border-white/10
            ${collapsed ? "justify-center" : "px-7"}
          `}
        >

          <div className="flex items-center gap-4">

            <div
              className="
                w-12
                h-12
                rounded-full
                shrink-0
                bg-gradient-to-br
                from-cyan-400
                via-teal-400
                to-red-400
              "
            />

            {!collapsed && (
              <div>
                <h1 className="text-2xl font-bold">
                  DoseTwin
                </h1>

                <p className="text-xs text-slate-500">
                  Smart Medication Platform
                </p>
              </div>
            )}

          </div>

        </div>


        {/* NAVIGATION */}

        <nav className="p-4 space-y-2">

          {navigation.map((item) => {

            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  group
                  flex
                  items-center
                  gap-4
                  rounded-2xl
                  transition-all
                  duration-200

                  ${
                    collapsed
                      ? "justify-center px-3 py-4"
                      : "px-4 py-3.5"
                  }

                  ${
                    isActive
                      ? `
                        bg-gradient-to-r
                        from-cyan-400
                        to-teal-400
                        text-[#06111F]
                        shadow-[0_0_30px_rgba(34,211,238,0.15)]
                      `
                      : `
                        text-slate-300
                        hover:bg-white/5
                        hover:text-white
                      `
                  }
                `}
              >

                <Icon
                  size={23}
                  strokeWidth={1.8}
                  className="shrink-0"
                />

                {!collapsed && (
                  <span className="text-[16px] font-medium">
                    {item.name}
                  </span>
                )}

              </NavLink>
            );
          })}

        </nav>


        {/* COLLAPSE */}

        <button
          type="button"
          onClick={() =>
            setCollapsed(!collapsed)
          }
          className={`
            absolute
            bottom-6
            flex
            items-center
            gap-3
            text-slate-500
            hover:text-white
            transition
            ${
              collapsed
                ? "left-1/2 -translate-x-1/2"
                : "left-7"
            }
          `}
        >

          {collapsed ? (
            <ChevronRight size={20} />
          ) : (
            <>
              <ChevronLeft size={20} />

              <span className="text-sm">
                Collapse
              </span>
            </>
          )}

        </button>

      </aside>


      {/* MAIN AREA */}

      <div
        className={`
          min-h-screen
          transition-all
          duration-300
          ${
            collapsed
              ? "ml-20"
              : "ml-72"
          }
        `}
      >

        {/* TOPBAR */}

        <header
          className="
            h-24
            border-b
            border-white/10
            bg-[#081522]/90
            backdrop-blur-xl
            flex
            items-center
            justify-end
            px-8
          "
        >

          <div className="flex items-center gap-5">

            {/* NOTIFICATION */}

            <button
              type="button"
              className="
                relative
                w-11
                h-11
                rounded-xl
                bg-white/5
                hover:bg-white/10
                flex
                items-center
                justify-center
              "
            >

              <Bell
                size={21}
                className="text-slate-300"
              />

              <span
                className="
                  absolute
                  top-2
                  right-2
                  w-2
                  h-2
                  rounded-full
                  bg-cyan-400
                "
              />

            </button>


            {/* PROFILE */}

            <div className="flex items-center gap-3">

              <div
                className="
                  w-11
                  h-11
                  rounded-full
                  border-2
                  border-cyan-400/60
                  bg-cyan-400/10
                  flex
                  items-center
                  justify-center
                "
              >

                <UserRound
                  size={21}
                  className="text-cyan-400"
                />

              </div>

              <div className="hidden sm:block">

                <p className="font-semibold text-sm">
                  Welcome
                </p>

                <p className="text-xs text-slate-500">
                  Patient
                </p>

              </div>

            </div>

          </div>

        </header>


        {/* PAGE CONTENT */}

        <main>
          <Outlet />
        </main>

      </div>

    </div>
  );
}

export default DashboardLayout;