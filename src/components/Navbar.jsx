import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="w-full flex items-center justify-between px-10 py-6 bg-slate-900 shadow-lg">
      <h1 className="text-3xl font-bold text-cyan-400">
        DoseTwin
      </h1>

      <div className="flex gap-8 text-gray-300">
        <Link to="/" className="hover:text-cyan-400 transition">
          Home
        </Link>

        <Link to="/medicines" className="hover:text-cyan-400 transition">
          Medicines
        </Link>

        <Link to="/aichat" className="hover:text-cyan-400 transition">
          AI Chat
        </Link>

        <Link to="/dashboard" className="hover:text-cyan-400 transition">
          Dashboard
        </Link>
      </div>

      <Link
        to="/login"
        className="bg-cyan-500 px-5 py-2 rounded-lg hover:bg-cyan-600 transition"
      >
        Login
      </Link>
    </nav>
  );
}

export default Navbar;