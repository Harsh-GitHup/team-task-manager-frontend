import { useContext } from "react";
import { NotificationContext } from "../context/NotificationContext";

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
  const { unreadCount } = useContext(NotificationContext);

  return (
    <div className="main animate-fade-in">
      <div className="topbar">
        <div className="topbar-title">{title}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* Global Notification Icon */}
          <div style={{ position: "relative", cursor: "pointer", fontSize: 20 }}>
            🔔
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
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
