import { useState } from "react";

function ChatInput({ onSend }) {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!text.trim()) return;

    onSend(text);
    setText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="flex gap-4">
      <input
        type="text"
        placeholder="Ask about your medicine..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 bg-slate-800 rounded-xl px-6 py-4 text-white outline-none"
      />

      <button
        onClick={handleSend}
        className="bg-cyan-500 hover:bg-cyan-600 px-8 rounded-xl font-semibold"
      >
        Send
      </button>
    </div>
  );
}

export default ChatInput;