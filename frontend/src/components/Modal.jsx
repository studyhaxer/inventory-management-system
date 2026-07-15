export default function Modal({ title, onClose, wide = false, children }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-card${wide ? " modal-card--wide" : ""}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}