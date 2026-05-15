import { useState, useRef, useEffect } from "react";
import { useNotifications } from "../context/useNotifications";
import { useUI } from "../context/useUI";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";

/**
 * PageShell — wraps every authenticated page with the standard
 * `.main > .topbar + .content` layout so pages don't repeat that boilerplate.
 */
export default function PageShell({ title, actions, children, noPad = false }) {
  const { unreadCount, notifications, clearAll, clearUnread } = useNotifications();
  const { toggleSidebar } = useUI();
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef(null);

  const getNotificationIcon = (type) => {
    switch (type) {
      case "task":
        return "📝";
      case "message":
        return "💬";
      case "team":
        return "👥";
      case "project":
        return "📁";
      default:
        return "🔔";
    }
  };

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

  // Close notifications on Escape key
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && showNotifs) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [showNotifs]);

  const handleToggleNotifs = () => {
    if (!showNotifs) clearUnread();
    setShowNotifs(!showNotifs);
  };

  const handleNotifKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleToggleNotifs();
    }
  };

  return (
    <div className="main animate-fade-in">
      <div className="topbar">
        <button
          className="mobile-toggle"
          onClick={toggleSidebar}
          aria-label="Toggle Menu"
        >
          ☰
        </button>
        <div className="topbar-title">{title}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>

          {/* Global Notification Icon */}
          <div style={{ position: "relative" }} ref={notifRef}>
            <button
              style={{
                cursor: "pointer",
                fontSize: 20,
                padding: "8px",
                borderRadius: "50%",
                background: showNotifs ? "rgba(124,106,255,0.1)" : "transparent",
                transition: "all 0.2s"
              }}
              onClick={handleToggleNotifs}
              tabIndex={0}
              onKeyDown={handleNotifKeyDown}
              aria-label="Toggle notifications"
              aria-haspopup="true"
              aria-expanded={showNotifs}
            >
              🔔
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </button>

            {showNotifs && (
              <div className="notification-dropdown">
                <div className="notif-header">
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <span>Notifications</span>
                    {notifications.length > 0 && (
                      <span className="notif-count">
                        {notifications.length}
                      </span>
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <button className="clear-all-btn" onClick={clearAll}>
                      Clear all
                    </button>
                  )}
                </div>
                <div className="notif-list">
                  {notifications.length === 0 ? (
                    <div className="notif-empty">
                      <div className="notif-empty-icon">🔔</div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>
                        No new notifications
                      </div>
                      <div style={{ fontSize: 12, opacity: 0.7 }}>
                        We'll notify you about team activity and messages.
                      </div>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <Link
                        to={n.link || "#"}
                        key={n.id}
                        className="notif-item"
                        onClick={() => setShowNotifs(false)}
                        style={{
                          display: "block",
                          textDecoration: "none",
                          color: "inherit",
                        }}
                      >
                        <div style={{ display: "flex", gap: 10 }}>
                          <div className={`notif-icon-circle ${n.type}`}>
                            {getNotificationIcon(n.type)}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div className="notif-item-title">{n.title}</div>
                            <div className="notif-item-content">
                              {n.content}
                            </div>
                            <div className="notif-item-time">
                              {new Date(n.created_at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {actions && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {actions}
            </div>
          )}
        </div>
      </div>
      <div className="content" style={noPad ? { padding: 0 } : undefined}>
        {children}
      </div>
    </div>
  );
}

PageShell.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  actions: PropTypes.node,
  children: PropTypes.node,
  noPad: PropTypes.bool,
};
