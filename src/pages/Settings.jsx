import { useEffect, useState } from "react";

import {
  User,
  Bell,
  Bluetooth,
  Wifi,
  Shield,
  Save,
  RotateCcw,
  Unplug,
  CheckCircle2,
} from "lucide-react";

const SETTINGS_KEY = "dosetwin_settings";

const defaultSettings = {
  fullName: "Aditi Sharma",
  email: "aditi.sharma@example.com",
  phone: "+91 98765 43210",
  timezone: "Asia/Kolkata",

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

/* =========================================================
   LOAD SETTINGS
========================================================= */

function loadSettings() {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);

    if (!stored) {
      return defaultSettings;
    }

    const parsed = JSON.parse(stored);

    return {
      ...defaultSettings,
      ...parsed,
      notifications: {
        ...defaultSettings.notifications,
        ...(parsed.notifications || {}),
      },
      dispenser: {
        ...defaultSettings.dispenser,
        ...(parsed.dispenser || {}),
      },
    };
  } catch (error) {
    console.error("Could not load settings:", error);
    return defaultSettings;
  }
}


/* =========================================================
   TOGGLE COMPONENT
========================================================= */

function Toggle({ enabled, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      aria-pressed={enabled}
      className={`
        relative
        w-[54px]
        h-[30px]
        rounded-full
        transition-all
        duration-200
        shrink-0
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
          top-[4px]
          w-[22px]
          h-[22px]
          rounded-full
          bg-white
          shadow-md
          transition-all
          duration-200
          ${
            enabled
              ? "left-[28px]"
              : "left-[4px]"
          }
        `}
      />
    </button>
  );
}


/* =========================================================
   SETTINGS
========================================================= */

function Settings() {
  const [settings, setSettings] =
    useState(loadSettings);

  const [saved, setSaved] = useState(false);


  /* =======================================================
     SAVE SETTINGS
  ======================================================= */

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


  /* =======================================================
     UPDATE PROFILE
  ======================================================= */

  const updateProfile = (field, value) => {
    setSettings((current) => ({
      ...current,
      [field]: value,
    }));
  };


  /* =======================================================
     UPDATE NOTIFICATION
  ======================================================= */

  const updateNotification = (
    notification,
    value
  ) => {
    setSettings((current) => ({
      ...current,

      notifications: {
        ...current.notifications,

        [notification]: value,
      },
    }));
  };


  /* =======================================================
     UPDATE DISPENSER
  ======================================================= */

  const updateDispenser = (
    field,
    value
  ) => {
    setSettings((current) => ({
      ...current,

      dispenser: {
        ...current.dispenser,

        [field]: value,
      },
    }));
  };


  /* =======================================================
     UNPAIR DISPENSER
  ======================================================= */

  const unpairDevice = () => {
    const confirmed = window.confirm(
      "Are you sure you want to unpair the DoseTwin Dispenser?"
    );

    if (!confirmed) return;

    updateDispenser(
      "paired",
      false
    );
  };


  /* =======================================================
     RESET SETTINGS
  ======================================================= */

  const resetDefaults = () => {
    const confirmed = window.confirm(
      "Reset all DoseTwin settings to their default values?"
    );

    if (!confirmed) return;

    setSettings(defaultSettings);

    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify(defaultSettings)
    );
  };


  return (
    <div className="min-h-screen bg-[#08111F] text-white">

      {/* ===================================================
          MAIN CONTENT
      =================================================== */}

      <main className="max-w-[1400px] mx-auto px-6 md:px-8 py-10">

        {/* =================================================
            PAGE HEADER
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
            bg-[#101c2d]
            p-7
            md:p-8
            mb-6
          "
        >

          {/* CARD HEADER */}

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
                shrink-0
              "
            >

              <User
                size={24}
                className="text-cyan-400"
              />

            </div>

            <div>

              <h2 className="text-2xl font-semibold">
                Account
              </h2>

              <p className="text-slate-500 mt-1">
                Your personal details and locale.
              </p>

            </div>

          </div>


          {/* PROFILE GRID */}

          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-2
              gap-x-5
              gap-y-6
            "
          >

            {/* FULL NAME */}

            <div>

              <label className="block text-sm text-slate-400 mb-2">
                Full name
              </label>

              <input
                type="text"
                value={settings.fullName}
                onChange={(event) =>
                  updateProfile(
                    "fullName",
                    event.target.value
                  )
                }
                className="
                  w-full
                  h-14
                  rounded-xl
                  border
                  border-white/10
                  bg-[#182437]
                  px-4
                  text-white
                  outline-none
                  transition
                  focus:border-cyan-400/50
                  focus:ring-2
                  focus:ring-cyan-400/10
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
                  updateProfile(
                    "email",
                    event.target.value
                  )
                }
                className="
                  w-full
                  h-14
                  rounded-xl
                  border
                  border-white/10
                  bg-[#182437]
                  px-4
                  text-white
                  outline-none
                  transition
                  focus:border-cyan-400/50
                  focus:ring-2
                  focus:ring-cyan-400/10
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
                  updateProfile(
                    "phone",
                    event.target.value
                  )
                }
                className="
                  w-full
                  h-14
                  rounded-xl
                  border
                  border-white/10
                  bg-[#182437]
                  px-4
                  text-white
                  outline-none
                  transition
                  focus:border-cyan-400/50
                  focus:ring-2
                  focus:ring-cyan-400/10
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
                  updateProfile(
                    "timezone",
                    event.target.value
                  )
                }
                className="
                  w-full
                  h-14
                  rounded-xl
                  border
                  border-white/10
                  bg-[#182437]
                  px-4
                  text-white
                  outline-none
                  cursor-pointer
                  focus:border-cyan-400/50
                "
              >

                <option value="Asia/Kolkata">
                  Asia/Kolkata
                </option>

                <option value="Asia/Dubai">
                  Asia/Dubai
                </option>

                <option value="Asia/Singapore">
                  Asia/Singapore
                </option>

                <option value="Europe/London">
                  Europe/London
                </option>

                <option value="America/New_York">
                  America/New_York
                </option>

                <option value="America/Los_Angeles">
                  America/Los_Angeles
                </option>

              </select>

            </div>

          </div>


          {/* SAVE */}

          <div className="flex justify-end mt-7">

            <button
              type="button"
              onClick={saveSettings}
              className="
                flex
                items-center
                gap-2
                px-6
                py-3
                rounded-full
                bg-cyan-400
                text-[#06111f]
                font-semibold
                hover:bg-cyan-300
                transition
                shadow-[0_0_30px_rgba(34,211,238,0.12)]
              "
            >

              {saved ? (
                <>
                  <CheckCircle2 size={18} />
                  Saved
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save changes
                </>
              )}

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
            bg-[#101c2d]
            p-7
            md:p-8
            mb-6
          "
        >

          {/* HEADER */}

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
                shrink-0
              "
            >

              <Bell
                size={24}
                className="text-cyan-400"
              />

            </div>

            <div>

              <h2 className="text-2xl font-semibold">
                Notifications
              </h2>

              <p className="text-slate-500 mt-1">
                Choose what DoseTwin should notify you about.
              </p>

            </div>

          </div>


          <div>

            {/* DOSE REMINDERS */}

            <div
              className="
                flex
                items-center
                justify-between
                gap-6
                py-5
                border-b
                border-white/10
              "
            >

              <div>

                <h3 className="text-lg font-medium">
                  Dose reminders
                </h3>

                <p className="text-slate-500 mt-1">
                  Get pinged when it's time to take a dose.
                </p>

              </div>

              <Toggle
                enabled={
                  settings.notifications
                    .doseReminders
                }
                onChange={() =>
                  updateNotification(
                    "doseReminders",
                    !settings.notifications
                      .doseReminders
                  )
                }
              />

            </div>


            {/* MISSED DOSE */}

            <div
              className="
                flex
                items-center
                justify-between
                gap-6
                py-5
                border-b
                border-white/10
              "
            >

              <div>

                <h3 className="text-lg font-medium">
                  Missed dose alerts
                </h3>

                <p className="text-slate-500 mt-1">
                  Notify me if a scheduled dose wasn't taken.
                </p>

              </div>

              <Toggle
                enabled={
                  settings.notifications
                    .missedDoseAlerts
                }
                onChange={() =>
                  updateNotification(
                    "missedDoseAlerts",
                    !settings.notifications
                      .missedDoseAlerts
                  )
                }
              />

            </div>


            {/* LOW STOCK */}

            <div
              className="
                flex
                items-center
                justify-between
                gap-6
                py-5
                border-b
                border-white/10
              "
            >

              <div>

                <h3 className="text-lg font-medium">
                  Low stock alerts
                </h3>

                <p className="text-slate-500 mt-1">
                  Warn me before a medicine runs out.
                </p>

              </div>

              <Toggle
                enabled={
                  settings.notifications
                    .lowStockAlerts
                }
                onChange={() =>
                  updateNotification(
                    "lowStockAlerts",
                    !settings.notifications
                      .lowStockAlerts
                  )
                }
              />

            </div>


            {/* WEEKLY SUMMARY */}

            <div
              className="
                flex
                items-center
                justify-between
                gap-6
                py-5
                border-b
                border-white/10
              "
            >

              <div>

                <h3 className="text-lg font-medium">
                  Weekly summary
                </h3>

                <p className="text-slate-500 mt-1">
                  A recap of adherence and refills every Sunday.
                </p>

              </div>

              <Toggle
                enabled={
                  settings.notifications
                    .weeklySummary
                }
                onChange={() =>
                  updateNotification(
                    "weeklySummary",
                    !settings.notifications
                      .weeklySummary
                  )
                }
              />

            </div>


            {/* CAREGIVER ALERTS */}

            <div
              className="
                flex
                items-center
                justify-between
                gap-6
                py-5
              "
            >

              <div>

                <h3 className="text-lg font-medium">
                  Caregiver alerts
                </h3>

                <p className="text-slate-500 mt-1">
                  Let linked caregivers see missed-dose alerts too.
                </p>

              </div>

              <Toggle
                enabled={
                  settings.notifications
                    .caregiverAlerts
                }
                onChange={() =>
                  updateNotification(
                    "caregiverAlerts",
                    !settings.notifications
                      .caregiverAlerts
                  )
                }
              />

            </div>

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
            bg-[#101c2d]
            p-7
            md:p-8
            mb-6
          "
        >

          {/* HEADER */}

          <div className="flex items-center gap-4 mb-7">

            <div
              className="
                w-12
                h-12
                rounded-xl
                bg-cyan-400/10
                flex
                items-center
                justify-center
                shrink-0
              "
            >

              <Bluetooth
                size={24}
                className="text-cyan-400"
              />

            </div>

            <div>

              <h2 className="text-2xl font-semibold">
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
              flex
              items-center
              justify-between
              gap-4
              rounded-xl
              bg-[#16243a]
              px-5
              py-4
              mb-6
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
                "
              >

                <Wifi
                  size={20}
                  className="text-cyan-400"
                />

              </div>

              <div>

                <p className="font-medium">
                  DoseTwin Dispenser
                </p>

                <p className="text-sm text-slate-500">
                  {settings.dispenser.paired
                    ? `Connected · ${settings.dispenser.wifi}`
                    : "Not connected"}
                </p>

              </div>

            </div>


            {settings.dispenser.paired && (

              <span
                className="
                  px-3
                  py-1.5
                  rounded-full
                  bg-cyan-400/10
                  text-cyan-300
                  text-sm
                  font-medium
                "
              >
                PAIRED
              </span>

            )}

          </div>


          {/* DEVICE SETTINGS */}

          {settings.dispenser.paired ? (

            <>
              <div
                className="
                  grid
                  grid-cols-1
                  md:grid-cols-2
                  gap-5
                "
              >

                {/* WIFI */}

                <div>

                  <label className="block text-sm text-slate-400 mb-2">
                    Wi-Fi network
                  </label>

                  <input
                    type="text"
                    value={
                      settings.dispenser.wifi
                    }
                    onChange={(event) =>
                      updateDispenser(
                        "wifi",
                        event.target.value
                      )
                    }
                    className="
                      w-full
                      h-14
                      rounded-xl
                      border
                      border-white/10
                      bg-[#182437]
                      px-4
                      text-white
                      outline-none
                      focus:border-cyan-400/50
                    "
                  />

                </div>


                {/* SYNC */}

                <div>

                  <label className="block text-sm text-slate-400 mb-2">
                    Sync frequency
                  </label>

                  <select
                    value={
                      settings.dispenser
                        .syncFrequency
                    }
                    onChange={(event) =>
                      updateDispenser(
                        "syncFrequency",
                        event.target.value
                      )
                    }
                    className="
                      w-full
                      h-14
                      rounded-xl
                      border
                      border-white/10
                      bg-[#182437]
                      px-4
                      text-white
                      outline-none
                      cursor-pointer
                      focus:border-cyan-400/50
                    "
                  >

                    <option value="Real-time">
                      Real-time
                    </option>

                    <option value="Every 5 minutes">
                      Every 5 minutes
                    </option>

                    <option value="Every 15 minutes">
                      Every 15 minutes
                    </option>

                    <option value="Hourly">
                      Hourly
                    </option>

                  </select>

                </div>

              </div>


              {/* UNPAIR */}

              <div className="flex justify-end mt-6">

                <button
                  type="button"
                  onClick={unpairDevice}
                  className="
                    flex
                    items-center
                    gap-2
                    px-5
                    py-3
                    rounded-full
                    border
                    border-slate-600
                    text-slate-300
                    hover:border-red-400/50
                    hover:text-red-400
                    transition
                  "
                >

                  <Unplug size={17} />

                  Unpair device

                </button>

              </div>

            </>

          ) : (

            <div
              className="
                rounded-xl
                border
                border-dashed
                border-white/10
                p-8
                text-center
              "
            >

              <Bluetooth
                size={34}
                className="mx-auto text-slate-600 mb-3"
              />

              <p className="text-slate-400">
                No dispenser paired.
              </p>

              <button
                type="button"
                onClick={() =>
                  updateDispenser(
                    "paired",
                    true
                  )
                }
                className="
                  mt-5
                  px-6
                  py-3
                  rounded-full
                  bg-cyan-400
                  text-[#06111f]
                  font-semibold
                  hover:bg-cyan-300
                  transition
                "
              >
                Pair dispenser
              </button>

            </div>

          )}

        </section>


        {/* =================================================
            DANGER ZONE
        ================================================= */}

        <section
          className="
            rounded-3xl
            border
            border-red-400/25
            bg-[#121522]
            p-7
            md:p-8
            mb-8
          "
        >

          {/* HEADER */}

          <div className="flex items-center gap-4 mb-7">

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

              <Shield
                size={24}
                className="text-cyan-400"
              />

            </div>

            <div>

              <h2 className="text-2xl font-semibold">
                Danger zone
              </h2>

              <p className="text-slate-500 mt-1">
                Irreversible actions — proceed carefully.
              </p>

            </div>

          </div>


          {/* RESET */}

          <div
            className="
              flex
              flex-col
              md:flex-row
              md:items-center
              justify-between
              gap-5
            "
          >

            <div>

              <p className="text-slate-400">
                Reset all settings back to their default values.
              </p>

            </div>

            <button
              type="button"
              onClick={resetDefaults}
              className="
                flex
                items-center
                justify-center
                gap-2
                px-6
                py-3
                rounded-full
                border
                border-red-400/40
                text-red-400
                font-medium
                hover:bg-red-400/10
                transition
                shrink-0
              "
            >

              <RotateCcw size={17} />

              Reset to defaults

            </button>

          </div>

        </section>


        {/* =================================================
            FOOTER
        ================================================= */}

        <div className="flex items-center justify-center gap-2 pb-6">

          <span className="w-2 h-2 rounded-full bg-emerald-400" />

          <span className="text-xs text-slate-600">
            Settings are stored locally on this device
          </span>

        </div>

      </main>

    </div>
  );
}

export default Settings;