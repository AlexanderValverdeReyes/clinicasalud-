import React from "react";
import { Link } from "react-router-dom";
import { ListIcon, CalendarIcon, ArrowRightIcon } from "../Components/Icons";

function Specialties({ specialties = [] }) {
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
          <ListIcon size={26} />
        </div>
        <h2 className="fw-semibold text-dark mb-1" style={{ letterSpacing: "-0.02em" }}>
          Especialidades Médicas
        </h2>
        <p className="text-secondary" style={{ fontSize: "0.95rem" }}>
          Atención integral y personalizada con equipamiento de vanguardia
        </p>
      </div>

      {specialties.length === 0 ? (
        <div className="glass-panel text-center p-5">
          <p className="text-secondary mb-0">
            No hay especialidades registradas en el catálogo actual.
          </p>
        </div>
      ) : (
        <div className="row g-4">
          {specialties.map((spec, index) => {
            const nombre = typeof spec === "object" ? spec.nombre : spec;
            const id = typeof spec === "object" ? spec.id : index;

            return (
              <div key={id || index} className="col-12 col-md-6 col-lg-4">
                <div className="glass-card-interactive p-4 h-100 d-flex flex-column justify-content-between">
                  <div>
                    <div
                      className="d-inline-flex align-items-center justify-content-center text-primary mb-3"
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: "12px",
                        background: "rgba(0, 113, 227, 0.08)",
                      }}
                    >
                      <ListIcon size={20} />
                    </div>
                    <h5 className="fw-semibold text-dark mb-2">{nombre}</h5>
                    <p className="text-secondary" style={{ fontSize: "0.875rem" }}>
                      Servicio médico especializado enfocado en el diagnóstico, prevención y tratamiento clínico.
                    </p>
                  </div>

                  <div className="pt-3 border-top border-light-subtle">
                    <Link
                      to="/appointment-form"
                      className="btn-apple btn-apple-secondary w-100 btn-apple-pill-sm"
                    >
                      <CalendarIcon size={14} />
                      <span>Agendar Cita</span>
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

export default Specialties;
