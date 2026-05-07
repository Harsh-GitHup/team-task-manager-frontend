import { useState } from "react";
import { Link, useLocation  } from "react-router-dom";
import API from "../api";

function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const invite = params.get('invite');

  const handleSignup = async () => {
    try {
      const payload = { ...form };
      if (invite) {
        payload.invite_token = invite;
        // force role to 'user' for invite signup's
        payload.role = 'user';
      }
      const res = await API.post("/auth/signup", payload);
      setMessage(res.data?.message || "Signup success");
      setMessageType("success");
    } catch (err) {
      const serverMessage = err.response?.data?.error || err.response?.data || "Signup failed. Please try again.";
      setMessage(serverMessage);
      setMessageType("error");
    }
  };

  const clearMessage = () => {
    setMessage("");
    setMessageType("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-10 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-emerald-500/30 rounded-full blur-3xl" />
      </div>
      <div className="w-full max-w-md relative z-10">
        <div className="rounded-[2.5rem] border border-slate-700/50 bg-slate-900/80 p-8 shadow-2xl shadow-cyan-500/20 backdrop-blur-xl">
          <div className="mb-8 text-center">
            <div className="inline-block mb-4 p-3 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl text-2xl">+</div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Get Started</h1>
            <p className="mt-3 text-sm text-slate-400">Join your team and manage tasks together.</p>
          </div>

          {message && (
            <div className={`mb-6 rounded-2xl border px-4 py-3 text-sm transition-all duration-300 ${messageType === "success" ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-200" : "bg-rose-500/20 border-rose-500/50 text-rose-200"}`}>
              {message}
            </div>
          )}

          <div className="space-y-4">
            <input
              placeholder="Full Name"
              className="w-full rounded-2xl border border-slate-600 bg-slate-950/50 px-4 py-3 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 transition backdrop-blur-sm"
              onChange={(e) => {
                setForm({ ...form, name: e.target.value });
                clearMessage();
              }}
            />
            <input
              placeholder="Email"
              className="w-full rounded-2xl border border-slate-600 bg-slate-950/50 px-4 py-3 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 transition backdrop-blur-sm"
              onChange={(e) => {
                setForm({ ...form, email: e.target.value });
                clearMessage();
              }}
            />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full rounded-2xl border border-slate-600 bg-slate-950/50 px-4 py-3 pr-24 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 transition backdrop-blur-sm"
              value={form.password}
              onChange={(e) => {
                setForm({ ...form, password: e.target.value });
                clearMessage();
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="-mt-16 ml-auto mr-3 block rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-xs font-semibold text-slate-300 transition hover:border-cyan-400 hover:text-cyan-300"
            >
              {showPassword ? "Hide" : "Show"}
            </button>

            {!invite && (
              <select
                className="w-full rounded-2xl border border-slate-600 bg-slate-950/50 px-4 py-3 text-white focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 transition backdrop-blur-sm cursor-pointer"
                onChange={(e) => {
                  setForm({ ...form, role: e.target.value });
                  clearMessage();
                }}
              >
                <option value="user" className="bg-slate-900">Member</option>
                <option value="admin" className="bg-slate-900">Admin</option>
              </select>
            )}

            {invite && (
              <div className="text-sm text-slate-400">Signing up via invite — role will be Member.</div>
            )}
          </div>

          <button
            onClick={handleSignup}
            className="w-full mt-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-3 text-white font-semibold shadow-lg shadow-emerald-500/40 transition hover:shadow-emerald-500/60 hover:-translate-y-1 active:scale-[0.98] duration-200"
          >
            Create Account
          </button>

          <p className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-cyan-400 hover:text-cyan-300 transition">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;