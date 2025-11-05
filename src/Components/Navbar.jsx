import PropTypes from "prop-types";
import { Link, useNavigate } from "react-router-dom";

function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Preferir el handler pasado por props (ej: manejar sesión en App)
    if (typeof onLogout === "function") {
      onLogout();
    } else {
      // Fallback: limpiar localStorage por si guardas token / user ahí
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold" to="/">
          🏥 Clínica Salud+
        </Link>

        <button
          className="navbar-toggler"
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
          <ul className="navbar-nav ms-auto align-items-center">
            {!user && (
              <li className="nav-item">
                <Link className="nav-link" to="/login">
                  🔐 Iniciar Sesión
                </Link>
              </li>
            )}

            {user && user.role === "patient" && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/specialties">
                    📋 Especialidades
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/doctors">
                    👨‍⚕️ Médicos
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/appointment-form">
                    📅 Nueva Cita
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/patient-dashboard">
                    🔔 Mi Panel
                  </Link>
                </li>
              </>
            )}

            {user && user.role === "admin" && (
              <li className="nav-item">
                <Link className="nav-link" to="/admin-dashboard">
                  ⚙️ Panel Administrador
                </Link>
              </li>
            )}

            {/* Si hay usuario mostrar nombre y botón de cerrar sesión */}
            {user && (
              <>
                <li className="nav-item d-flex align-items-center">
                  <span className="nav-link disabled" aria-disabled="true">
                    👤{" "}
                    {user.nombre
                      ? `${user.nombre} ${user.apellido || ""}`
                      : user.usuario || "Usuario"}
                  </span>
                </li>

                <li className="nav-item">
                  <button
                    className="btn btn-sm btn-light ms-2"
                    onClick={handleLogout}
                    type="button"
                  >
                    🚪 Cerrar Sesión
                  </button>
                </li>
              </>
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
};

export default Navbar;
