import PropTypes from "prop-types";

/**
 * Modal — reusable overlay + card.
 *
 * Props:
 *  open      {boolean}    Whether the modal is visible
 *  onClose   {function}   Called when backdrop is clicked
 *  title     {string}     Heading inside the card
 *  children  {ReactNode}  Modal body content
 *  width     {string}     Optional max-width override (default: "min(560px, 100%)")
 */
export default function Modal({ open, onClose, title, children, width }) {
  if (!open) return null;

  return (
    <button
      className="modal-backdrop"
      aria-label="Close modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      type="button"
    >
      <dialog
        className="modal-card"
        style={width ? { width } : undefined}
        open
      >
        {title && (
          <div className="modal-title" style={{ padding: "20px 24px 0" }}>
            {title}
          </div>
        )}
        {children}
      </dialog>
    </button>
  );
}

Modal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.node,
  width: PropTypes.string,
};
