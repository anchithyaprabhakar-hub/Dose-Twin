import { useEffect, useState } from "react";

import {
  UserRound,
  Bell,
  Pill,
  Users,
  ShieldCheck,
  Database,
  Trash2,
  Save,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

const SETTINGS_KEY = "dosetwin_settings";
const MEDICINES_KEY = "dosetwin_medicines";
const CAREGIVERS_KEY = "dosetwin_caregivers";

const defaultSettings = {
  name: "Patient",
  email: "",
  medicationReminders: true,
  caregiverNotifications: true,
  adherenceAlerts: true,
};


/* =========================================================
   LOAD SETTINGS
========================================================= */

function loadSettings() {
  try {
    const stored =
      localStorage.getItem(SETTINGS_KEY);

    if (!stored) {
      return defaultSettings;
    }

    const parsed = JSON.parse(stored);

    return {
      ...defaultSettings,
      ...parsed,
    };
  } catch (error) {
    console.error(
      "Could not load settings:",
      error
    );

    return defaultSettings;
  }
}


/* =========================================================
   SETTINGS
========================================================= */

function Settings() {
  const [settings, setSettings] =
    useState(loadSettings);

  const [saved, setSaved] = useState(false);

  const [medicineCount, setMedicineCount] =
    useState(0);

  const [caregiverCount, setCaregiverCount] =
    useState(0);


  /* =======================================================
     LOAD COUNTS
  ======================================================= */

  const refreshCounts = () => {
    try {
      const medicines = JSON.parse(
        localStorage.getItem(MEDICINES_KEY) ||
          "[]"
      );

      const caregivers = JSON.parse(
        localStorage.getItem(CAREGIVERS_KEY) ||
          "[]"
      );

      setMedicineCount(
        Array.isArray(medicines)
          ? medicines.length
          : 0
      );

      setCaregiverCount(
        Array.isArray(caregivers)
          ? caregivers.length
          : 0
      );
    } catch (error) {
      console.error(
        "Could not load data counts:",
        error
      );
    }
  };


  useEffect(() => {
    refreshCounts();
  }, []);


  /* =======================================================
     UPDATE SETTING
  ======================================================= */

  const updateSetting = (
    key,
    value
  ) => {
    setSettings((previous) => ({
      ...previous,
      [key]: value,
    }));

    setSaved(false);
  };


  /* =======================================================
     SAVE SETTINGS
  ======================================================= */

  const saveSettings = () => {
    try {
      localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify(settings)
      );

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 2500);
    } catch (error) {
      console.error(
        "Could not save settings:",
        error
      );
    }
  };


  /* =======================================================
     CLEAR MEDICINES
  ======================================================= */

  const clearMedicines = () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete all medicines? This cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    localStorage.removeItem(
      MEDICINES_KEY
    );

    setMedicineCount(0);

    window.dispatchEvent(
      new StorageEvent("storage", {
        key: MEDICINES_KEY,
        newValue: null,
      })
    );
  };


  /* =======================================================
     CLEAR CAREGIVERS
  ======================================================= */

  const clearCaregivers = () => {
    const confirmed = window.confirm(
      "Are you sure you want to remove all caregivers? This cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    localStorage.removeItem(
      CAREGIVERS_KEY
    );

    setCaregiverCount(0);

    window.dispatchEvent(
      new StorageEvent("storage", {
        key: CAREGIVERS_KEY,
        newValue: null,
      })
    );
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

          <div
            className="
              flex
              flex-col
              md:flex-row
              md:items-end
              md:justify-between
              gap-5
            "
          >

            <div>

              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Settings
              </h1>

              <p className="text-lg text-slate-400 mt-4 max-w-3xl">
                Manage your DoseTwin profile,
                notifications, and stored data.
              </p>

            </div>


            {/* SAVE */}

            <button
              onClick={saveSettings}
              className="
                flex
                items-center
                justify-center
                gap-2
                px-6
                py-3
                rounded-xl
                bg-cyan-400
                hover:bg-cyan-300
                text-[#06111f]
                font-semibold
                transition
              "
            >

              {saved ? (
                <CheckCircle2 size={19} />
              ) : (
                <Save size={19} />
              )}

              {saved
                ? "Saved"
                : "Save changes"}

            </button>

          </div>

        </section>


        {/* =================================================
            PROFILE
        ================================================= */}

        <section
          className="
            rounded-2xl
            border
            border-white/10
            bg-white/5
            p-7
            mb-6
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

              <UserRound
                size={24}
                className="text-cyan-400"
              />

            </div>

            <div>

              <h2 className="text-2xl font-semibold">
                Profile
              </h2>

              <p className="text-slate-500 mt-1">
                Manage your personal information.
              </p>

            </div>

          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* NAME */}

            <div>

              <label className="block text-sm text-slate-400 mb-2">
                Name
              </label>

              <input
                type="text"
                value={settings.name}
                onChange={(event) =>
                  updateSetting(
                    "name",
                    event.target.value
                  )
                }
                placeholder="Your name"
                className="
                  w-full
                  h-12
                  rounded-xl
                  border
                  border-white/10
                  bg-white/5
                  px-4
                  text-white
                  placeholder:text-slate-600
                  outline-none
                  focus:border-cyan-400/50
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
                  updateSetting(
                    "email",
                    event.target.value
                  )
                }
                placeholder="you@example.com"
                className="
                  w-full
                  h-12
                  rounded-xl
                  border
                  border-white/10
                  bg-white/5
                  px-4
                  text-white
                  placeholder:text-slate-600
                  outline-none
                  focus:border-cyan-400/50
                "
              />

            </div>

          </div>

        </section>


        {/* =================================================
            NOTIFICATIONS
        ================================================= */}

        <section
          className="
            rounded-2xl
            border
            border-white/10
            bg-white/5
            p-7
            mb-6
          "
        >

          <div className="flex items-center gap-4 mb-8">

            <div
              className="
                w-12
                h-12
                rounded-xl
                bg-purple-400/10
                flex
                items-center
                justify-center
              "
            >

              <Bell
                size={24}
                className="text-purple-400"
              />

            </div>

            <div>

              <h2 className="text-2xl font-semibold">
                Notifications
              </h2>

              <p className="text-slate-500 mt-1">
                Control how DoseTwin keeps you
                informed.
              </p>

            </div>

          </div>


          <div className="space-y-4">

            {/* MEDICATION REMINDERS */}

            <ToggleRow
              icon={<Pill size={21} />}
              title="Medication reminders"
              description="Receive reminders when it is time to take a medication."
              checked={
                settings.medicationReminders
              }
              onChange={(value) =>
                updateSetting(
                  "medicationReminders",
                  value
                )
              }
            />


            {/* CAREGIVER */}

            <ToggleRow
              icon={<Users size={21} />}
              title="Caregiver notifications"
              description="Allow connected caregivers to receive medication updates."
              checked={
                settings.caregiverNotifications
              }
              onChange={(value) =>
                updateSetting(
                  "caregiverNotifications",
                  value
                )
              }
            />


            {/* ADHERENCE */}

            <ToggleRow
              icon={<ShieldCheck size={21} />}
              title="Adherence alerts"
              description="Get notified when medication adherence drops."
              checked={
                settings.adherenceAlerts
              }
              onChange={(value) =>
                updateSetting(
                  "adherenceAlerts",
                  value
                )
              }
            />

          </div>

        </section>


        {/* =================================================
            DATA OVERVIEW
        ================================================= */}

        <section
          className="
            rounded-2xl
            border
            border-white/10
            bg-white/5
            p-7
            mb-6
          "
        >

          <div className="flex items-center gap-4 mb-8">

            <div
              className="
                w-12
                h-12
                rounded-xl
                bg-emerald-400/10
                flex
                items-center
                justify-center
              "
            >

              <Database
                size={24}
                className="text-emerald-400"
              />

            </div>

            <div>

              <h2 className="text-2xl font-semibold">
                Your data
              </h2>

              <p className="text-slate-500 mt-1">
                Overview of the information stored
                in this browser.
              </p>

            </div>

          </div>


          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-2
              gap-5
            "
          >

            {/* MEDICINES */}

            <div
              className="
                rounded-2xl
                border
                border-white/10
                bg-[#101c2d]
                p-6
              "
            >

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-slate-400">
                    Medicines
                  </p>

                  <h3 className="text-3xl font-bold mt-2">
                    {medicineCount}
                  </h3>

                </div>

                <Pill
                  size={27}
                  className="text-cyan-400"
                />

              </div>

            </div>


            {/* CAREGIVERS */}

            <div
              className="
                rounded-2xl
                border
                border-white/10
                bg-[#101c2d]
                p-6
              "
            >

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-slate-400">
                    Caregivers
                  </p>

                  <h3 className="text-3xl font-bold mt-2">
                    {caregiverCount}
                  </h3>

                </div>

                <Users
                  size={27}
                  className="text-purple-400"
                />

              </div>

            </div>

          </div>

        </section>


        {/* =================================================
            DANGER ZONE
        ================================================= */}

        <section
          className="
            rounded-2xl
            border
            border-red-400/20
            bg-red-400/5
            p-7
          "
        >

          <div className="flex items-center gap-4 mb-8">

            <div
              className="
                w-12
                h-12
                rounded-xl
                bg-red-400/10
                flex
                items-center
                justify-center
              "
            >

              <AlertTriangle
                size={24}
                className="text-red-400"
              />

            </div>

            <div>

              <h2 className="text-2xl font-semibold">
                Data management
              </h2>

              <p className="text-slate-500 mt-1">
                Permanently remove stored DoseTwin
                data from this browser.
              </p>

            </div>

          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* CLEAR MEDICINES */}

            <div
              className="
                rounded-2xl
                border
                border-white/10
                bg-[#101c2d]
                p-5
              "
            >

              <div className="flex items-start justify-between gap-4">

                <div>

                  <h3 className="font-semibold">
                    Remove all medicines
                  </h3>

                  <p className="text-sm text-slate-500 mt-2">
                    Delete every medicine currently
                    stored in DoseTwin.
                  </p>

                </div>

                <Pill
                  size={21}
                  className="text-red-400 shrink-0"
                />

              </div>


              <button
                onClick={clearMedicines}
                className="
                  mt-5
                  flex
                  items-center
                  gap-2
                  px-4
                  py-2.5
                  rounded-xl
                  border
                  border-red-400/20
                  bg-red-400/10
                  hover:bg-red-400/20
                  text-red-400
                  text-sm
                  font-medium
                  transition
                "
              >

                <Trash2 size={16} />

                Clear medicines

              </button>

            </div>


            {/* CLEAR CAREGIVERS */}

            <div
              className="
                rounded-2xl
                border
                border-white/10
                bg-[#101c2d]
                p-5
              "
            >

              <div className="flex items-start justify-between gap-4">

                <div>

                  <h3 className="font-semibold">
                    Remove all caregivers
                  </h3>

                  <p className="text-sm text-slate-500 mt-2">
                    Remove every caregiver connected
                    to this account.
                  </p>

                </div>

                <Users
                  size={21}
                  className="text-red-400 shrink-0"
                />

              </div>


              <button
                onClick={clearCaregivers}
                className="
                  mt-5
                  flex
                  items-center
                  gap-2
                  px-4
                  py-2.5
                  rounded-xl
                  border
                  border-red-400/20
                  bg-red-400/10
                  hover:bg-red-400/20
                  text-red-400
                  text-sm
                  font-medium
                  transition
                "
              >

                <Trash2 size={16} />

                Clear caregivers

              </button>

            </div>

          </div>

        </section>


        {/* =================================================
            FOOTER STATUS
        ================================================= */}

        <div
          className="
            mt-8
            flex
            items-center
            justify-center
            gap-2
            text-xs
            text-slate-600
          "
        >

          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />

          Settings are stored locally on this device

        </div>

      </main>

    </div>
  );
}


/* =========================================================
   TOGGLE COMPONENT
========================================================= */

function ToggleRow({
  icon,
  title,
  description,
  checked,
  onChange,
}) {
  return (
    <div
      className="
        flex
        items-center
        justify-between
        gap-6
        rounded-2xl
        border
        border-white/10
        bg-[#101c2d]
        p-5
      "
    >

      <div className="flex items-center gap-4">

        <div
          className="
            w-11
            h-11
            rounded-xl
            bg-white/5
            flex
            items-center
            justify-center
            text-slate-400
          "
        >

          {icon}

        </div>


        <div>

          <p className="font-medium">
            {title}
          </p>

          <p className="text-sm text-slate-500 mt-1">
            {description}
          </p>

        </div>

      </div>


      <button
        type="button"
        onClick={() =>
          onChange(!checked)
        }
        className={`
          relative
          w-12
          h-7
          rounded-full
          transition
          duration-200
          shrink-0
          ${
            checked
              ? "bg-cyan-400"
              : "bg-slate-700"
          }
        `}
        aria-label={`Toggle ${title}`}
      >

        <span
          className={`
            absolute
            top-1
            w-5
            h-5
            rounded-full
            bg-white
            transition
            duration-200
            ${
              checked
                ? "left-6"
                : "left-1"
            }
          `}
        />

      </button>

    </div>
  );
}


export default Settings;