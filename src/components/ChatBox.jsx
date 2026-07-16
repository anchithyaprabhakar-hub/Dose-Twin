import { useState } from "react";
import Message from "./Message";
import ChatInput from "./ChatInput";

function ChatBox() {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! I'm your AI Health Assistant. How can I help you today?"
    }
  ]);

  function handleSend(text) {
    const userMessage = {
      sender: "user",
      text
    };

    const botReply = {
      sender: "bot",
      text: "This is a demo response. AI integration will come next."
    };

    setMessages((prev) => [...prev, userMessage, botReply]);
  }

  return (
    <div className="max-w-4xl mx-auto bg-slate-900 rounded-xl p-6">
      <div className="h-[500px] overflow-y-auto mb-6">
        {messages.map((message, index) => (
          <Message
            key={index}
            sender={message.sender}
            text={message.text}
          />
        ))}
      </div>

      <ChatInput onSend={handleSend} />
    </div>
  );
}

export default ChatBox;