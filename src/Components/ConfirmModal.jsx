import React from "react";

export default function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  isDanger = false,
}) {
  if (!isOpen) return null;

  return (
    <div className="apple-modal-overlay" onClick={onCancel}>
      <div className="apple-modal-card p-4" onClick={(e) => e.stopPropagation()}>
        <h5 className="fw-semibold mb-2 text-dark">{title}</h5>
        <p className="text-secondary mb-4" style={{ fontSize: "0.95rem" }}>
          {message}
        </p>
        <div className="d-flex justify-content-end gap-2">
          <button
            type="button"
            className="btn-apple btn-apple-secondary"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`btn-apple ${
              isDanger ? "btn-apple-danger" : "btn-apple-primary"
            }`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
