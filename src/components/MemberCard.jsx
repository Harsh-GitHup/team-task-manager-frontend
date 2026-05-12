import PropTypes from "prop-types";
import IconActionButtons from "./IconActionButtons";
import Avatar from "./Avatar";

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
export default function MemberCard({
  member,
  canEdit = false,
  onEdit,
  onDelete,
  extra,
}) {
  return (
    <div className="member-row">
      <Avatar name={member.name} className="member-avatar" />

      <div className="member-info">
        <div className="member-name">{member.name}</div>
        <div className="member-email">{member.email}</div>
      </div>

      {extra}

      <span
        className={`role-badge ${member.role === "admin" || member.role === "head" ? "role-admin" : "role-member"}`}
      >
        {member.role || "member"}
      </span>

      {canEdit && (
        <IconActionButtons
          item={member}
          onEdit={onEdit}
          onDelete={onDelete}
          titleEdit="Edit Member"
          titleDelete="Delete Member"
          style={{ display: "flex", gap: 6, marginLeft: 4 }}
        />
      )}
    </div>
  );
}

MemberCard.propTypes = {
  member: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    role: PropTypes.string,
  }).isRequired,
  canEdit: PropTypes.bool,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  extra: PropTypes.node,
};
