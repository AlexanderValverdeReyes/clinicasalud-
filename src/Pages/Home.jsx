import React from "react";
import { Link } from "react-router-dom";
import {
  ClinicIcon,
  CalendarIcon,
  StethoscopeIcon,
  BellIcon,
  ShieldIcon,
  LockIcon,
  UserIcon,
} from "../Components/Icons";

function Home({ user }) {
  return (
    <div className="py-4 py-md-5">
      {/* Hero Section */}
      <div className="glass-panel p-4 p-md-5 text-center mb-5 position-relative overflow-hidden">
        <div
          className="d-inline-flex align-items-center justify-content-center text-primary mb-4"
          style={{
            width: 72,
            height: 72,
            borderRadius: "22px",
            background: "linear-gradient(135deg, rgba(0, 113, 227, 0.15) 0%, rgba(0, 113, 227, 0.05) 100%)",
            boxShadow: "0 8px 20px rgba(0, 113, 227, 0.15)",
          }}
        >
          <ClinicIcon size={36} />
        </div>

        <h1
          className="fw-bold text-dark mb-3"
          style={{ letterSpacing: "-0.03em", fontSize: "clamp(2rem, 4vw, 2.75rem)" }}
        >
          Bienvenido a Clínica Salud+
        </h1>

        <p
          className="text-secondary mx-auto mb-4"
          style={{ maxWidth: "600px", fontSize: "1.1rem", lineHeight: 1.6 }}
        >
          Plataforma moderna de gestión médica. Agenda tus consultas, selecciona profesionales especializados y recibe recordatorios oportunos para tu cuidado.
        </p>

        {user ? (
          <div className="d-flex flex-wrap justify-content-center gap-3">
            {user.role === "patient" && (
              <>
                <Link to="/patient-dashboard" className="btn-apple btn-apple-primary">
                  <UserIcon size={18} />
                  <span>Ir a Mi Panel de Paciente</span>
                </Link>
                <Link to="/appointment-form" className="btn-apple btn-apple-secondary">
                  <CalendarIcon size={18} />
                  <span>Nueva Consulta Médica</span>
                </Link>
              </>
            )}

            {user.role === "admin" && (
              <Link to="/admin-dashboard" className="btn-apple btn-apple-primary">
                <ShieldIcon size={18} />
                <span>Ir al Panel de Administración</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="d-flex flex-wrap justify-content-center gap-3">
            <Link to="/login" className="btn-apple btn-apple-primary">
              <LockIcon size={18} />
              <span>Iniciar Sesión</span>
            </Link>
            <Link to="/register" className="btn-apple btn-apple-secondary">
              <UserIcon size={18} />
              <span>Crear Cuenta de Paciente</span>
            </Link>
          </div>
        )}
      </div>

      {/* Feature Highlights */}
      <div className="row g-4">
        <div className="col-12 col-md-4">
          <div className="glass-card-interactive p-4 h-100 text-center">
            <div
              className="d-inline-flex p-3 rounded-circle text-primary mb-3"
              style={{ background: "rgba(0, 113, 227, 0.08)" }}
            >
              <StethoscopeIcon size={24} />
            </div>
            <h5 className="fw-semibold text-dark mb-2">Especialistas Calificados</h5>
            <p className="text-secondary small mb-0">
              Accede a un equipo multidisciplinario con amplia experiencia en diversas áreas de la salud.
            </p>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="glass-card-interactive p-4 h-100 text-center">
            <div
              className="d-inline-flex p-3 rounded-circle text-primary mb-3"
              style={{ background: "rgba(0, 113, 227, 0.08)" }}
            >
              <CalendarIcon size={24} />
            </div>
            <h5 className="fw-semibold text-dark mb-2">Agendamiento Inmediato</h5>
            <p className="text-secondary small mb-0">
              Reserva turnos médicos en tiempo real con selección dinámica de días y franjas horarias.
            </p>
          </div>
        </div>

        <div className="col-12 col-md-4">
          <div className="glass-card-interactive p-4 h-100 text-center">
            <div
              className="d-inline-flex p-3 rounded-circle text-primary mb-3"
              style={{ background: "rgba(0, 113, 227, 0.08)" }}
            >
              <BellIcon size={24} />
            </div>
            <h5 className="fw-semibold text-dark mb-2">Avisos Preventivos</h5>
            <p className="text-secondary small mb-0">
              Notificaciones acústicas y visuales 30 minutos antes para que nunca pierdas una consulta.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
