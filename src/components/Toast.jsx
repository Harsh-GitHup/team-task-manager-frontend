import { useEffect } from "react";
import PropTypes from "prop-types";

function Toast({ type = "success", title, message, onClose, duration = 2800 }) {
    useEffect(() => {
        if (!onClose) return undefined;
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <div className={`toast ${type}`}>
            <div className="toast-title">{title || (type === "success" ? "Success" : "Error")}</div>
            <div>{message}</div>
        </div>
    );
}

Toast.propTypes = {
    type: PropTypes.oneOf(["success", "error", "warning", "info"]),
    title: PropTypes.string,
    message: PropTypes.string,
    onClose: PropTypes.func,
    duration: PropTypes.number,
};

export default Toast;