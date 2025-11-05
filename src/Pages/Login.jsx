import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabase";

function Login({ setUser }) {
  const [dni, setDni] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!dni || !password) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    try {
      const { data: pacientes } = await supabase
        .from("pacientes")
        .select("*")
        .eq("dni", dni)
        .eq("contraseña", password);

      if (pacientes && pacientes.length > 0) {
        const userData = { ...pacientes[0], role: "patient" };
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        navigate("/patient-dashboard");
        return;
      }

      const { data: admins } = await supabase
        .from("administradores")
        .select("*")
        .eq("dni", dni)
        .eq("contraseña", password);

      if (admins && admins.length > 0) {
        const userData = { ...admins[0], role: "admin" };
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        navigate("/admin-dashboard");
        return;
      }

      setError("DNI o contraseña incorrectos.");
    } catch (err) {
      console.error("Error al iniciar sesión:", err);
      setError("No se pudo conectar con el servidor.");
    }
  };

  return (
    <div
      className="card mx-auto shadow p-4"
      style={{ maxWidth: "400px", marginTop: "5rem" }}
    >
      <h3 className="text-center mb-3 text-primary">🔐 Iniciar Sesión</h3>
      {error && <div className="alert alert-danger py-2">{error}</div>}

      <form onSubmit={handleLogin}>
        <div className="mb-3">
          <label className="form-label">DNI</label>
          <input
            type="text"
            className="form-control"
            value={dni}
            onChange={(e) => setDni(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Contraseña</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="d-grid mt-3">
          <button type="submit" className="btn btn-primary">
            Entrar
          </button>
        </div>
      </form>

      <p className="text-center mt-3">
        ¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link>
      </p>
    </div>
  );
}

export default Login;
