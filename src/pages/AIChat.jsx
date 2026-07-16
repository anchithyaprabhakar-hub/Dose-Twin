import Navbar from "../components/Navbar";
import ChatBox from "../components/ChatBox";

function AIChat() {
  return (
    <div className="min-h-screen bg-[#0B1120] text-white">
      <Navbar />

      <section className="max-w-6xl mx-auto py-16 px-6">
        <h1 className="text-5xl font-bold text-center mb-12">
          AI Health Assistant
        </h1>

        <ChatBox />
      </section>
    </div>
  );
}

export default AIChat;