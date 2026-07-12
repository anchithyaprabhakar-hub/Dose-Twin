function WhyChoose() {
  const stats = [
    { number: "10K+", label: "Patients Helped" },
    { number: "99.9%", label: "Medicine Reminder Accuracy" },
    { number: "24/7", label: "AI Assistance" },
    { number: "500+", label: "Drug Interaction Checks" },
  ];

  return (
    <section className="py-24 px-8 max-w-7xl mx-auto">
      <h2 className="text-5xl font-bold text-center text-white mb-6">
        Why Choose DoseTwin?
      </h2>

      <p className="text-center text-gray-400 max-w-3xl mx-auto mb-16">
        Built with AI to make medicine management smarter, safer, and easier
        for everyone.
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((item) => (
          <div
            key={item.label}
            className="bg-slate-800 rounded-2xl p-8 text-center border border-slate-700"
          >
            <h3 className="text-5xl font-bold text-cyan-400 mb-4">
              {item.number}
            </h3>

            <p className="text-gray-300">
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default WhyChoose;