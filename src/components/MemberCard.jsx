/**
 * MemberCard — a single row in any member list.
 *
 * Props:
 *  member    {object}    { id, name, email, role }
 *  canEdit   {boolean}   Show edit/delete buttons
 *  onEdit    {function}  Called with member object
 *  onDelete  {function}  Called with member object
 *  extra     {ReactNode} Optional extra content after role badge (e.g. progress bar)
 */
export default function MemberCard({ member, canEdit = false, onEdit, onDelete, extra }) {
  return (
    <div className="member-row">
      <div
        className="member-avatar"
        style={{ background: "rgba(124,106,255,0.15)", color: "var(--accent2)" }}
      >
        {(member.name || "?").slice(0, 2).toUpperCase()}
      </div>

      <div className="member-info">
        <div className="member-name">{member.name}</div>
        <div className="member-email">{member.email}</div>
      </div>

      {extra}

      <span className={`role-badge ${member.role === "admin" || member.role === "head" ? "role-admin" : "role-member"}`}>
        {member.role || "member"}
      </span>

      {canEdit && (
        <div style={{ display: "flex", gap: 6, marginLeft: 4 }}>
          <button className="icon-btn edit" onClick={() => onEdit?.(member)}>✎</button>
          <button className="icon-btn del" onClick={() => onDelete?.(member)}>🗑️</button>
        </div>
      )}
    </div>
  );
}
