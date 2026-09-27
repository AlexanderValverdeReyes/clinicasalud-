import React from "react";
import PropTypes from "prop-types";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  ClinicIcon,
  CalendarIcon,
  StethoscopeIcon,
  ListIcon,
  BellIcon,
  ShieldIcon,
  UserIcon,
  LogoutIcon,
  LockIcon,
} from "./Icons";
import DatabaseStatusIndicator from "./DatabaseStatusIndicator";

function Navbar({ user, onLogout, dbStatus, dbError, onRetryDb }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    if (typeof onLogout === "function") {
      onLogout();
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar navbar-expand-lg glass-nav sticky-top py-2">
      <div className="container">
        <div className="d-flex align-items-center gap-2 gap-sm-3">
          <Link
            className="navbar-brand d-flex align-items-center gap-2 fw-semibold text-dark text-decoration-none m-0"
            to="/"
          >
            <span
              className="d-flex align-items-center justify-content-center text-white"
              style={{
                width: 34,
                height: 34,
                borderRadius: "10px",
                background: "linear-gradient(135deg, #0071e3 0%, #0099ff 100%)",
                boxShadow: "0 4px 10px rgba(0, 113, 227, 0.25)",
              }}
            >
              <ClinicIcon size={18} />
            </span>
            <span style={{ letterSpacing: "-0.01em" }}>Clínica Salud+</span>
          </Link>

          {/* Indicador de Conexión en Tiempo Real con Supabase */}
          <DatabaseStatusIndicator
            status={dbStatus}
            error={dbError}
            onRetry={onRetryDb}
          />
        </div>

        <button
          className="navbar-toggler border-0 shadow-none p-1"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Alternar navegación"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center gap-1">
            {!user && (
              <li className="nav-item">
                <Link
                  className="btn-apple btn-apple-primary btn-apple-pill-sm ms-2"
                  to="/login"
                >
                  <LockIcon size={14} />
                  <span>Iniciar Sesión</span>
                </Link>
              </li>
            )}

            {user && user.role === "patient" && (
              <>
                <li className="nav-item">
                  <Link
                    className={`nav-link px-3 py-2 rounded-pill fw-medium d-flex align-items-center gap-2 ${
                      isActive("/specialties")
                        ? "text-primary bg-primary-subtle"
                        : "text-secondary"
                    }`}
                    to="/specialties"
                  >
                    <ListIcon size={16} />
                    <span>Especialidades</span>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className={`nav-link px-3 py-2 rounded-pill fw-medium d-flex align-items-center gap-2 ${
                      isActive("/doctors")
                        ? "text-primary bg-primary-subtle"
                        : "text-secondary"
                    }`}
                    to="/doctors"
                  >
                    <StethoscopeIcon size={16} />
                    <span>Médicos</span>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className={`nav-link px-3 py-2 rounded-pill fw-medium d-flex align-items-center gap-2 ${
                      isActive("/appointment-form")
                        ? "text-primary bg-primary-subtle"
                        : "text-secondary"
                    }`}
                    to="/appointment-form"
                  >
                    <CalendarIcon size={16} />
                    <span>Nueva Cita</span>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className={`nav-link px-3 py-2 rounded-pill fw-medium d-flex align-items-center gap-2 ${
                      isActive("/patient-dashboard")
                        ? "text-primary bg-primary-subtle"
                        : "text-secondary"
                    }`}
                    to="/patient-dashboard"
                  >
                    <BellIcon size={16} />
                    <span>Mis Citas</span>
                  </Link>
                </li>
              </>
            )}

            {user && user.role === "admin" && (
              <li className="nav-item">
                <Link
                  className={`nav-link px-3 py-2 rounded-pill fw-medium d-flex align-items-center gap-2 ${
                    isActive("/admin-dashboard")
                      ? "text-primary bg-primary-subtle"
                      : "text-secondary"
                  }`}
                  to="/admin-dashboard"
                >
                  <ShieldIcon size={16} />
                  <span>Panel Administrador</span>
                </Link>
              </li>
            )}

            {user && (
              <li className="nav-item ms-lg-3 mt-2 mt-lg-0 d-flex align-items-center gap-2">
                <div
                  className="d-flex align-items-center gap-2 px-3 py-1 glass-panel-subtle"
                  style={{ borderRadius: "9999px" }}
                >
                  {user.role === "admin" ? (
                    <ShieldIcon size={15} className="text-primary" />
                  ) : (
                    <UserIcon size={15} className="text-secondary" />
                  )}
                  <span
                    className="fw-medium text-dark"
                    style={{ fontSize: "0.875rem" }}
                  >
                    {user.nombre
                      ? `${user.nombre} ${user.apellido || ""}`.trim()
                      : "Usuario"}
                  </span>
                </div>

                <button
                  className="btn-apple btn-apple-secondary btn-apple-pill-sm"
                  onClick={handleLogout}
                  type="button"
                  title="Cerrar Sesión"
                >
                  <LogoutIcon size={15} />
                  <span className="d-none d-sm-inline">Cerrar Sesión</span>
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

Navbar.propTypes = {
  user: PropTypes.object,
  onLogout: PropTypes.func,
  dbStatus: PropTypes.string,
  dbError: PropTypes.string,
  onRetryDb: PropTypes.func,
};

export default Navbar;
