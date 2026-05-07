import { useState, useEffect, useContext } from "react";
import API from "../api";
import { AuthContext } from "../context/AuthContext";

function Tasks() {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [projectId, setProjectId] = useState("");

  const fetchTasks = async () => {
    try {
      const res = await API.get("/tasks");
      setTasks(res.data || []);
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    }
  };

  useEffect(() => {
    void (async () => {
      await fetchTasks();
    })();
  }, []);

  const addTask = async () => {
    if (!title) return;
    try {
      await API.post("/tasks", { title, project_id: projectId });
      setTitle("");
      setProjectId("");
      fetchTasks();
    } catch (err) {
      console.error("Add task failed", err);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/tasks/${id}`, { status });
      fetchTasks();
    } catch (err) {
      console.error("Update status failed", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-slate-800 bg-slate-900/85 p-6">
        <h1 className="text-2xl font-semibold text-white">Tasks</h1>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-slate-400">Create and update tasks with a clean, efficient workflow.</p>
          {user?.role === "admin" ? (
            <a href="/admin" className="rounded-2xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-400">Open Admin Center</a>
          ) : (
            <span className="rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-2 text-sm text-slate-300">Task creation is managed by admins.</span>
          )}
        </div>

        {user?.role === "admin" && (
          <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto]">
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                placeholder="Task Title"
                className="rounded-2xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <input
                placeholder="Project ID"
                className="rounded-2xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
              />
            </div>

            <div className="flex items-center">
              <button
                onClick={addTask}
                className="rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-3 text-white font-semibold transition hover:shadow-lg hover:shadow-emerald-500/40 hover:-translate-y-1 duration-200"
              >
                ➕ Add
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-5">
        {tasks.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-600 bg-slate-950/30 p-12 text-center">
            <p className="text-4xl mb-3">✨</p>
            <p className="text-slate-400">No tasks yet. Create one to get started!</p>
          </div>
        )}

        {tasks.map((t) => (
          <div key={t.id} className="rounded-2xl border border-slate-700 bg-gradient-to-r from-slate-900/70 to-slate-800/70 p-6 shadow-lg shadow-black/20 transition hover:-translate-y-2 hover:border-slate-600 duration-300 backdrop-blur-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white">{t.title}</h3>
                <div className="mt-2 flex items-center gap-3">
                  <span className={`inline-flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-semibold ${statusClasses[t.status] || statusClasses.Todo}`}>
                    {t.status === 'Done' && '✅'}
                    {t.status === 'In Progress' && '⚡'}
                    {t.status === 'Todo' && '📋'}
                    {t.status}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => updateStatus(t.id, "Todo")} className={`rounded-lg px-4 py-2 font-medium transition duration-200 ${t.status === 'Todo' ? 'bg-rose-500/40 text-rose-300 border border-rose-500' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>Todo</button>
                <button onClick={() => updateStatus(t.id, "In Progress")} className={`rounded-lg px-4 py-2 font-medium transition duration-200 ${t.status === 'In Progress' ? 'bg-amber-500/40 text-amber-300 border border-amber-500' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>Progress</button>
                <button onClick={() => updateStatus(t.id, "Done")} className={`rounded-lg px-4 py-2 font-medium transition duration-200 ${t.status === 'Done' ? 'bg-emerald-500/40 text-emerald-300 border border-emerald-500' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>Done</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const statusClasses = {
  Todo: "bg-rose-500/30 text-rose-300 border border-rose-500/50",
  "In Progress": "bg-amber-500/30 text-amber-300 border border-amber-500/50",
  Done: "bg-emerald-500/30 text-emerald-300 border border-emerald-500/50",
};

export default Tasks;