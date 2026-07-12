const features = [
  {
    title: "Medicine Scanner",
    description: "Scan prescriptions and medicines instantly.",
    icon: "💊",
  },
  {
    title: "AI Chat",
    description: "Ask health questions with an AI assistant.",
    icon: "🤖",
  },
  {
    title: "Reminders",
    description: "Never miss your medicine schedule.",
    icon: "⏰",
  },
  {
    title: "Drug Interaction",
    description: "Detect harmful medicine combinations.",
    icon: "🧬",
  },
];

function Features() {
  return (
    <section className="max-w-7xl mx-auto px-8 py-24">
      <h2 className="text-5xl font-bold text-center text-white mb-16">
        Features
      </h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="bg-slate-800 rounded-2xl p-8 border border-slate-700 hover:border-cyan-400 transition hover:-translate-y-2"
          >
            <div className="text-5xl mb-6">{feature.icon}</div>

            <h3 className="text-2xl font-bold text-white mb-4">
              {feature.title}
            </h3>

            <p className="text-gray-400">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Features;