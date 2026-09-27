import React from "react";
import { Link } from "react-router-dom";
import {
  StethoscopeIcon,
  CalendarIcon,
  ClockIcon,
} from "../Components/Icons";

function Doctors({ doctors = [] }) {
  const parseSafeArray = (data) => {
    if (Array.isArray(data)) return data;
    if (typeof data === "string") {
      try {
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return data.split(",").map((s) => s.trim()).filter(Boolean);
      }
    }
    return [];
  };

  return (
    <div className="container py-4">
      <div className="text-center mb-5">
        <div
          className="d-inline-flex align-items-center justify-content-center text-primary mb-3"
          style={{
            width: 52,
            height: 52,
            borderRadius: "16px",
            background: "rgba(0, 113, 227, 0.1)",
          }}
        >
          <StethoscopeIcon size={26} />
        </div>
        <h2 className="fw-semibold text-dark mb-1" style={{ letterSpacing: "-0.02em" }}>
          Cuerpo Médico Especialista
        </h2>
        <p className="text-secondary" style={{ fontSize: "0.95rem" }}>
          Conoce a nuestros profesionales de la salud y sus horarios disponibles
        </p>
      </div>

      {doctors.length === 0 ? (
        <div className="glass-panel text-center p-5">
          <p className="text-secondary mb-0">
            No hay médicos registrados en este momento.
          </p>
        </div>
      ) : (
        <div className="row g-4">
          {doctors.map((doc) => {
            const dias = parseSafeArray(doc.dias);
            const horas = parseSafeArray(doc.horas);

            return (
              <div key={doc.id} className="col-12 col-md-6 col-lg-4">
                <div className="glass-card-interactive p-4 h-100 d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div
                        className="d-inline-flex align-items-center justify-content-center text-primary"
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: "12px",
                          background: "rgba(0, 113, 227, 0.08)",
                        }}
                      >
                        <StethoscopeIcon size={20} />
                      </div>
                      <span className="apple-badge apple-badge-info">
                        {doc.especialidad || "Medicina General"}
                      </span>
                    </div>

                    <h5 className="fw-semibold text-dark mb-3">
                      {doc.nombre}
                    </h5>

                    <div className="d-flex flex-column gap-2 text-secondary mb-3" style={{ fontSize: "0.875rem" }}>
                      <div className="d-flex align-items-center gap-2">
                        <CalendarIcon size={15} className="text-primary" />
                        <span>
                          <strong>Días:</strong> {dias.length > 0 ? dias.join(", ") : "Por coordinar"}
                        </span>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <ClockIcon size={15} className="text-primary" />
                        <span>
                          <strong>Horas:</strong> {horas.length > 0 ? horas.join(", ") : "Por coordinar"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-top border-light-subtle">
                    <Link
                      to="/appointment-form"
                      className="btn-apple btn-apple-secondary w-100 btn-apple-pill-sm"
                    >
                      <CalendarIcon size={14} />
                      <span>Agendar con este médico</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Doctors;
