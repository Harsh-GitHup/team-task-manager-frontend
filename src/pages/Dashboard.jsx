import { useState, useEffect, useContext } from "react";
import PropTypes from "prop-types";
import API from "../api";
import { AuthContext } from "../context/AuthContext";

function Dashboard() {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const projectRes = await API.get("/projects");
        const taskRes = await API.get("/tasks");

        setProjects(projectRes.data || []);
        setTasks(taskRes.data || []);
      } catch (err) {
        console.log("Dashboard Error:", err);
      }
    };
    fetchData();
  }, []);

  const completed = tasks.filter((t) => t.status === "Done").length;
  const progress = tasks.filter((t) => t.status === "In Progress").length;
  const todo = tasks.filter((t) => t.status === "Todo").length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="rounded-[2rem] border border-slate-800 bg-slate-900/85 p-8 shadow-2xl shadow-black/20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl font-semibold text-white">Dashboard</h1>
            <p className="mt-2 text-slate-400">Overview of your active projects, tasks, and team progress.</p>
          </div>
          <div className="flex flex-col items-start gap-3 sm:items-end">
            <div className="flex rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-300">
              Role: {user?.role || "Member"}
            </div>
            {user?.role === "admin" && (
              <a href="/admin" className="flex rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-3 text-sm font-semibold text-white transition hover:shadow-lg hover:shadow-cyan-500/30">
                Open Admin Center
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-5 md:grid-cols-2 sm:grid-cols-1">
        <StatCard label="Projects" value={projects.length} color="cyan" emoji="📁" />
        <StatCard label="Total Tasks" value={tasks.length} color="blue" emoji="✅" />
        <StatCard label="Completed" value={completed} color="emerald" emoji="🎉" />
        <StatCard label="In Progress" value={progress} color="amber" emoji="⚡" />
        <StatCard label="To Do" value={todo} color="rose" emoji="📋" />
      </div>

      {user?.role === "admin" && (
        <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-6 backdrop-blur-sm">
          <a href="/admin" className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 text-white font-semibold transition hover:shadow-lg hover:shadow-cyan-500/40 hover:-translate-y-1 duration-200 flex items-center gap-2">
            <span>🛠️</span> Create Team / Assign Work
          </a>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color = "cyan", emoji = "" }) {
  const colorMap = {
    cyan: ["from-cyan-950/60", "text-cyan-300", "shadow-cyan-500/20", "border-cyan-500/30"],
    blue: ["from-blue-950/60", "text-blue-300", "shadow-blue-500/20", "border-blue-500/30"],
    emerald: ["from-emerald-950/60", "text-emerald-300", "shadow-emerald-500/20", "border-emerald-500/30"],
    amber: ["from-amber-950/60", "text-amber-300", "shadow-amber-500/20", "border-amber-500/30"],
    rose: ["from-rose-950/60", "text-rose-300", "shadow-rose-500/20", "border-rose-500/30"],
  };

  const [bgFrom, textColor, shadowColor, borderColor] = colorMap[color] || colorMap.cyan;

  return (
    <div className={`rounded-2xl border ${borderColor} bg-gradient-to-br ${bgFrom} to-slate-900/80 p-7 shadow-lg ${shadowColor} transition hover:-translate-y-2 hover:duration-300 backdrop-blur-sm`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest font-semibold">{label}</p>
          <p className={`mt-4 text-5xl font-bold ${textColor}`}>{value}</p>
        </div>
        <span className="text-4xl opacity-20">{emoji}</span>
      </div>
    </div>
  );
}

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  color: PropTypes.string,
  emoji: PropTypes.string,
};

export default Dashboard;
