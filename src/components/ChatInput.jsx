import { useState } from "react";

function ChatInput({ onSend }) {
  const [message, setMessage] = useState("");

  function handleSend() {
    if (!message.trim()) return;

    onSend(message);
    setMessage("");
  }

  return (
    <div className="flex gap-4 mt-6">
      <input
        type="text"
        placeholder="Ask about your medicine..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="flex-1 bg-slate-800 text-white rounded-lg px-4 py-3 outline-none"
      />

      <button
        onClick={handleSend}
        className="bg-cyan-500 px-6 rounded-lg font-semibold hover:bg-cyan-600"
      >
        Send
      </button>
    </div>
  );
}

export default ChatInput;