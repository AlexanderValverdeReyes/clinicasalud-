import { useEffect, useState } from "react";
import { supabase } from "../supabase";

function AdminDashboard() {
  const [especialidades, setEspecialidades] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [citas, setCitas] = useState([]);

  const [nuevaEspecialidad, setNuevaEspecialidad] = useState("");
  const [nuevoMedico, setNuevoMedico] = useState({
    nombre: "",
    especialidadId: "",
  });

  // --- 📦 Cargar datos desde Supabase ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: specData } = await supabase
          .from("especialidades")
          .select("*");

        const { data: docData } = await supabase
          .from("medicos")
          .select(
            "id, nombre, dias, horas, especialidad_id, especialidades(nombre)"
          );

        const { data: appData } = await supabase.from("citas").select(`
            id, fecha, hora, status, reminder,
            pacientes(id, nombre, apellido),
            medicos(id, nombre, especialidades(nombre))
          `);

        setEspecialidades(specData || []);
        setMedicos(
          (docData || []).map((doc) => ({
            ...doc,
            especialidad: doc.especialidades?.nombre || "Sin especialidad",
          }))
        );
        setCitas(
          (appData || []).map((c) => ({
            ...c,
            paciente: c.pacientes
              ? `${c.pacientes.nombre} ${c.pacientes.apellido}`
              : "Paciente desconocido",
            medico: c.medicos?.nombre || "Médico desconocido",
            especialidad:
              c.medicos?.especialidades?.nombre || "Sin especialidad",
          }))
        );
      } catch (error) {
        console.error("Error cargando datos:", error);
      }
    };
    fetchData();
  }, []);

  // --- 🏥 Agregar especialidad ---
  const agregarEspecialidad = async () => {
    const nombre = nuevaEspecialidad.trim();
    if (!nombre) return alert("Ingrese un nombre válido");

    const { data, error } = await supabase
      .from("especialidades")
      .insert([{ nombre }])
      .select()
      .single();

    if (error) return console.error(error);
    setEspecialidades([...especialidades, data]);
    setNuevaEspecialidad("");
  };

  const eliminarEspecialidad = async (id) => {
    if (!window.confirm("¿Eliminar esta especialidad?")) return;
    await supabase.from("especialidades").delete().eq("id", id);
    setEspecialidades(especialidades.filter((e) => e.id !== id));
  };

  // --- 👨‍⚕️ Agregar médico ---
  const agregarMedico = async () => {
    if (!nuevoMedico.nombre || !nuevoMedico.especialidadId)
      return alert("Complete todos los campos");

    const nuevo = {
      nombre: nuevoMedico.nombre,
      especialidad_id: parseInt(nuevoMedico.especialidadId),
      dias: ["Lunes", "Martes"],
      horas: ["08:00", "09:00", "10:00"],
    };

    const { data, error } = await supabase
      .from("medicos")
      .insert([nuevo])
      .select()
      .single();
    if (error) return console.error(error);

    const specialty = especialidades.find(
      (s) => s.id === nuevo.especialidad_id
    );
    setMedicos([
      ...medicos,
      { ...data, especialidad: specialty?.nombre || "Sin especialidad" },
    ]);
    setNuevoMedico({ nombre: "", especialidadId: "" });
  };

  const eliminarMedico = async (id) => {
    if (!window.confirm("¿Eliminar este médico?")) return;
    await supabase.from("medicos").delete().eq("id", id);
    setMedicos(medicos.filter((m) => m.id !== id));
  };

  // --- 🔔 Eliminar cita ---
  const eliminarCita = async (id) => {
    if (!window.confirm("¿Eliminar esta cita?")) return;
    await supabase.from("citas").delete().eq("id", id);
    setCitas(citas.filter((c) => c.id !== id));
  };

  return (
    <div className="container my-4">
      <h2 className="text-center mb-4 text-primary">
        ⚙️ Panel del Administrador
      </h2>

      {/* Especialidades */}
      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <h4 className="card-title">Especialidades</h4>
          <div className="input-group mb-3">
            <input
              type="text"
              value={nuevaEspecialidad}
              onChange={(e) => setNuevaEspecialidad(e.target.value)}
              className="form-control"
              placeholder="Nueva especialidad"
            />
            <button className="btn btn-success" onClick={agregarEspecialidad}>
              Agregar
            </button>
          </div>
          <ul className="list-group">
            {especialidades.map((esp) => (
              <li
                key={esp.id}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                {esp.nombre}
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => eliminarEspecialidad(esp.id)}
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Médicos */}
      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <h4 className="card-title">Médicos</h4>
          <div className="row g-2 mb-3">
            <div className="col-md-5">
              <input
                type="text"
                value={nuevoMedico.nombre}
                onChange={(e) =>
                  setNuevoMedico({ ...nuevoMedico, nombre: e.target.value })
                }
                className="form-control"
                placeholder="Nombre del médico"
              />
            </div>
            <div className="col-md-5">
              <select
                value={nuevoMedico.especialidadId}
                onChange={(e) =>
                  setNuevoMedico({
                    ...nuevoMedico,
                    especialidadId: e.target.value,
                  })
                }
                className="form-select"
              >
                <option value="">Seleccionar especialidad</option>
                {especialidades.map((esp) => (
                  <option key={esp.id} value={esp.id}>
                    {esp.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <button className="btn btn-success w-100" onClick={agregarMedico}>
                Agregar
              </button>
            </div>
          </div>
          <ul className="list-group">
            {medicos.map((med) => (
              <li
                key={med.id}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                {med.nombre} — {med.especialidad}
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => eliminarMedico(med.id)}
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Citas */}
      <div className="card shadow-sm">
        <div className="card-body">
          <h4 className="card-title">Citas</h4>
          <ul className="list-group">
            {citas.map((cita) => (
              <li
                key={cita.id}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                {cita.fecha} {cita.hora} — {cita.paciente} con {cita.medico} (
                {cita.especialidad})
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => eliminarCita(cita.id)}
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
