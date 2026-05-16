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
  // keyboard handler for accessibility
  const handleBackdropKey = (e) => {
    // If the key event originated from an input-like element, ignore it
    const target = e.target;
    const tag = target?.tagName;
    const isInputLike = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target?.isContentEditable;
    if (isInputLike) return;

    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' || e.key === ' ') {
      // treat Enter/Space same as click on backdrop
      e.preventDefault();
      onClose();
    }
  };

  return open ? (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      onKeyDown={handleBackdropKey}
      aria-label={title ? `${title} dialog` : 'Modal dialog'}
    >
      <div
        className="modal-card"
        style={width ? { width } : undefined}
        onClick={(e) => e.stopPropagation()}
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {title && (
          <div id="modal-title" className="modal-title" style={{ padding: "20px 24px 0" }}>
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
