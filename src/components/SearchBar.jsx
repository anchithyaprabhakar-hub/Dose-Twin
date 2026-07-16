function SearchBar({ search, setSearch }) {
  return (
    <div className="w-full max-w-2xl mx-auto mb-10">
      <input
        type="text"
        placeholder="Search medicine..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-5 py-4 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
      />
    </div>
  );
}

export default SearchBar;