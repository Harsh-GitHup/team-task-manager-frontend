import PropTypes from "prop-types";

export default function Avatar({ name, src, size = 36, className = "member-avatar", style = {}, bg }) {
    const initials = (name || "?").toString().slice(0, 2).toUpperCase();
    const baseStyle = { width: size, height: size, fontSize: Math.max(10, Math.round(size * 0.35)), ...style };
    if (src) {
        return <img src={src} alt={name || "avatar"} className={className} style={baseStyle} />;
    }
    return (
        <div
            className={className}
            title={name}
            style={{ ...baseStyle, background: bg || undefined, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
            {initials}
        </div>
    );
}

Avatar.propTypes = {
    name: PropTypes.string,
    src: PropTypes.string,
    size: PropTypes.number,
    className: PropTypes.string,
    style: PropTypes.object,
    bg: PropTypes.string,
};
