import { useEffect } from "react";

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

export default Toast;