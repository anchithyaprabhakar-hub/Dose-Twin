export const defaultMedicines = [
  {
    id: 1,
    name: "Metformin",
    dosage: "500 mg",
    schedule: "Morning",
    time: "8:00 AM",
    instructions: "Take after breakfast",
    taken: true,
  },
  {
    id: 2,
    name: "Omega 3",
    dosage: "1000 mg",
    schedule: "Afternoon",
    time: "1:00 PM",
    instructions: "Take with food",
    taken: true,
  },
  {
    id: 3,
    name: "Vitamin D",
    dosage: "1000 IU",
    schedule: "Evening",
    time: "7:30 PM",
    instructions: "Take after dinner",
    taken: false,
  },
];

export const getMedicines = () => {
  const saved = localStorage.getItem("dosetwin_medicines");

  if (saved) {
    return JSON.parse(saved);
  }

  localStorage.setItem(
    "dosetwin_medicines",
    JSON.stringify(defaultMedicines)
  );

  return defaultMedicines;
};

export const saveMedicines = (medicines) => {
  localStorage.setItem(
    "dosetwin_medicines",
    JSON.stringify(medicines)
  );
};