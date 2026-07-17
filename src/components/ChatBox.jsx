import { useState } from "react";
import { askGemini } from "../gemini";
import Message from "./Message";
import ChatInput from "./ChatInput";

function ChatBox() {
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Hello! I'm your AI Health Assistant. How can I help you today?",
    },
  ]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    setMessages((prev) => [...prev, { sender: "user", text }]);

    const reply = await askGemini(text);

    setMessages((prev) => [
      ...prev,
      { sender: "ai", text: reply },
    ]);
  };

  return (
    <div className="bg-slate-900 rounded-2xl p-6 h-[650px] flex flex-col">
      <div className="flex-1 overflow-y-auto space-y-4 mb-6">
        {messages.map((message, index) => (
          <Message
            key={index}
            sender={message.sender}
            text={message.text}
          />
        ))}
      </div>

      <ChatInput onSend={sendMessage} />
    </div>
  );
}

export default ChatBox;