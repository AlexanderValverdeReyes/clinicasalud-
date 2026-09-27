import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabase";
import { UserIcon, AlertCircleIcon, CheckIcon } from "../Components/Icons";

function Register({ setUser }) {
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    dni: "",
    contraseña: "",
    telefono: "",
    correo: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    const nombre = form.nombre.trim();
    const apellido = form.apellido.trim();
    const dni = form.dni.trim();
    const contraseña = form.contraseña.trim();
    const telefono = form.telefono.trim();
    const correo = form.correo.trim();

    if (!nombre || !apellido || !dni || !contraseña || !telefono || !correo) {
      setError("Todos los campos son obligatorios para completar el registro.");
      return;
    }

    if (!/^\d{8}$/.test(dni)) {
      setError("El DNI debe contener exactamente 8 dígitos numéricos.");
      return;
    }

    // Validación básica de formato de correo
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      setError("Por favor, introduce un correo electrónico válido.");
      return;
    }

    setLoading(true);

    try {
      // 1. Verificar si el DNI ya está registrado en pacientes
      const { data: existing, error: checkError } = await supabase
        .from("pacientes")
        .select("id")
        .eq("dni", dni);

      if (checkError) throw checkError;

      if (existing && existing.length > 0) {
        setError("El número de DNI ingresado ya se encuentra registrado.");
        setLoading(false);
        return;
      }

      // 2. Insertar nuevo paciente en la tabla pacientes
      const nuevoPaciente = {
        nombre,
        apellido,
        dni,
        contraseña,
        telefono,
        correo,
      };

      const { data, error: insertError } = await supabase
        .from("pacientes")
        .insert([nuevoPaciente])
        .select()
        .single();

      if (insertError) throw insertError;

      // Sanitización: excluir la propiedad contraseña
      const { contraseña: _, ...sanitizedUser } = data;
      const userData = { ...sanitizedUser, role: "patient" };

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      navigate("/patient-dashboard");
    } catch (err) {
      setError("No se pudo completar el registro. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "calc(100vh - 180px)", padding: "2rem 0" }}
    >
      <div
        className="glass-panel p-4 p-md-5 w-100"
        style={{ maxWidth: "560px" }}
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
            <UserIcon size={26} />
          </div>
          <h2 className="fw-semibold text-dark mb-1" style={{ letterSpacing: "-0.02em" }}>
            Registro de Paciente
          </h2>
          <p className="text-secondary" style={{ fontSize: "0.9rem" }}>
            Completa tus datos personales para acceder al portal de citas
          </p>
        </div>

        {error && (
          <div className="apple-alert apple-alert-danger">
            <AlertCircleIcon size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} noValidate>
          <div className="row g-3 mb-3">
            <div className="col-12 col-sm-6">
              <label className="form-label" htmlFor="regNombre">
                Nombre
              </label>
              <input
                id="regNombre"
                type="text"
                name="nombre"
                className="form-control"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Ej. Juan"
                required
              />
            </div>
            <div className="col-12 col-sm-6">
              <label className="form-label" htmlFor="regApellido">
                Apellido
              </label>
              <input
                id="regApellido"
                type="text"
                name="apellido"
                className="form-control"
                value={form.apellido}
                onChange={handleChange}
                placeholder="Ej. Pérez"
                required
              />
            </div>
          </div>

          <div className="row g-3 mb-3">
            <div className="col-12 col-sm-6">
              <label className="form-label" htmlFor="regDni">
                DNI (8 dígitos)
              </label>
              <input
                id="regDni"
                type="text"
                name="dni"
                className="form-control"
                value={form.dni}
                onChange={handleChange}
                placeholder="12345678"
                maxLength={8}
                required
              />
            </div>
            <div className="col-12 col-sm-6">
              <label className="form-label" htmlFor="regTelefono">
                Teléfono de Contacto
              </label>
              <input
                id="regTelefono"
                type="tel"
                name="telefono"
                className="form-control"
                value={form.telefono}
                onChange={handleChange}
                placeholder="987654321"
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label" htmlFor="regCorreo">
              Correo Electrónico
            </label>
            <input
              id="regCorreo"
              type="email"
              name="correo"
              className="form-control"
              value={form.correo}
              onChange={handleChange}
              placeholder="juan.perez@example.com"
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label" htmlFor="regPassword">
              Contraseña
            </label>
            <input
              id="regPassword"
              type="password"
              name="contraseña"
              className="form-control"
              value={form.contraseña}
              onChange={handleChange}
              placeholder="Crea una contraseña segura"
              required
            />
          </div>

          <button
            type="submit"
            className="btn-apple btn-apple-primary w-100 py-2 mb-3"
            disabled={loading}
          >
            {loading ? "Creando cuenta..." : "Crear Cuenta"}
          </button>
        </form>

        <div className="text-center mt-2 pt-3 border-top border-light-subtle">
          <p className="text-secondary mb-0" style={{ fontSize: "0.875rem" }}>
            ¿Ya tienes una cuenta registrada?{" "}
            <Link
              to="/login"
              className="text-primary fw-medium text-decoration-none"
            >
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
