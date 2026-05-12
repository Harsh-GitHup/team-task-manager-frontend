import PropTypes from "prop-types";

export default function FieldRow({ label, children, style = {} }) {
    return (
        <div style={style}>
            <div style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text2)", marginBottom: 6 }}>{label}</div>
            {children}
        </div>
    );
}

FieldRow.propTypes = {
    label: PropTypes.string.isRequired,
    children: PropTypes.node,
    style: PropTypes.object,
};
