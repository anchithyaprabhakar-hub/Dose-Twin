function Navbar() {
  return (
    <nav className="w-full flex items-center justify-between px-10 py-6 bg-slate-900 shadow-lg">
      <h1 className="text-3xl font-bold text-cyan-400">
        DoseTwin
      </h1>

      <div className="flex gap-8 text-gray-300">
        <a href="#">Home</a>
        <a href="#">Medicines</a>
        <a href="#">AI Chat</a>
        <a href="#">Dashboard</a>
      </div>

      <button className="bg-cyan-500 px-5 py-2 rounded-lg hover:bg-cyan-600 transition">
        Login
      </button>
    </nav>
  );
}

export default Navbar;