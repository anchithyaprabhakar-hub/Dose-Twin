function MedicineCard({ medicine }) {
  return (
    <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 hover:border-cyan-400 transition">
      <h2 className="text-2xl font-bold text-cyan-400">
        {medicine.name}
      </h2>

      <p className="mt-4">
        <span className="font-semibold">Dosage:</span> {medicine.dosage}
      </p>

      <p>
        <span className="font-semibold">Use:</span> {medicine.use}
      </p>

      <p>
        <span className="font-semibold">Interaction:</span>{" "}
        {medicine.interaction}
      </p>
    </div>
  );
}

export default MedicineCard;