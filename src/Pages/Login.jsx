import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabase";
import {
  LockIcon,
  AlertCircleIcon,
  InfoIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "../Components/Icons";

function Login({ setUser, dbStatus, dbError }) {
  const [dni, setDni] = useState("");
  const [password, setPassword] = useState("");
  const [errorDetails, setErrorDetails] = useState(null);
  const [showTechDetails, setShowTechDetails] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorDetails(null);
    setShowTechDetails(false);

    const cleanDni = dni.trim();
    const cleanPassword = password.trim();

    if (!cleanDni || !cleanPassword) {
      setErrorDetails({
        type: "validation",
        title: "Campos incompletos",
        message: "Por favor, completa tanto el número de DNI como tu contraseña.",
      });
      return;
    }

    setLoading(true);

    try {
      // 1. Consulta en la tabla 'pacientes'
      const {
        data: pacientes,
        error: pacError,
      } = await supabase
        .from("pacientes")
        .select("*")
        .eq("dni", cleanDni)
        .eq("contraseña", cleanPassword);

      if (pacError) {
        setErrorDetails({
          type: "database",
          title: "Error en consulta de Pacientes (Supabase)",
          message:
            pacError.message ||
            "Ocurrió un error al consultar la tabla de pacientes.",
          code: pacError.code,
          details: pacError.details,
          hint: pacError.hint,
        });
        setLoading(false);
        return;
      }

      // Si se encuentra en pacientes
      if (pacientes && pacientes.length > 0) {
        const foundUser = pacientes[0];
        const { contraseña, ...sanitizedUser } = foundUser;
        const userData = { ...sanitizedUser, role: "patient" };

        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        navigate("/patient-dashboard");
        return;
      }

      // 2. Consulta en la tabla 'administradores'
      const {
        data: admins,
        error: adminError,
      } = await supabase
        .from("administradores")
        .select("*")
        .eq("dni", cleanDni)
        .eq("contraseña", cleanPassword);

      if (adminError) {
        setErrorDetails({
          type: "database",
          title: "Error en consulta de Administradores (Supabase)",
          message:
            adminError.message ||
            "Ocurrió un error al consultar la tabla de administradores.",
          code: adminError.code,
          details: adminError.details,
          hint: adminError.hint,
        });
        setLoading(false);
        return;
      }

      // Si se encuentra en administradores
      if (admins && admins.length > 0) {
        const foundAdmin = admins[0];
        const { contraseña, ...sanitizedAdmin } = foundAdmin;
        const userData = { ...sanitizedAdmin, role: "admin" };

        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        navigate("/admin-dashboard");
        return;
      }

      // 3. Diagnóstico específico de credenciales:
      // Comprobar si el DNI existe pero con contraseña equivocada, o si el DNI no está registrado
      let dniExists = false;
      const { data: dniPacCheck } = await supabase
        .from("pacientes")
        .select("id")
        .eq("dni", cleanDni)
        .limit(1);

      if (dniPacCheck && dniPacCheck.length > 0) {
        dniExists = true;
      } else {
        const { data: dniAdmCheck } = await supabase
          .from("administradores")
          .select("id")
          .eq("dni", cleanDni)
          .limit(1);
        if (dniAdmCheck && dniAdmCheck.length > 0) {
          dniExists = true;
        }
      }

      if (dniExists) {
        setErrorDetails({
          type: "auth",
          title: "Contraseña incorrecta",
          message:
            "El DNI ingresado está registrado, pero la contraseña no coincide. Verifica mayúsculas y caracteres e intenta nuevamente.",
        });
      } else {
        setErrorDetails({
          type: "auth",
          title: "Usuario no encontrado",
          message: `No existe ningún paciente ni administrador registrado con el DNI "${cleanDni}". Si eres nuevo, puedes registrarte en el enlace inferior.`,
        });
      }
    } catch (err) {
      setErrorDetails({
        type: "network",
        title: "Fallo de conexión o red",
        message:
          err.message ||
          "No se pudo establecer conexión con los servidores de Supabase.",
        code: err.code || "NETWORK_OR_CLIENT_ERROR",
        details: err.stack ? err.stack.split("\n")[0] : null,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "calc(100vh - 180px)", padding: "1.5rem 0" }}
    >
      <div
        className="glass-panel p-4 p-md-5 w-100"
        style={{ maxWidth: "460px" }}
      >
        <div className="text-center mb-4">
          <div
            className="d-inline-flex align-items-center justify-content-center text-primary mb-3"
            style={{
              width: 52,
              height: 52,
              borderRadius: "16px",
              background: "rgba(0, 113, 227, 0.1)",
            }}
          >
            <LockIcon size={26} />
          </div>
          <h2 className="fw-semibold text-dark mb-1" style={{ letterSpacing: "-0.02em" }}>
            Iniciar Sesión
          </h2>
          <p className="text-secondary" style={{ fontSize: "0.9rem" }}>
            Ingresa tus credenciales para acceder al sistema
          </p>
        </div>

        {/* Aviso preventivo si la base de datos no está conectada */}
        {dbStatus === "error" && (
          <div className="apple-alert apple-alert-danger mb-4">
            <AlertCircleIcon size={20} />
            <div style={{ fontSize: "0.85rem" }}>
              <strong>Base de datos no disponible:</strong> No se pudo conectar con Supabase. Revisa tu conexión a internet o configuración.
            </div>
          </div>
        )}

        {/* Notificación de Error Detallada */}
        {errorDetails && (
          <div className="apple-alert apple-alert-danger flex-column align-items-start mb-4">
            <div className="d-flex align-items-center gap-2 w-100">
              <AlertCircleIcon size={18} className="flex-shrink-0" />
              <strong style={{ fontSize: "0.925rem" }}>{errorDetails.title}</strong>
            </div>

            <p className="m-0 mt-1" style={{ fontSize: "0.875rem" }}>
              {errorDetails.message}
            </p>

            {/* Desplegable de detalles técnicos si existen */}
            {(errorDetails.code || errorDetails.details || errorDetails.hint) && (
              <div className="w-100 mt-2 pt-2 border-top border-danger-subtle">
                <button
                  type="button"
                  className="btn p-0 text-danger small fw-semibold d-flex align-items-center gap-1 border-0"
                  style={{ fontSize: "0.8rem", textDecoration: "none" }}
                  onClick={() => setShowTechDetails(!showTechDetails)}
                >
                  <span>{showTechDetails ? "Ocultar diagnóstico técnico" : "Ver diagnóstico técnico"}</span>
                  {showTechDetails ? (
                    <ChevronUpIcon size={14} />
                  ) : (
                    <ChevronDownIcon size={14} />
                  )}
                </button>

                {showTechDetails && (
                  <div className="tech-details-box mt-2">
                    {errorDetails.code && (
                      <div><strong>Código:</strong> {errorDetails.code}</div>
                    )}
                    {errorDetails.details && (
                      <div><strong>Detalle:</strong> {errorDetails.details}</div>
                    )}
                    {errorDetails.hint && (
                      <div><strong>Pista (Hint):</strong> {errorDetails.hint}</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleLogin} noValidate>
          <div className="mb-3">
            <label className="form-label" htmlFor="dniInput">
              Número de DNI
            </label>
            <input
              id="dniInput"
              type="text"
              className="form-control"
              value={dni}
              onChange={(e) => {
                setDni(e.target.value);
                if (errorDetails) setErrorDetails(null);
              }}
              placeholder="Ej. 12345678"
              maxLength={8}
              autoComplete="username"
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label" htmlFor="passwordInput">
              Contraseña
            </label>
            <input
              id="passwordInput"
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errorDetails) setErrorDetails(null);
              }}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn-apple btn-apple-primary w-100 py-2 mb-3"
            disabled={loading}
          >
            {loading ? "Verificando credenciales..." : "Acceder"}
          </button>
        </form>

        <div className="text-center mt-3 pt-3 border-top border-light-subtle">
          <p className="text-secondary mb-0" style={{ fontSize: "0.875rem" }}>
            ¿Aún no tienes cuenta?{" "}
            <Link
              to="/register"
              className="text-primary fw-medium text-decoration-none"
            >
              Regístrate como paciente
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
