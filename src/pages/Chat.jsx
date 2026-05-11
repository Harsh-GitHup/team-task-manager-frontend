import { useState, useEffect, useContext, useRef } from "react";
import API from "../api";
import { AuthContext } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import PageShell from "../components/PageShell";
import EmptyState from "../components/EmptyState";
import Toast from "../components/Toast";

function Chat() {
  const { user } = useContext(AuthContext);
  const { chatNotifications, clearTeamUnread, socket } = useNotifications();

  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  const scrollRef = useRef(null);

  const showToast = (type, title, message) => setToast({ type, title, message });

  const addUniqueMessage = (prevMessages, msg) => {
    if (prevMessages.some((m) => m.id === msg.id)) return prevMessages;
    return [msg, ...prevMessages];
  };

  // Load teams
  useEffect(() => {
    const loadTeams = async () => {
      try {
        const res = await API.get("/teams");
        const teamList = res.data || [];
        setTeams(teamList);
        if (teamList.length > 0) {
          setSelectedTeam(teamList[0]);
        }
      } catch {
        showToast("error", "Failed to load teams", "Could not fetch your teams.");
      } finally {
        setLoading(false);
      }
    };
    loadTeams();
  }, []);

  // Listen for real-time messages via centralized socket
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      if (selectedTeam && String(msg.team_id) === String(selectedTeam.id)) {
        setMessages((prev) => addUniqueMessage(prev, msg));
        clearTeamUnread(selectedTeam.id);
      }
    };

    socket.on("new_message", handleNewMessage);
    return () => socket.off("new_message", handleNewMessage);
  }, [selectedTeam, socket, clearTeamUnread]);

  // Load messages when team changes
  useEffect(() => {
    if (!selectedTeam) return;

    const fetchMessages = async () => {
      try {
        const res = await API.get(`/chat/${selectedTeam.id}`);
        setMessages(res.data || []);
        clearTeamUnread(selectedTeam.id);
      } catch {
        showToast("error", "Failed to load messages", "Connection error");
      }
    };

    fetchMessages();

    // Join the team room on the server
    if (socket) {
      socket.emit("join_team", selectedTeam.id);
    }
  }, [selectedTeam, socket, clearTeamUnread]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!text.trim() || !selectedTeam) return;
    try {
      await API.post("/chat", { team_id: selectedTeam.id, message: text.trim() });
      setText("");
    } catch (err) {
      showToast("error", "Send failed", err.response?.data?.error || "Message could not be sent");
    }
  };

  return (
    <PageShell title="Team Chat" noPad>
      <div className="chat-container">

        {/* Left Sidebar: Teams */}
        <div className="chat-sidebar">
          <div className="chat-sidebar-header">Teams</div>
          <div className="chat-list">
            {teams.map(t => (
              <button
                key={t.id}
                type="button"
                className={`chat-list-item ${selectedTeam?.id === t.id ? 'active' : ''}`}
                onClick={() => setSelectedTeam(t)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedTeam(t);
                  }
                }}
              >
                <div
                  className="member-avatar"
                  style={{ width: 36, height: 36, background: "rgba(124,106,255,0.15)", color: "var(--accent2)", fontSize: 14 }}
                >
                  {t.name.slice(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text3)" }}>{t.admin_name || 'Team Chat'}</div>
                </div>
                {chatNotifications[t.id] > 0 && (
                  <span className="sidebar-badge">{chatNotifications[t.id]}</span>
                )}
              </button>
            ))}
            {teams.length === 0 && !loading && (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>
                You are not in any teams.
              </div>
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="chat-main">
          {selectedTeam ? (
            <>
              <div className="chat-messages" ref={scrollRef}>
                {messages.length === 0 ? (
                  <EmptyState icon="💬" text={`Welcome to ${selectedTeam.name} chat!`} />
                ) : (
                  [...messages].reverse().map((m) => {
                    const isMine = String(m.sender_id) === String(user?.id);
                    return (
                      <div key={m.id} className={`message-row ${isMine ? 'mine' : 'others'}`}>
                        {!isMine && (
                          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--accent2)", marginBottom: 4, marginLeft: 4 }}>
                            {m.name || m.email}
                          </div>
                        )}
                        <div className="message-bubble">
                          {m.message}
                        </div>
                        <div className="message-info">
                          {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="chat-footer">
                <input
                  className="form-input"
                  style={{ flex: 1 }}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={`Message ${selectedTeam.name}...`}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <button className="btn-sm btn-accent" style={{ padding: "10px 20px" }} onClick={sendMessage}>
                  Send 📤
                </button>
              </div>
            </>
          ) : (
            <EmptyState icon="👋" text="Select a team to start chatting" />
          )}
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