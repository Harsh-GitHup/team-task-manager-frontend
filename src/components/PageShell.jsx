import { useContext, useState, useRef, useEffect } from "react";
import { useNotifications } from "../context/NotificationContext";
import { Link } from "react-router-dom";

/**
 * PageShell — wraps every authenticated page with the standard
 * `.main > .topbar + .content` layout so pages don't repeat that boilerplate.
 *
 * Props:
 *  title    {string}     Topbar heading text
 *  actions  {ReactNode}  Buttons / selects to put on the right of the topbar
 *  children {ReactNode}  Page body (goes inside .content)
 *  noPad    {boolean}    Skip content padding (useful when embedding full-bleed sections)
 */
export default function PageShell({ title, actions, children, noPad = false }) {
  const { unreadCount, recentMessages } = useNotifications();
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="main animate-fade-in">
      <div className="topbar">
        <div className="topbar-title">{title}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          
          {/* Global Notification Icon */}
          <div style={{ position: "relative" }} ref={notifRef}>
            <div 
              style={{ cursor: "pointer", fontSize: 20 }}
              onClick={() => setShowNotifs(!showNotifs)}
            >
              🔔
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </div>

            {showNotifs && (
              <div className="notification-dropdown">
                <div className="notif-header">
                  <span>Notifications</span>
                  {unreadCount > 0 && <span style={{ fontSize: 11, color: "var(--accent2)" }}>{unreadCount} new</span>}
                </div>
                <div className="notif-list">
                  {recentMessages.length === 0 ? (
                    <div className="notif-empty">
                      <div className="notif-empty-icon">🔔</div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>No new messages</div>
                      <div style={{ fontSize: 12, opacity: 0.7 }}>We'll notify you when someone pings a team.</div>
                    </div>
                  ) : (
                    recentMessages.map((m, idx) => (
                      <Link 
                        to="/chat" 
                        key={idx} 
                        className="notif-item" 
                        onClick={() => setShowNotifs(false)}
                        style={{ display: "block", textDecoration: "none", color: "inherit" }}
                      >
                        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4, color: "var(--accent2)" }}>
                          👤 {m.name || m.email}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--text)", marginBottom: 4 }}>
                          {m.message}
                        </div>
                        <div style={{ fontSize: 10, color: "var(--text3)" }}>
                          {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {actions && <div style={{ display: "flex", alignItems: "center", gap: 10 }}>{actions}</div>}
        </div>
      </div>
      <div className="content" style={noPad ? { padding: 0 } : undefined}>
        {children}
      </div>
    </div>
  );
}
