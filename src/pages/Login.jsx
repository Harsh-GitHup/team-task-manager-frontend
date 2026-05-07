import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import API from "../api";
import { AuthContext } from "../context/AuthContext";

function Login() {
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [showSignupLink, setShowSignupLink] = useState(false);

  const handleLogin = async () => {
    try {
      const res = await API.post("/auth/login", {
        email,
        password,
      });

      login(res.data);
      globalThis.location.href = "/";
    } catch (err) {
      const serverMessage =
        err.response?.data?.error ||
        (typeof err.response?.data === "string" ? err.response.data : null);

      if (err.response?.status === 404) {
        setMessage(serverMessage || "User not found. New here?");
        setMessageType("error");
        setShowSignupLink(true);
      } else if (err.response?.status === 401) {
        setMessage(serverMessage || "Wrong password");
        setMessageType("error");
        setShowSignupLink(false);
      } else {
        setMessage(serverMessage || "Login failed. Please try again.");
        setMessageType("error");
        setShowSignupLink(false);
      }
    }
  };

  const clearError = () => {
    setMessage("");
    setMessageType("");
    setShowSignupLink(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-10 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-blue-500/30 rounded-full blur-3xl"></div>
      </div>
      <div className="w-full max-w-md relative z-10">
        <div className="rounded-[2.5rem] border border-slate-700/50 bg-slate-900/80 p-8 shadow-2xl shadow-cyan-500/20 backdrop-blur-xl">
          <div className="mb-8 text-center">
            <div className="inline-block mb-4 p-3 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl text-2xl">✓</div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Welcome Back</h1>
            <p className="mt-3 text-sm text-slate-400">Log in to access your projects, tasks, and team.</p>
          </div>

          {message && (
            <div className={`mb-6 rounded-2xl border px-4 py-3 text-sm transition-all duration-300 ${messageType === "success" ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-200" : "bg-rose-500/20 border-rose-500/50 text-rose-200"}`}>
              <div className="font-medium">{message}</div>
              {showSignupLink && (
                <Link to="/signup" className="mt-2 inline-block underline font-semibold text-cyan-400 hover:text-cyan-300">
                  Create a new account
                </Link>
              )}
            </div>
          )}

          <div className="space-y-4">
            <input
              placeholder="Email"
              className="w-full rounded-2xl border border-slate-600 bg-slate-950/50 px-4 py-3 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 transition backdrop-blur-sm"
              onChange={(e) => {
                setEmail(e.target.value);
                clearError();
              }}
            />

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full rounded-2xl border border-slate-600 bg-slate-950/50 px-4 py-3 pr-24 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 transition backdrop-blur-sm"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearError();
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="-mt-16 ml-auto mr-3 block rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-xs font-semibold text-slate-300 transition hover:border-cyan-400 hover:text-cyan-300"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <button
            onClick={handleLogin}
            className="w-full mt-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-3 text-white font-semibold shadow-lg shadow-cyan-500/40 transition hover:shadow-cyan-500/60 hover:-translate-y-1 active:scale-[0.98] duration-200"
          >
            Sign In
          </button>

          <p className="mt-6 text-center text-sm text-slate-400">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="font-semibold text-cyan-400 hover:text-cyan-300 transition">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;

