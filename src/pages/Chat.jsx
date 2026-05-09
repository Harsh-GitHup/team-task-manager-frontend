import { useState, useCallback, useEffect } from "react";
import API from "../api";
import PageShell from "../components/PageShell";
import EmptyState from "../components/EmptyState";
import Toast from "../components/Toast";

function Chat() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [toast, setToast] = useState(null);

  const showToast = (type, title, message) => setToast({ type, title, message });

  // Hard-coded to team 1 for now — future: derive from user context
  const teamId = 1;

  const fetchMessages = useCallback(async () => {
    try {
      const res = await API.get(`/chat/${teamId}`);
      setMessages(res.data || []);
    } catch (err) {
      showToast("error", "Failed to load messages", err.response?.data?.error || "Connection error");
    }
  }, [teamId]);

  // Fetch on mount
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const sendMessage = async () => {
    if (!text.trim()) return;
    try {
      await API.post("/chat", { team_id: teamId, message: text.trim() });
      setText("");
      showToast("success", "Message sent", "Your message is live.");
      await fetchMessages();
    } catch (err) {
      showToast("error", "Send failed", err.response?.data?.error || "Message could not be sent");
    }
  };

  return (
    <PageShell title="Team Chat">
      <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Messages area */}
        <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
          <div
            style={{
              height: 420,
              overflowY: "auto",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {messages.length === 0 ? (
              <EmptyState icon="💬" text="No messages yet. Start the conversation!" />
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  style={{
                    padding: "12px 14px",
                    borderRadius: "var(--radius-sm)",
                    background: "var(--bg3)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--accent2)" }}>
                      👤 {m.email}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--text3)", fontFamily: "'JetBrains Mono', monospace" }}>
                      {m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "just now"}
                    </span>
                  </div>
                  <div style={{ fontSize: 14, lineHeight: 1.5 }}>{m.message}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Compose area */}
        <div style={{ display: "flex", gap: 10 }}>
          <input
            className="form-input"
            style={{ flex: 1 }}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your message..."
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button className="btn-sm btn-accent" style={{ padding: "10px 20px" }} onClick={sendMessage}>
            Send 📤
          </button>
        </div>
      </div>

      {toast && (
        <div className="toast-stack">
          <Toast type={toast.type} title={toast.title} message={toast.message} onClose={() => setToast(null)} />
        </div>
      )}
    </PageShell>
  );
}

export default Chat;