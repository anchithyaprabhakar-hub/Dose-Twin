function Message({ sender, text }) {
  const isUser = sender === "user";

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}
    >
      <div
        className={`max-w-lg px-4 py-3 rounded-xl ${
          isUser
            ? "bg-cyan-500 text-white"
            : "bg-slate-800 text-gray-200"
        }`}
      >
        {text}
      </div>
    </div>
  );
}

export default Message;