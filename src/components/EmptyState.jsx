/**
 * EmptyState — standardized empty / zero-data placeholder.
 *
 * Props:
 *  icon    {string}  Emoji character (default "📭")
 *  text    {string}  Description text
 *  compact {boolean} Use smaller vertical padding
 */
export default function EmptyState({ icon = "📭", text = "Nothing here yet.", compact = false }) {
  return (
    <div className="empty" style={compact ? { padding: "20px" } : undefined}>
      <div className="empty-icon">{icon}</div>
      <div className="empty-text">{text}</div>
    </div>
  );
}
