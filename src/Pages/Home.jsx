import { Link } from "react-router-dom";

function Home({ user }) {
  return (
    <div className="container text-center my-5">
      <div className="card shadow p-5">
        <h1 className="mb-3 text-primary">
          🏥 Bienvenido a la Gestión de Citas Médicas
        </h1>
        <p className="lead">
          Administra tus citas, consulta médicos y controla la disponibilidad de
          manera eficiente.
        </p>

        {/* Si hay usuario logueado */}
        {user ? (
          <div className="d-flex justify-content-center gap-3 mt-4">
            {user.role === "patient" && (
              <Link
                to="/patient-dashboard"
                className="btn btn-outline-primary btn-lg"
              >
                Ir al Panel de Paciente
              </Link>
            )}

            {user.role === "admin" && (
              <Link to="/admin-dashboard" className="btn btn-primary btn-lg">
                Ir al Panel de Administrador
              </Link>
            )}
          </div>
        ) : (
          // Si no hay sesión iniciada
          <div className="d-flex justify-content-center mt-4">
            <Link to="/login" className="btn btn-success btn-lg">
              🔐 Iniciar Sesión
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
