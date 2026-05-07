import { useState, useEffect, useContext } from "react";
import API from "../api";
import { AuthContext } from "../context/AuthContext";

function Projects() {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // ✅ FIXED useEffect
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await API.get("/projects");
        setProjects(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchProjects();
  }, []);

  // ✅ Add Project
  const addProject = async () => {
    if (!title || !description) {
      alert("Fill all fields");
      return;
    }

    try {
      await API.post("/projects", {
        title,
        description,
      });

      setTitle("");
      setDescription("");

      // refresh
      const res = await API.get("/projects");
      setProjects(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="rounded-[2rem] border border-slate-800 bg-slate-900/85 p-8 shadow-2xl shadow-black/20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-white">Projects</h1>
            <p className="mt-2 text-slate-400">Add, track, and manage your project portfolio.</p>
          </div>
          {user?.role === "admin" ? (
            <a
              href="/admin"
              className="rounded-2xl bg-cyan-500 px-5 py-3 text-white transition hover:bg-cyan-400"
            >
              Open Admin Center
            </a>
          ) : (
            <div className="rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-slate-300">
              Project creation is managed by admins.
            </div>
          )}
        </div>

        {user?.role === "admin" && (
          <div className="mt-6 grid gap-4">
            <input
              placeholder="Project Title"
              className="w-full rounded-2xl border border-slate-600 bg-slate-950/50 px-4 py-3 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 transition backdrop-blur-sm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <input
              placeholder="Description"
              className="w-full rounded-2xl border border-slate-600 bg-slate-950/50 px-4 py-3 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 transition backdrop-blur-sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <button
              onClick={addProject}
              className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-3 text-white font-semibold transition hover:shadow-lg hover:shadow-cyan-500/30"
            >
              Create Project in Admin Center
            </button>
          </div>
        )}
      </div>

      <div className="grid gap-5">
        {projects.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-600 bg-slate-950/30 p-12 text-center">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-slate-400">No projects yet. Create your first project above!</p>
          </div>
        )}

        {projects.map((p) => (
          <div key={p.id} className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/60 to-slate-800/60 p-7 shadow-lg shadow-cyan-500/10 transition hover:-translate-y-2 hover:border-cyan-500/40 hover:shadow-cyan-500/20 duration-300 backdrop-blur-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-cyan-300 flex items-center gap-2">
                  <span>📁</span> {p.title}
                </h3>
                <p className="mt-3 text-slate-300 leading-relaxed">{p.description}</p>
                <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-900/50 px-3 py-1 text-xs text-slate-400">
                  <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
                  <span>Active</span>
                </div>
              </div>
              <span className="text-3xl opacity-20">→</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Projects;