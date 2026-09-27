import React, { useState } from "react";
import {
  DatabaseIcon,
  RefreshIcon,
  CheckIcon,
  AlertCircleIcon,
  ChevronDownIcon,
  CloseIcon,
} from "./Icons";

export default function DatabaseStatusIndicator({
  status = "connecting", // 'connecting' | 'connected' | 'error'
  error = null,
  onRetry = null,
}) {
  const [showErrorModal, setShowErrorModal] = useState(false);

  const getStatusText = () => {
    switch (status) {
      case "connected":
        return "Supabase Conectado";
      case "error":
        return "Error en BD";
      case "connecting":
      default:
        return "Verificando BD...";
    }
  };

  const getPillClass = () => {
    switch (status) {
      case "connected":
        return "status-pill-connected";
      case "error":
        return "status-pill-error";
      case "connecting":
      default:
        return "status-pill-connecting";
    }
  };

  const getDotClass = () => {
    switch (status) {
      case "connected":
        return "status-dot-connected";
      case "error":
        return "status-dot-error";
      case "connecting":
      default:
        return "status-dot-connecting";
    }
  };

  return (
    <>
      <div
        className={`status-pill ${getPillClass()}`}
        style={{ cursor: status === "error" ? "pointer" : "default" }}
        onClick={() => {
          if (status === "error") {
            setShowErrorModal(true);
          }
        }}
        title={
          status === "error"
            ? `Haz clic para ver detalles del error: ${error || "Desconocido"}`
            : status === "connected"
            ? "Conexión activa con la base de datos de Supabase"
            : "Comprobando conexión..."
        }
      >
        <span className={`status-dot ${getDotClass()}`} />
        <DatabaseIcon size={13} />
        <span>{getStatusText()}</span>

        {status === "error" && onRetry && (
          <button
            type="button"
            className="btn p-0 border-0 ms-1 d-inline-flex align-items-center text-danger"
            onClick={(e) => {
              e.stopPropagation();
              onRetry();
            }}
            title="Reintentar conexión"
          >
            <RefreshIcon size={12} />
          </button>
        )}
      </div>

      {/* Modal de Detalle de Error de Conexión */}
      {showErrorModal && (
        <div className="apple-modal-overlay" onClick={() => setShowErrorModal(false)}>
          <div
            className="apple-modal-card p-4"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "500px" }}
          >
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div className="d-flex align-items-center gap-2 text-danger">
                <AlertCircleIcon size={22} />
                <h5 className="fw-semibold text-dark m-0">
                  Diagnóstico de Conexión Supabase
                </h5>
              </div>
              <button
                type="button"
                className="btn p-1 text-secondary"
                onClick={() => setShowErrorModal(false)}
              >
                <CloseIcon size={16} />
              </button>
            </div>

            <p className="text-secondary small mb-3">
              La aplicación no pudo comunicarse correctamente con el backend de Supabase al iniciar. Esto puede deberse a políticas RLS de lectura, credenciales de entorno incorrectas o problemas de conectividad de red.
            </p>

            <div className="tech-details-box mb-4">
              <strong>Error detectado:</strong>
              <div className="mt-1">{error || "No se recibió respuesta del servidor."}</div>
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn-apple btn-apple-secondary btn-apple-pill-sm"
                onClick={() => setShowErrorModal(false)}
              >
                Cerrar
              </button>
              {onRetry && (
                <button
                  type="button"
                  className="btn-apple btn-apple-primary btn-apple-pill-sm"
                  onClick={() => {
                    setShowErrorModal(false);
                    onRetry();
                  }}
                >
                  <RefreshIcon size={14} />
                  <span>Reintentar Conexión</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
