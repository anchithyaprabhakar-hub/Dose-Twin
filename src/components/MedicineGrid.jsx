import MedicineCard from "./MedicineCard";

function MedicineGrid({ medicines }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {medicines.map((medicine) => (
        <MedicineCard key={medicine.id} medicine={medicine} />
      ))}
    </div>
  );
}

export default MedicineGrid;