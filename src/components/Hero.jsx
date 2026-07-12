function Hero() {
  return (
    <section className="min-h-[90vh] flex flex-col justify-center items-center text-center px-6">
      <p className="text-cyan-400 uppercase tracking-[6px] font-semibold">
        AI Powered Healthcare
      </p>

      <h1 className="text-6xl md:text-8xl font-extrabold mt-6">
        Smart Medicine
        <br />
        <span className="text-cyan-400">Companion</span>
      </h1>

      <p className="mt-8 max-w-2xl text-gray-400 text-lg">
        DoseTwin helps patients manage medicines, detect drug interactions,
        receive AI-powered guidance, and stay on track with prescriptions.
      </p>

      <div className="mt-10 flex gap-6">
        <button className="bg-cyan-500 px-8 py-4 rounded-xl font-semibold hover:bg-cyan-600 transition">
          Get Started
        </button>

        <button className="border border-cyan-500 text-cyan-400 px-8 py-4 rounded-xl hover:bg-cyan-500 hover:text-white transition">
          Learn More
        </button>
      </div>
    </section>
  );
}

export default Hero;