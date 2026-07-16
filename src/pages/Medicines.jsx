import { useState } from "react";

import medicines from "../data/medicines";
import SearchBar from "../components/SearchBar";
import MedicineGrid from "../components/MedicineGrid";

function Medicines() {
  const [search, setSearch] = useState("");

  const filteredMedicines = medicines.filter((medicine) =>
    medicine.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white px-10 py-16">
      <h1 className="text-5xl font-bold text-center mb-12">
        Medicines
      </h1>

      <SearchBar search={search} setSearch={setSearch} />

      <MedicineGrid medicines={filteredMedicines} />
    </div>
  );
}

export default Medicines;