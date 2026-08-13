import { useEffect, useState } from "react";

import {
  User,
  Bell,
  Bluetooth,
  ShieldCheck,
  Save,
  Wifi,
  AlertTriangle,
} from "lucide-react";

const SETTINGS_KEY = "dosetwin_settings";

const DEFAULT_SETTINGS = {
  name: "",
  email: "",
  phone: "",
  timezone: "",

  notifications: {
    doseReminders: true,
    missedDoseAlerts: true,
    lowStockAlerts: true,
    weeklySummary: true,
    caregiverAlerts: false,
  },

  dispenser: {
    paired: true,
    wifi: "Home-5G",
    syncFrequency: "Real-time",
  },
};

function loadSettings() {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);

    if (!stored) {
      return DEFAULT_SETTINGS;
    }

    const parsed = JSON.parse(stored);

    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      name: parsed.name || "",
      email: parsed.email || "",
      phone: parsed.phone || "",
      timezone: parsed.timezone || "",
      notifications: {
        ...DEFAULT_SETTINGS.notifications,
        ...(parsed.notifications || {}),
      },
      dispenser: {
        ...DEFAULT_SETTINGS.dispenser,
        ...(parsed.dispenser || {}),
      },
    };
  } catch (error) {
    console.error("Could not load settings:", error);

    return DEFAULT_SETTINGS;
  }
}

function Settings() {
  const [settings, setSettings] = useState(loadSettings);
  const [saved, setSaved] = useState(false);

  /*
   * Save settings
   */
  const saveSettings = () => {
    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify(settings)
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2000);
  };

  /*
   * Update account field
   */
  const updateField = (field, value) => {
    setSettings((current) => ({
      ...current,
      [field]: value,
    }));
  };

  /*
   * Update notification
   */
  const updateNotification = (field) => {
    setSettings((current) => ({
      ...current,
      notifications: {
        ...current.notifications,
        [field]:
          !current.notifications[field],
      },
    }));
  };

  /*
   * Update dispenser setting
   */
  const updateDispenser = (field, value) => {
    setSettings((current) => ({
      ...current,
      dispenser: {
        ...current.dispenser,
        [field]: value,
      },
    }));
  };

  /*
   * Unpair dispenser
   */
  const unpairDevice = () => {
    setSettings((current) => ({
      ...current,
      dispenser: {
        ...current.dispenser,
        paired: false,
      },
    }));
  };

  /*
   * Reset settings
   */
  const resetSettings = () => {
    const confirmed = window.confirm(
      "Reset all DoseTwin settings to their default values?"
    );

    if (!confirmed) return;

    localStorage.removeItem(SETTINGS_KEY);

    setSettings({
      ...DEFAULT_SETTINGS,
      notifications: {
        ...DEFAULT_SETTINGS.notifications,
      },
      dispenser: {
        ...DEFAULT_SETTINGS.dispenser,
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#08111F] text-white">

      <main className="max-w-[1400px] mx-auto px-6 md:px-8 py-10">

        {/* =================================================
            HEADER
        ================================================= */}

        <section className="mb-10">

          <p className="text-cyan-400 text-sm font-medium tracking-wide mb-3">
            SYSTEM SETTINGS
          </p>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Settings
          </h1>

          <p className="text-lg text-slate-400 mt-4 max-w-3xl">
            Manage your account, notifications,
            and paired dispenser.
          </p>

        </section>


        {/* =================================================
            ACCOUNT
        ================================================= */}

        <section
          className="
            rounded-3xl
            border
            border-white/10
            bg-[#101C2D]
            p-7
            md:p-8
            mb-6
          "
        >

          <div className="flex items-center gap-5 mb-10">

            <div
              className="
                w-14
                h-14
                rounded-xl
                bg-cyan-400/10
                flex
                items-center
                justify-center
              "
            >

              <User
                size={28}
                className="text-cyan-400"
              />

            </div>

            <div>

              <h2 className="text-3xl font-semibold">
                Account
              </h2>

              <p className="text-slate-500 mt-1">
                Your personal details and locale.
              </p>

            </div>

          </div>


          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-2
              gap-6
            "
          >

            {/* NAME */}

            <div>

              <label className="block text-sm text-slate-400 mb-2">
                Full name
              </label>

              <input
                type="text"
                value={settings.name}
                onChange={(event) =>
                  updateField(
                    "name",
                    event.target.value
                  )
                }
                placeholder="Enter your full name"
                className="
                  w-full
                  rounded-xl
                  border
                  border-white/10
                  bg-[#172337]
                  px-4
                  py-4
                  text-white
                  outline-none
                  placeholder:text-slate-600
                  focus:border-cyan-400/60
                  focus:ring-1
                  focus:ring-cyan-400/40
                  transition
                "
              />

            </div>


            {/* EMAIL */}

            <div>

              <label className="block text-sm text-slate-400 mb-2">
                Email
              </label>

              <input
                type="email"
                value={settings.email}
                onChange={(event) =>
                  updateField(
                    "email",
                    event.target.value
                  )
                }
                placeholder="you@example.com"
                className="
                  w-full
                  rounded-xl
                  border
                  border-white/10
                  bg-[#172337]
                  px-4
                  py-4
                  text-white
                  outline-none
                  placeholder:text-slate-600
                  focus:border-cyan-400/60
                  focus:ring-1
                  focus:ring-cyan-400/40
                  transition
                "
              />

            </div>


            {/* PHONE */}

            <div>

              <label className="block text-sm text-slate-400 mb-2">
                Phone
              </label>

              <input
                type="tel"
                value={settings.phone}
                onChange={(event) =>
                  updateField(
                    "phone",
                    event.target.value
                  )
                }
                placeholder="+91 XXXXX XXXXX"
                className="
                  w-full
                  rounded-xl
                  border
                  border-white/10
                  bg-[#172337]
                  px-4
                  py-4
                  text-white
                  outline-none
                  placeholder:text-slate-600
                  focus:border-cyan-400/60
                  focus:ring-1
                  focus:ring-cyan-400/40
                  transition
                "
              />

            </div>


            {/* TIMEZONE */}

            <div>

              <label className="block text-sm text-slate-400 mb-2">
                Timezone
              </label>

              <select
                value={settings.timezone}
                onChange={(event) =>
                  updateField(
                    "timezone",
                    event.target.value
                  )
                }
                className="
                  w-full
                  rounded-xl
                  border
                  border-white/10
                  bg-[#172337]
                  px-4
                  py-4
                  text-white
                  outline-none
                  focus:border-cyan-400/60
                  focus:ring-1
                  focus:ring-cyan-400/40
                  transition
                "
              >

                <option
                  value=""
                  className="bg-[#172337]"
                >
                  Select timezone
                </option>

                <option
                  value="Asia/Kolkata"
                  className="bg-[#172337]"
                >
                  Asia/Kolkata
                </option>

                <option
                  value="Asia/Dubai"
                  className="bg-[#172337]"
                >
                  Asia/Dubai
                </option>

                <option
                  value="Europe/London"
                  className="bg-[#172337]"
                >
                  Europe/London
                </option>

                <option
                  value="America/New_York"
                  className="bg-[#172337]"
                >
                  America/New_York
                </option>

                <option
                  value="America/Los_Angeles"
                  className="bg-[#172337]"
                >
                  America/Los_Angeles
                </option>

              </select>

            </div>

          </div>


          {/* SAVE */}

          <div className="flex justify-end mt-8">

            <button
              onClick={saveSettings}
              className="
                flex
                items-center
                gap-2
                rounded-full
                bg-cyan-400
                px-7
                py-3.5
                text-sm
                font-semibold
                text-[#06111D]
                hover:bg-cyan-300
                transition
                shadow-lg
                shadow-cyan-400/20
              "
            >

              <Save size={18} />

              {saved
                ? "Saved"
                : "Save changes"}

            </button>

          </div>

        </section>


        {/* =================================================
            NOTIFICATIONS
        ================================================= */}

        <section
          className="
            rounded-3xl
            border
            border-white/10
            bg-[#101C2D]
            p-7
            md:p-8
            mb-6
          "
        >

          <div className="flex items-center gap-5 mb-8">

            <div
              className="
                w-14
                h-14
                rounded-xl
                bg-cyan-400/10
                flex
                items-center
                justify-center
              "
            >

              <Bell
                size={28}
                className="text-cyan-400"
              />

            </div>

            <div>

              <h2 className="text-3xl font-semibold">
                Notifications
              </h2>

              <p className="text-slate-500 mt-1">
                Choose what DoseTwin should notify you about.
              </p>

            </div>

          </div>


          <div>

            <NotificationRow
              title="Dose reminders"
              description="Get pinged when it's time to take a dose."
              enabled={
                settings.notifications.doseReminders
              }
              onClick={() =>
                updateNotification(
                  "doseReminders"
                )
              }
            />

            <NotificationRow
              title="Missed dose alerts"
              description="Notify me if a scheduled dose wasn't taken."
              enabled={
                settings.notifications.missedDoseAlerts
              }
              onClick={() =>
                updateNotification(
                  "missedDoseAlerts"
                )
              }
            />

            <NotificationRow
              title="Low stock alerts"
              description="Warn me before a medicine runs out."
              enabled={
                settings.notifications.lowStockAlerts
              }
              onClick={() =>
                updateNotification(
                  "lowStockAlerts"
                )
              }
            />

            <NotificationRow
              title="Weekly summary"
              description="A recap of adherence and refills every Sunday."
              enabled={
                settings.notifications.weeklySummary
              }
              onClick={() =>
                updateNotification(
                  "weeklySummary"
                )
              }
            />

            <NotificationRow
              title="Caregiver alerts"
              description="Let linked caregivers see missed-dose alerts too."
              enabled={
                settings.notifications.caregiverAlerts
              }
              onClick={() =>
                updateNotification(
                  "caregiverAlerts"
                )
              }
              last
            />

          </div>

        </section>


        {/* =================================================
            DISPENSER PAIRING
        ================================================= */}

        <section
          className="
            rounded-3xl
            border
            border-white/10
            bg-[#101C2D]
            p-7
            md:p-8
            mb-6
          "
        >

          <div className="flex items-center gap-5 mb-8">

            <div
              className="
                w-14
                h-14
                rounded-xl
                bg-cyan-400/10
                flex
                items-center
                justify-center
              "
            >

              <Bluetooth
                size={28}
                className="text-cyan-400"
              />

            </div>

            <div>

              <h2 className="text-3xl font-semibold">
                Dispenser pairing
              </h2>

              <p className="text-slate-500 mt-1">
                Manage the physical device linked to this account.
              </p>

            </div>

          </div>


          {/* DEVICE */}

          <div
            className="
              rounded-xl
              border
              border-white/5
              bg-[#111F32]
              p-5
              flex
              flex-col
              md:flex-row
              md:items-center
              justify-between
              gap-4
              mb-6
            "
          >

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
                "
              >

                <Wifi
                  size={22}
                  className="text-cyan-400"
                />

              </div>

              <div>

                <p className="font-medium text-lg">
                  DoseTwin Dispenser
                </p>

                <p className="text-sm text-slate-500">
                  {settings.dispenser.paired
                    ? `Connected · ${
                        settings.dispenser.wifi ||
                        "No network"
                      }`
                    : "Device not connected"}
                </p>

              </div>

            </div>


            <span
              className={`
                px-4
                py-2
                rounded-full
                text-xs
                font-medium
                ${
                  settings.dispenser.paired
                    ? "bg-cyan-400/10 text-cyan-400"
                    : "bg-slate-700 text-slate-400"
                }
              `}
            >

              {settings.dispenser.paired
                ? "PAIRED"
                : "NOT PAIRED"}

            </span>

          </div>


          {/* DEVICE SETTINGS */}

          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-2
              gap-6
            "
          >

            <div>

              <label className="block text-sm text-slate-400 mb-2">
                Wi-Fi network
              </label>

              <input
                type="text"
                value={settings.dispenser.wifi}
                onChange={(event) =>
                  updateDispenser(
                    "wifi",
                    event.target.value
                  )
                }
                placeholder="Enter Wi-Fi network"
                className="
                  w-full
                  rounded-xl
                  border
                  border-white/10
                  bg-[#172337]
                  px-4
                  py-4
                  text-white
                  outline-none
                  placeholder:text-slate-600
                  focus:border-cyan-400/60
                  focus:ring-1
                  focus:ring-cyan-400/40
                "
              />

            </div>


            <div>

              <label className="block text-sm text-slate-400 mb-2">
                Sync frequency
              </label>

              <select
                value={
                  settings.dispenser.syncFrequency
                }
                onChange={(event) =>
                  updateDispenser(
                    "syncFrequency",
                    event.target.value
                  )
                }
                className="
                  w-full
                  rounded-xl
                  border
                  border-white/10
                  bg-[#172337]
                  px-4
                  py-4
                  text-white
                  outline-none
                  focus:border-cyan-400/60
                  focus:ring-1
                  focus:ring-cyan-400/40
                "
              >

                <option
                  value="Real-time"
                  className="bg-[#172337]"
                >
                  Real-time
                </option>

                <option
                  value="Every 5 minutes"
                  className="bg-[#172337]"
                >
                  Every 5 minutes
                </option>

                <option
                  value="Every 15 minutes"
                  className="bg-[#172337]"
                >
                  Every 15 minutes
                </option>

                <option
                  value="Hourly"
                  className="bg-[#172337]"
                >
                  Hourly
                </option>

              </select>

            </div>

          </div>


          <div className="flex justify-end mt-6">

            <button
              onClick={unpairDevice}
              disabled={!settings.dispenser.paired}
              className="
                rounded-full
                border
                border-white/10
                px-6
                py-3
                text-sm
                font-medium
                text-slate-300
                hover:bg-white/5
                disabled:opacity-40
                disabled:cursor-not-allowed
                transition
              "
            >
              Unpair device
            </button>

          </div>

        </section>


        {/* =================================================
            DANGER ZONE
        ================================================= */}

        <section
          className="
            rounded-3xl
            border
            border-red-400/20
            bg-red-400/[0.025]
            p-7
            md:p-8
          "
        >

          <div className="flex items-center gap-5">

            <div
              className="
                w-14
                h-14
                rounded-xl
                bg-red-400/10
                flex
                items-center
                justify-center
              "
            >

              <ShieldCheck
                size={28}
                className="text-red-400"
              />

            </div>

            <div className="flex-1">

              <h2 className="text-2xl font-semibold">
                Danger zone
              </h2>

              <p className="text-slate-500 mt-1">
                Reset your DoseTwin settings.
              </p>

            </div>

            <button
              onClick={resetSettings}
              className="
                flex
                items-center
                gap-2
                rounded-full
                border
                border-red-400/30
                px-6
                py-3
                text-sm
                font-medium
                text-red-400
                hover:bg-red-400/10
                transition
              "
            >

              <AlertTriangle size={17} />

              Reset to defaults

            </button>

          </div>

        </section>


        {/* FOOTER */}

        <div className="flex items-center justify-center gap-2 mt-8 text-xs text-slate-600">

          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />

          Settings are stored locally on this device

        </div>

      </main>

    </div>
  );
}


/* =========================================================
   NOTIFICATION ROW
========================================================= */

function NotificationRow({
  title,
  description,
  enabled,
  onClick,
  last = false,
}) {
  return (
    <div
      className={`
        flex
        items-center
        justify-between
        gap-6
        py-6
        ${
          !last
            ? "border-b border-white/5"
            : ""
        }
      `}
    >

      <div>

        <p className="text-lg font-medium">
          {title}
        </p>

        <p className="text-sm text-slate-500 mt-1">
          {description}
        </p>

      </div>


      <button
        type="button"
        onClick={onClick}
        aria-label={`${title} ${
          enabled ? "enabled" : "disabled"
        }`}
        className={`
          relative
          w-14
          h-8
          rounded-full
          shrink-0
          transition
          ${
            enabled
              ? "bg-cyan-400"
              : "bg-slate-700"
          }
        `}
      >

        <span
          className={`
            absolute
            top-1
            w-6
            h-6
            rounded-full
            bg-white
            transition
            ${
              enabled
                ? "left-7"
                : "left-1"
            }
          `}
        />

      </button>

    </div>
  );
}

export default Settings;