import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function Sidebar() {
  const { user, logout } = useContext(AuthContext);
  return (
    <div className="w-64 border-r border-slate-800 bg-gradient-to-b from-slate-950 to-slate-900 shadow-2xl shadow-black/40 h-screen p-6 flex flex-col">
      <div className="mb-8 pb-6 border-b border-slate-800">
        <div className="inline-block p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl mb-3">
          <span className="text-white font-bold text-lg">✓</span>
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">TaskHub</h2>
        <p className="text-xs text-slate-500 mt-1">Manage your team</p>
      </div>

      <nav className="flex-1 flex flex-col gap-2">
        <Link to="/" className="rounded-xl px-4 py-3 transition duration-200 flex items-center gap-3 text-slate-300 hover:bg-slate-800/60 hover:text-cyan-300 hover:border-l-4 hover:border-cyan-400 group">
          <span className="text-lg">📊</span>
          <span className="font-medium">Dashboard</span>
        </Link>
        <Link to="/projects" className="rounded-xl px-4 py-3 transition duration-200 flex items-center gap-3 text-slate-300 hover:bg-slate-800/60 hover:text-cyan-300 hover:border-l-4 hover:border-cyan-400">
          <span className="text-lg">📁</span>
          <span className="font-medium">Projects</span>
        </Link>
        <Link to="/tasks" className="rounded-xl px-4 py-3 transition duration-200 flex items-center gap-3 text-slate-300 hover:bg-slate-800/60 hover:text-cyan-300 hover:border-l-4 hover:border-cyan-400">
          <span className="text-lg">✅</span>
          <span className="font-medium">Tasks</span>
        </Link>
        <Link to="/chat" className="rounded-xl px-4 py-3 transition duration-200 flex items-center gap-3 text-slate-300 hover:bg-slate-800/60 hover:text-cyan-300 hover:border-l-4 hover:border-cyan-400">
          <span className="text-lg">💬</span>
          <span className="font-medium">Chat</span>
        </Link>
        {user?.role === "admin" && (
          <Link to="/admin" className="rounded-xl px-4 py-3 transition duration-200 flex items-center gap-3 text-slate-300 hover:bg-slate-800/60 hover:text-cyan-300 hover:border-l-4 hover:border-cyan-400">
            <span className="text-lg">🛠️</span>
            <span className="font-medium">Admin Center</span>
          </Link>
        )}
      </nav>
      <button
        onClick={logout}
        className="w-full rounded-xl bg-gradient-to-r from-rose-500 to-red-500 px-4 py-3 text-white font-semibold transition hover:shadow-lg hover:shadow-rose-500/40 hover:-translate-y-0.5 duration-200 flex items-center justify-center gap-2"
      >
        <span>🚪</span> Logout
      </button>
    </div>
  );
}

export default Sidebar;