import { useState, useEffect, useContext, useRef } from "react";
import API from "../api";
import { AuthContext } from "../context/AuthContext";
import { useNotifications } from "../context/useNotifications";
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
  const [loadingMessages, setLoadingMessages] = useState(false);

  const scrollRef = useRef(null);
  const shouldScrollToBottomRef = useRef(false);
  const isNearBottomRef = useRef(true);

  const showToast = (type, title, message) => setToast({ type, title, message });

  const selectTeam = (team) => {
    shouldScrollToBottomRef.current = true;
    setSelectedTeam(team);
    setMessages([]);
    setLoadingMessages(true);
  };

  const addUniqueMessage = (prevMessages, msg) => {
    if (prevMessages.some((m) => m.id === msg.id)) return prevMessages;
    return [...prevMessages, msg];
  };

  const sortMessagesByTime = (list) =>
    [...list].sort((left, right) => {
      const leftTime = new Date(left.created_at || 0).getTime();
      const rightTime = new Date(right.created_at || 0).getTime();
      return leftTime - rightTime;
    });

  // Load teams
  useEffect(() => {
    const loadTeams = async () => {
      try {
        const res = await API.get("/teams");
        const teamList = res.data || [];
        setTeams(teamList);
        if (teamList.length > 0) {
          selectTeam(teamList[0]);
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
        setMessages((prev) => sortMessagesByTime(addUniqueMessage(prev, msg)));
        clearTeamUnread(selectedTeam.id);
      }
    };

    try {
    socket.on("new_message", handleNewMessage);
    } catch (err) {
      console.warn('Failed to attach new_message handler', err);
    }

    return () => {
      try {
        socket.off("new_message", handleNewMessage);
      } catch {
        /* ignore cleanup errors */
      }
    };
  }, [selectedTeam, socket, clearTeamUnread]);

  // Load messages when team changes
  useEffect(() => {
    if (!selectedTeam) return;

    let cancelled = false;

    const fetchMessages = async () => {
      try {
        const res = await API.get(`/chat/${selectedTeam.id}`);
        if (!cancelled) {
          setMessages(sortMessagesByTime(res.data || []));
          clearTeamUnread(selectedTeam.id);
        }
      } catch {
        if (!cancelled) {
          console.error('fetchMessages error for team', selectedTeam?.id);
          showToast("error", "Failed to load messages", "Connection error");
        }
      } finally {
        if (!cancelled) {
          setLoadingMessages(false);
        }
      }
    };

    fetchMessages();

    // Join the team room on the server
    if (socket) {
      socket.emit("join_team", selectedTeam.id);
    }

    return () => {
      cancelled = true;
    };
  }, [selectedTeam, socket, clearTeamUnread]);

  // Keep the view pinned only when the user is already near the bottom,
  // or when a team is first selected.
  useEffect(() => {
    if (scrollRef.current && (shouldScrollToBottomRef.current || isNearBottomRef.current)) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      shouldScrollToBottomRef.current = false;
    }
  }, [messages]);

  const handleChatScroll = () => {
    const el = scrollRef.current;
    if (!el) return;

    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    isNearBottomRef.current = distanceFromBottom < 80;
  };

  const sendMessage = async () => {
    if (!text.trim() || !selectedTeam) return;
    try {
      await API.post("/chat", { team_id: selectedTeam.id, message: text.trim() });
      setText("");
    } catch (err) {
      console.error('sendMessage error', err);
      const status = err?.response?.status;
      const message = err?.response?.data?.error || err?.message || 'Message could not be sent';
      const statusSuffix = status ? ` (${status})` : "";
      const actionTitle = "Send failed ";
      showToast("error", actionTitle + statusSuffix, message);
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
              <div
                key={t.id}
                className={`chat-list-item ${selectedTeam?.id === t.id ? 'active' : ''}`}
                onClick={() => selectTeam(t)}
                role="button"
                tabIndex={0}
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
                {(chatNotifications[t.id] ?? 0) > 0 && (
                  <span className="sidebar-badge">{chatNotifications[t.id]}</span>
                )}
              </div>
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
              <div className="chat-messages" ref={scrollRef} onScroll={handleChatScroll}>
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