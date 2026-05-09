/**
 * AlertBanner — success / error message box used on auth forms.
 *
 * Props:
 *  type     {"success"|"error"}  Determines colour
 *  message  {string}             Main message text
 *  children {ReactNode}          Optional extra content (e.g. a link)
 */
export default function AlertBanner({ type = "error", message, children }) {
  if (!message) return null;

  const isSuccess = type === "success";

  return (
    <div
      style={{
        marginBottom: "20px",
        padding: "14px",
        borderRadius: "8px",
        fontSize: "13px",
        background: isSuccess ? "rgba(45,212,160,0.15)" : "rgba(255,107,107,0.15)",
        border: isSuccess
          ? "1px solid rgba(45,212,160,0.3)"
          : "1px solid rgba(255,107,107,0.3)",
        color: isSuccess ? "var(--green)" : "var(--red)",
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: children ? 4 : 0 }}>{message}</div>
      {children}
    </div>
  );
}
