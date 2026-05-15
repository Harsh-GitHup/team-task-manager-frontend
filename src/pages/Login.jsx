import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import API from "../api";
import { AuthContext } from "../context/AuthContext";
import AlertBanner from "../components/AlertBanner";
import PasswordInput from "../components/PasswordInput";

function Login() {
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [showSignupLink, setShowSignupLink] = useState(false);

  const clearError = () => {
    setMessage("");
    setMessageType("");
    setShowSignupLink(false);
  };

  const handleLogin = async () => {
    try {
      const res = await API.post("/auth/login", { email, password });
      login(res.data);
      globalThis.location.href = "/";
    } catch (err) {
      console.error('Login error', err);
      const msg =
        err.response?.data?.error ||
        (typeof err.response?.data === "string" ? err.response.data : null);

      if (err.response?.status === 404) {
        setMessage(msg || "User not found. New here?");
        setShowSignupLink(true);
      } else if (err.response?.status === 401) {
        setMessage(msg || "Wrong password.");
        setShowSignupLink(false);
      } else {
        setMessage(msg || "Login failed. Please try again.");
        setShowSignupLink(false);
      }
      setMessageType("error");
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-grid" />
      <div className="auth-card">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
        >
          {/* Logo */}
          <div className="auth-logo">
            <div className="auth-logo-icon">⚡</div>
            <span className="auth-logo-text">TaskHub</span>
          </div>

          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-sub">Sign in to your workspace</p>

          {/* Error / success banner */}
          <AlertBanner type={messageType} message={message}>
            {showSignupLink && (
              <Link
                to="/signup"
                style={{
                  display: "inline-block",
                  marginTop: 8,
                  textDecoration: "underline",
                  fontWeight: 600,
                  color: "var(--accent2)",
                }}
              >
                Create a new account
              </Link>
            )}
          </AlertBanner>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              className="form-input"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); clearError(); }}
              autoComplete="email"
              autoFocus
            />
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <PasswordInput
              id="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); clearError(); }}
              autoComplete="current-password"
            />
          </div>

          <button className="btn-primary" type="submit">
            Sign In →
          </button>

          <div className="auth-switch">
            Don&apos;t have an account?{" "}
            <Link to="/signup">Create one</Link>
          </div>
        </form>

        {/* Demo quick-fill */}
        {/* <div className="demo-accounts">
          <p>Quick demo access</p>
          <button className="demo-btn" onClick={() => setEmail("admin@example.com")}>
            ⚡ Admin Demo
          </button>
          <button className="demo-btn" onClick={() => setEmail("user@example.com")}>
            👤 Member Demo
          </button>
        </div> */}
      </div>
    </div>
  );
}

export default Login;
