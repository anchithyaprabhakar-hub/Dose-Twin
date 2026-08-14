import { useState } from "react";
import { askGemini } from "../gemini";
import Message from "./Message";
import ChatInput from "./ChatInput";

function ChatBox() {
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Hello! I'm DoseTwin AI. I can help you understand your medication schedule, adherence, and other health-related questions. How can I help you today?",
    },
  ]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text,
      },
    ]);

    const reply = await askGemini(text);

    setMessages((prev) => [
      ...prev,
      {
        sender: "ai",
        text: reply,
      },
    ]);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0F1C2E] p-7 h-[650px] flex flex-col">

      {/* CHAT HEADER */}
      <div className="flex items-center justify-between pb-6 border-b border-white/10">

        <div>
          <h2 className="text-2xl font-semibold">
            DoseTwin AI
          </h2>

          <p className="text-slate-500 mt-1">
            Medication-aware health assistant
          </p>
        </div>

        <div className="flex items-center gap-2 text-emerald-400 text-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          3 medicines synced
        </div>

      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto space-y-5 py-6">

        {messages.map((message, index) => (
          <Message
            key={index}
            sender={message.sender}
            text={message.text}
          />
        ))}

      </div>

      {/* INPUT */}
      <ChatInput onSend={sendMessage} />

    </div>
  );
}

export default ChatBox;