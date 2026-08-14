import ChatBox from "../components/ChatBox";

function AIChat() {
  return (
    <div className="min-h-screen bg-[#08111F] text-white">
      <main className="max-w-[1400px] mx-auto px-8 py-10">

        {/* PAGE HEADER */}
        <section className="mb-10">
          <p className="text-cyan-400 text-sm font-medium tracking-wide mb-3">
            DOSETWIN AI
          </p>

          <h1 className="text-5xl font-bold tracking-tight">
            AI Health Assistant
          </h1>

          <p className="text-lg text-slate-400 mt-4 max-w-3xl">
            Ask questions about your medication schedule, adherence, and DoseTwin data.
          </p>
        </section>

        {/* CHAT */}
        <ChatBox />

      </main>
    </div>
  );
}

export default AIChat;