import { useState } from "react";
import PropTypes from "prop-types";

/**
 * PasswordInput — form input for passwords with a Show/Hide toggle button.
 *
 * Props: same as a standard <input> (value, onChange, onKeyDown, placeholder, etc.)
 */
export default function PasswordInput({
  value,
  onChange,
  onKeyDown,
  placeholder = "Your Password",
  ...rest
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <input
        className="form-input"
        type={visible ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        {...rest}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        style={{
          position: "absolute",
          right: "12px",
          top: "50%",
          transform: "translateY(-50%)",
          background: "transparent",
          border: "none",
          color: "var(--text2)",
          cursor: "pointer",
          padding: "4px 6px",
          fontSize: "12px",
          fontWeight: 600,
          fontFamily: "inherit",
        }}
        tabIndex={-1}
      >
        {visible ? "Hide" : "Show"}
      </button>
    </div>
  );
}

PasswordInput.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  onKeyDown: PropTypes.func,
  placeholder: PropTypes.string,
};
