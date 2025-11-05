import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabase";

function Register({ setUser }) {
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    dni: "",
    contrasena: "", // 👈 sin tilde para evitar problemas
    telefono: "",
    correo: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !form.nombre ||
      !form.apellido ||
      !form.dni ||
      !form.contrasena ||
      !form.telefono ||
      !form.correo
    ) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    if (form.dni.length !== 8 || isNaN(form.dni)) {
      setError("DNI debe tener 8 dígitos numéricos.");
      return;
    }

    try {
      // Verificar si DNI ya existe
      const { data: existing } = await supabase
        .from("pacientes")
        .select("id")
        .eq("dni", form.dni);

      if (existing && existing.length > 0) {
        setError("Este DNI ya está registrado.");
        return;
      }

      // Insertar nuevo paciente
      const { data, error: insertError } = await supabase
        .from("pacientes")
        .insert([form])
        .select()
        .single();

      if (insertError) throw insertError;

      const userData = { ...data, role: "patient" };
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      navigate("/patient-dashboard");
    } catch (err) {
      console.error("Error al registrar:", err);
      setError("No se pudo registrar. Inténtalo de nuevo.");
    }
  };

  return (
    <div
      className="card mx-auto shadow p-4"
      style={{ maxWidth: "500px", marginTop: "5rem" }}
    >
      <h3 className="text-center mb-3 text-primary">📝 Registro de Paciente</h3>

      {error && <div className="alert alert-danger py-2">{error}</div>}

      <form onSubmit={handleRegister}>
        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Nombre</label>
            <input
              type="text"
              name="nombre"
              className="form-control"
              value={form.nombre}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Apellido</label>
            <input
              type="text"
              name="apellido"
              className="form-control"
              value={form.apellido}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">DNI</label>
          <input
            type="text"
            name="dni"
            className="form-control"
            value={form.dni}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Contraseña</label>
          <input
            type="password"
            name="contrasena"
            className="form-control"
            value={form.contrasena}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Teléfono</label>
          <input
            type="text"
            name="telefono"
            className="form-control"
            value={form.telefono}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Correo</label>
          <input
            type="email"
            name="correo"
            className="form-control"
            value={form.correo}
            onChange={handleChange}
            required
          />
        </div>

        <div className="d-grid mt-3">
          <button type="submit" className="btn btn-success">
            Registrarse
          </button>
        </div>
      </form>

      <p className="text-center mt-3">
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
      </p>
    </div>
  );
}

export default Register;
