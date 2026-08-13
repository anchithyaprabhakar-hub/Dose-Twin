import { useEffect, useState } from "react";

import {
  UserRoundPlus,
  Users,
  X,
  Trash2,
  Mail,
  Phone,
  ShieldCheck,
  Bell,
  CheckCircle2,
  UserRound,
} from "lucide-react";

const STORAGE_KEY = "dosetwin_caregivers";

/* =========================================================
   DEFAULT DATA
========================================================= */

function loadCaregivers() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Could not load caregivers:", error);
    return [];
  }
}


/* =========================================================
   SAVE DATA
========================================================= */

function saveCaregivers(caregivers) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(caregivers)
    );
  } catch (error) {
    console.error(
      "Could not save caregivers:",
      error
    );
  }
}


/* =========================================================
   CAREGIVER PAGE
========================================================= */

function Caregiver() {
  const [caregivers, setCaregivers] = useState(
    loadCaregivers
  );

  const [showModal, setShowModal] =
    useState(false);

  const [form, setForm] = useState({
    name: "",
    relationship: "Family Member",
    email: "",
    phone: "",
    notifications: true,
  });


  /* =======================================================
     SYNC WITH LOCAL STORAGE
  ======================================================= */

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === STORAGE_KEY) {
        setCaregivers(loadCaregivers());
      }
    };

    window.addEventListener(
      "storage",
      handleStorageChange
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorageChange
      );
    };
  }, []);


  /* =======================================================
     OPEN MODAL
  ======================================================= */

  const openModal = () => {
    setForm({
      name: "",
      relationship: "Family Member",
      email: "",
      phone: "",
      notifications: true,
    });

    setShowModal(true);
  };


  /* =======================================================
     CLOSE MODAL
  ======================================================= */

  const closeModal = () => {
    setShowModal(false);
  };


  /* =======================================================
     FORM CHANGE
  ======================================================= */

  const handleChange = (event) => {
    const { name, value, type, checked } =
      event.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };


  /* =======================================================
     ADD CAREGIVER
  ======================================================= */

  const handleAddCaregiver = (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      return;
    }

    if (!form.email.trim() && !form.phone.trim()) {
      return;
    }

    const newCaregiver = {
      id: Date.now(),
      name: form.name.trim(),
      relationship: form.relationship,
      email: form.email.trim(),
      phone: form.phone.trim(),
      notifications: form.notifications,
      status: "Active",
      addedAt: new Date().toISOString(),
    };

    const updatedCaregivers = [
      ...caregivers,
      newCaregiver,
    ];

    setCaregivers(updatedCaregivers);

    saveCaregivers(updatedCaregivers);

    setShowModal(false);

    setForm({
      name: "",
      relationship: "Family Member",
      email: "",
      phone: "",
      notifications: true,
    });
  };


  /* =======================================================
     DELETE CAREGIVER
  ======================================================= */

  const handleDelete = (id) => {
    const updatedCaregivers =
      caregivers.filter(
        (caregiver) =>
          caregiver.id !== id
      );

    setCaregivers(updatedCaregivers);

    saveCaregivers(updatedCaregivers);
  };


  return (
    <div className="min-h-screen bg-[#08111F] text-white">

      <main className="max-w-[1400px] mx-auto px-6 md:px-8 py-10">

        {/* =================================================
            HEADER
        ================================================= */}

        <section className="mb-10">

          <div
            className="
              flex
              flex-col
              md:flex-row
              md:items-start
              md:justify-between
              gap-6
            "
          >

            <div>

              <p className="text-cyan-400 text-sm font-medium tracking-wide mb-3">
                CAREGIVER MANAGEMENT
              </p>

              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Caregiver
              </h1>

              <p className="text-lg text-slate-400 mt-4 max-w-3xl">
                Monitor medication adherence and
                stay informed about the patient's
                medication routine.
              </p>

            </div>


            {/* ONLY ADD BUTTON */}

            <button
              onClick={openModal}
              className="
                flex
                items-center
                justify-center
                gap-2
                bg-cyan-400
                hover:bg-cyan-300
                text-[#06111f]
                font-semibold
                px-6
                py-4
                rounded-2xl
                transition
                duration-200
                shrink-0
              "
            >

              <UserRoundPlus size={21} />

              Add Caregiver

            </button>

          </div>

        </section>


        {/* =================================================
            CAREGIVER ACCESS
        ================================================= */}

        <section
          className="
            rounded-2xl
            border
            border-white/10
            bg-white/5
            p-7
            mb-8
          "
        >

          <div
            className="
              flex
              items-start
              justify-between
              mb-8
            "
          >

            <div>

              <h2 className="text-2xl font-semibold">
                Caregiver access
              </h2>

              <p className="text-slate-500 mt-2">
                People connected to your medication
                monitoring.
              </p>

            </div>


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

              <Users
                size={25}
                className="text-cyan-400"
              />

            </div>

          </div>


          {/* =================================================
              EMPTY STATE
          ================================================= */}

          {caregivers.length === 0 ? (

            <div
              className="
                min-h-[280px]
                rounded-2xl
                border
                border-dashed
                border-white/10
                flex
                flex-col
                items-center
                justify-center
                text-center
                px-6
              "
            >

              <div
                className="
                  w-16
                  h-16
                  rounded-full
                  bg-slate-800
                  flex
                  items-center
                  justify-center
                  mb-5
                "
              >

                <UserRound
                  size={30}
                  className="text-slate-500"
                />

              </div>

              <h3 className="text-xl font-semibold">
                No caregivers added
              </h3>

              <p className="text-slate-500 mt-3 max-w-md">
                Add a trusted person to monitor
                your medication routine.
              </p>

              {/* NO SECOND BUTTON */}

            </div>

          ) : (

            /* =================================================
               CAREGIVER LIST
            ================================================= */

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

              {caregivers.map((caregiver) => (

                <div
                  key={caregiver.id}
                  className="
                    rounded-2xl
                    border
                    border-white/10
                    bg-[#101c2d]
                    p-6
                  "
                >

                  {/* TOP */}

                  <div
                    className="
                      flex
                      items-start
                      justify-between
                      gap-4
                    "
                  >

                    <div className="flex items-center gap-4">

                      <div
                        className="
                          w-14
                          h-14
                          rounded-full
                          bg-cyan-400/10
                          border
                          border-cyan-400/20
                          flex
                          items-center
                          justify-center
                        "
                      >

                        <UserRound
                          size={27}
                          className="text-cyan-400"
                        />

                      </div>


                      <div>

                        <h3 className="text-lg font-semibold">
                          {caregiver.name}
                        </h3>

                        <p className="text-sm text-cyan-400 mt-1">
                          {caregiver.relationship}
                        </p>

                      </div>

                    </div>


                    <button
                      onClick={() =>
                        handleDelete(
                          caregiver.id
                        )
                      }
                      className="
                        w-10
                        h-10
                        rounded-xl
                        bg-red-400/10
                        hover:bg-red-400/20
                        text-red-400
                        flex
                        items-center
                        justify-center
                        transition
                      "
                      title="Remove caregiver"
                    >

                      <Trash2 size={18} />

                    </button>

                  </div>


                  {/* CONTACT */}

                  <div className="mt-6 space-y-3">

                    {caregiver.email && (

                      <div
                        className="
                          flex
                          items-center
                          gap-3
                          text-sm
                          text-slate-400
                        "
                      >

                        <Mail
                          size={17}
                          className="text-slate-500"
                        />

                        {caregiver.email}

                      </div>

                    )}


                    {caregiver.phone && (

                      <div
                        className="
                          flex
                          items-center
                          gap-3
                          text-sm
                          text-slate-400
                        "
                      >

                        <Phone
                          size={17}
                          className="text-slate-500"
                        />

                        {caregiver.phone}

                      </div>

                    )}

                  </div>


                  {/* STATUS */}

                  <div
                    className="
                      mt-6
                      pt-5
                      border-t
                      border-white/10
                      flex
                      items-center
                      justify-between
                    "
                  >

                    <div
                      className="
                        flex
                        items-center
                        gap-2
                        text-sm
                        text-emerald-400
                      "
                    >

                      <CheckCircle2 size={16} />

                      Active

                    </div>


                    {caregiver.notifications && (

                      <div
                        className="
                          flex
                          items-center
                          gap-2
                          text-sm
                          text-slate-400
                        "
                      >

                        <Bell size={16} />

                        Notifications enabled

                      </div>

                    )}

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>


        {/* =================================================
            INFORMATION CARDS
        ================================================= */}

        <section
          className="
            grid
            grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-4
            gap-6
          "
        >

          <div
            className="
              rounded-2xl
              border
              border-cyan-400/20
              bg-cyan-400/5
              p-6
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
                mb-5
              "
            >

              <Users
                size={23}
                className="text-cyan-400"
              />

            </div>

            <p className="text-slate-400">
              Connected caregivers
            </p>

            <h3 className="text-3xl font-bold mt-2">
              {caregivers.length}
            </h3>

          </div>


          <div
            className="
              rounded-2xl
              border
              border-white/10
              bg-white/5
              p-6
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
                mb-5
              "
            >

              <ShieldCheck
                size={23}
                className="text-purple-400"
              />

            </div>

            <p className="text-slate-400">
              Access status
            </p>

            <h3 className="text-2xl font-bold mt-2">
              {caregivers.length > 0
                ? "Protected"
                : "Not configured"}
            </h3>

          </div>


          <div
            className="
              rounded-2xl
              border
              border-white/10
              bg-white/5
              p-6
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
                mb-5
              "
            >

              <Bell
                size={23}
                className="text-emerald-400"
              />

            </div>

            <p className="text-slate-400">
              Notifications
            </p>

            <h3 className="text-2xl font-bold mt-2">
              {caregivers.filter(
                (caregiver) =>
                  caregiver.notifications
              ).length > 0
                ? "Enabled"
                : "Disabled"}
            </h3>

          </div>


          <div
            className="
              rounded-2xl
              border
              border-white/10
              bg-white/5
              p-6
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
                mb-5
              "
            >

              <CheckCircle2
                size={23}
                className="text-orange-400"
              />

            </div>

            <p className="text-slate-400">
              System status
            </p>

            <h3 className="text-2xl font-bold mt-2 text-emerald-400">
              Synchronized
            </h3>

          </div>

        </section>

      </main>


      {/* =====================================================
          ADD CAREGIVER MODAL
      ===================================================== */}

      {showModal && (

        <div
          className="
            fixed
            inset-0
            z-50
            bg-black/70
            backdrop-blur-sm
            flex
            items-center
            justify-center
            p-4
          "
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              closeModal();
            }
          }}
        >

          <div
            className="
              w-full
              max-w-2xl
              max-h-[90vh]
              overflow-y-auto
              rounded-3xl
              border
              border-white/10
              bg-[#0b1829]
              shadow-2xl
            "
          >

            {/* MODAL HEADER */}

            <div
              className="
                flex
                items-center
                justify-between
                px-7
                py-6
                border-b
                border-white/10
              "
            >

              <div>

                <h2 className="text-2xl font-semibold">
                  Add Caregiver
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Connect someone you trust to
                  your medication monitoring.
                </p>

              </div>


              <button
                onClick={closeModal}
                className="
                  w-10
                  h-10
                  rounded-xl
                  bg-white/5
                  hover:bg-white/10
                  flex
                  items-center
                  justify-center
                  text-slate-400
                  hover:text-white
                  transition
                "
              >

                <X size={20} />

              </button>

            </div>


            {/* FORM */}

            <form
              onSubmit={handleAddCaregiver}
              className="p-7"
            >

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* NAME */}

                <div>

                  <label className="block text-sm text-slate-400 mb-2">
                    Full name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Ananya Sharma"
                    required
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
                      transition
                    "
                  />

                </div>


                {/* RELATIONSHIP */}

                <div>

                  <label className="block text-sm text-slate-400 mb-2">
                    Relationship
                  </label>

                  <select
                    name="relationship"
                    value={form.relationship}
                    onChange={handleChange}
                    className="
                      w-full
                      h-12
                      rounded-xl
                      border
                      border-white/10
                      bg-white/5
                      px-4
                      text-white
                      outline-none
                      focus:border-cyan-400/50
                      transition
                    "
                  >

                    <option
                      value="Family Member"
                      className="bg-[#0b1829]"
                    >
                      Family Member
                    </option>

                    <option
                      value="Nurse"
                      className="bg-[#0b1829]"
                    >
                      Nurse
                    </option>

                    <option
                      value="Doctor"
                      className="bg-[#0b1829]"
                    >
                      Doctor
                    </option>

                    <option
                      value="Friend"
                      className="bg-[#0b1829]"
                    >
                      Friend
                    </option>

                    <option
                      value="Other"
                      className="bg-[#0b1829]"
                    >
                      Other
                    </option>

                  </select>

                </div>


                {/* EMAIL */}

                <div>

                  <label className="block text-sm text-slate-400 mb-2">
                    Email address
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="e.g. caregiver@email.com"
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
                      transition
                    "
                  />

                </div>


                {/* PHONE */}

                <div>

                  <label className="block text-sm text-slate-400 mb-2">
                    Phone number
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="e.g. +91 98765 43210"
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
                      transition
                    "
                  />

                </div>

              </div>


              {/* CONTACT VALIDATION */}

              <p className="text-xs text-slate-600 mt-3">
                Enter at least an email address or
                phone number.
              </p>


              {/* NOTIFICATIONS */}

              <div
                className="
                  mt-6
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/5
                  p-5
                "
              >

                <label
                  className="
                    flex
                    items-center
                    justify-between
                    gap-4
                    cursor-pointer
                  "
                >

                  <div>

                    <p className="font-medium">
                      Medication notifications
                    </p>

                    <p className="text-sm text-slate-500 mt-1">
                      Allow this caregiver to receive
                      medication adherence updates.
                    </p>

                  </div>


                  <input
                    type="checkbox"
                    name="notifications"
                    checked={
                      form.notifications
                    }
                    onChange={handleChange}
                    className="
                      w-5
                      h-5
                      accent-cyan-400
                    "
                  />

                </label>

              </div>


              {/* BUTTONS */}

              <div
                className="
                  flex
                  justify-end
                  gap-3
                  mt-7
                "
              >

                <button
                  type="button"
                  onClick={closeModal}
                  className="
                    px-6
                    py-3
                    rounded-xl
                    border
                    border-white/10
                    bg-white/5
                    hover:bg-white/10
                    text-slate-300
                    transition
                  "
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="
                    flex
                    items-center
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

                  <UserRoundPlus size={18} />

                  Add Caregiver

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default Caregiver;