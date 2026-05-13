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
  return open ? (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card"
        style={width ? { width } : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="modal-title" style={{ padding: "20px 24px 0" }}>
            {title}
          </div>
        )}
        {children}
      </div>
    </div>
  ) : null;
}

Modal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.node,
  width: PropTypes.string,
};
