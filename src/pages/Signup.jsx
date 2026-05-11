import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import API from "../api";
import AlertBanner from "../components/AlertBanner";
import PasswordInput from "../components/PasswordInput";

function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "user" });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const location = useLocation();
  const invite = new URLSearchParams(location.search).get("invite");

  const clearMessage = () => { setMessage(""); setMessageType(""); };

  const setField = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    clearMessage();
  };

  const handleSignup = async () => {
    try {
      const payload = { ...form };
      if (invite) { payload.invite_token = invite; payload.role = "user"; }
      const res = await API.post("/auth/signup", payload);
      setMessage(res.data?.message || "Account created! You can now sign in.");
      setMessageType("success");
    } catch (err) {
      setMessage(
        err.response?.data?.error ||
        err.response?.data ||
        "Signup failed. Please try again."
      );
      setMessageType("error");
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-grid" />
      <div className="auth-card">

        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">⚡</div>
          <span className="auth-logo-text">TaskHub</span>
        </div>

        <h1 className="auth-title">Create account</h1>
        <p className="auth-sub">Join your team on TaskHub</p>

        <AlertBanner type={messageType} message={message} />

        {/* Full Name */}
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            id="name"
            className="form-input"
            type="text"
            placeholder="Your name"
            value={form.name}
            onChange={setField("name")}
            autoFocus
          />
        </div>

        {/* Email */}
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            className="form-input"
            type="email"
            placeholder="you@company.com"
            value={form.email}
            onChange={setField("email")}
          />
        </div>

        {/* Password */}
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <PasswordInput
            id="password"
            value={form.password}
            onChange={setField("password")}
            onKeyDown={(e) => e.key === "Enter" && handleSignup()}
            placeholder="Min 6 characters"
          />
        </div>

        {/* Role (hidden when using invite link) */}
        {invite ? (
          <p style={{ fontSize: 12, color: "var(--text2)", marginBottom: 16 }}>
            Signing up via invite — role will be Member.
          </p>
        ) : (
          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select
              id="role"
              className="form-input"
              value={form.role}
              onChange={setField("role")}
            >
              <option value="user">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        )}

        <button className="btn-primary" onClick={handleSignup}>
          Create Account →
        </button>

        <div className="auth-switch">
          Already have an account?{" "}
          <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;