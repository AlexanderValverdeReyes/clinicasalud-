import React, { useState } from "react";
import { supabase } from "../supabase";
import {
  ShieldIcon,
  ListIcon,
  StethoscopeIcon,
  CalendarIcon,
  ClockIcon,
  PlusIcon,
  TrashIcon,
  CheckIcon,
  AlertCircleIcon,
} from "../Components/Icons";
import ConfirmModal from "../Components/ConfirmModal";

const ALL_DAYS = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

const PRESET_HOURS = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
];

function AdminDashboard({
  specialties = [],
  setSpecialties,
  doctors = [],
  setDoctors,
  appointments = [],
  setAppointments,
}) {
  const [nuevaEspecialidad, setNuevaEspecialidad] = useState("");
  const [nuevoMedico, setNuevoMedico] = useState({
    nombre: "",
    especialidadId: "",
    dias: ["Lunes", "Miércoles", "Viernes"],
    horas: ["09:00", "10:00", "11:00"],
  });

  const [customHour, setCustomHour] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3500);
  };

  // --- 1. Gestión de Especialidades ---
  const handleAgregarEspecialidad = async (e) => {
    e?.preventDefault?.();
    const nombre = nuevaEspecialidad.trim();
    if (!nombre) {
      showFeedback("danger", "El nombre de la especialidad es obligatorio.");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("especialidades")
        .insert([{ nombre }])
        .select()
        .single();

      if (error) throw error;

      // Sincronizar inmediatamente con App.jsx
      setSpecialties((prev) => [...prev, data]);
      setNuevaEspecialidad("");
      showFeedback("success", `Especialidad "${nombre}" agregada correctamente.`);
    } catch (err) {
      showFeedback("danger", "No se pudo registrar la especialidad.");
    }
  };

  const handleEliminarEspecialidadClick = (esp) => {
    setModalConfig({
      isOpen: true,
      title: "Eliminar Especialidad",
      message: `¿Confirmas que deseas eliminar la especialidad "${esp.nombre}"? Esto podría afectar a los médicos asignados.`,
      onConfirm: async () => {
        setModalConfig({ isOpen: false });
        try {
          const { error } = await supabase
            .from("especialidades")
            .delete()
            .eq("id", esp.id);
          if (error) throw error;

          // Sincronizar inmediatamente con App.jsx
          setSpecialties((prev) => prev.filter((s) => s.id !== esp.id));
          showFeedback("info", `Especialidad "${esp.nombre}" eliminada.`);
        } catch (err) {
          showFeedback("danger", "No se pudo eliminar la especialidad.");
        }
      },
    });
  };

  // --- 2. Gestión de Médicos ---
  const toggleDiaMedico = (dia) => {
    setNuevoMedico((prev) => {
      const exists = prev.dias.includes(dia);
      return {
        ...prev,
        dias: exists
          ? prev.dias.filter((d) => d !== dia)
          : [...prev.dias, dia],
      };
    });
  };

  const toggleHoraMedico = (hora) => {
    setNuevoMedico((prev) => {
      const exists = prev.horas.includes(hora);
      return {
        ...prev,
        horas: exists
          ? prev.horas.filter((h) => h !== hora)
          : [...prev.horas, hora].sort(),
      };
    });
  };

  const handleAddCustomHour = (e) => {
    e.preventDefault();
    const cleanHour = customHour.trim();
    if (!cleanHour) return;
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(cleanHour)) {
      showFeedback("danger", "El formato de hora debe ser HH:MM (ej. 14:30).");
      return;
    }
    if (!nuevoMedico.horas.includes(cleanHour)) {
      setNuevoMedico((prev) => ({
        ...prev,
        horas: [...prev.horas, cleanHour].sort(),
      }));
    }
    setCustomHour("");
  };

  const handleAgregarMedico = async (e) => {
    e?.preventDefault?.();
    const nombre = nuevoMedico.nombre.trim();
    const especialidadId = parseInt(nuevoMedico.especialidadId, 10);

    if (!nombre || !especialidadId) {
      showFeedback("danger", "Por favor completa el nombre y selecciona la especialidad.");
      return;
    }

    if (nuevoMedico.dias.length === 0) {
      showFeedback("danger", "Debes seleccionar al menos un día de atención.");
      return;
    }

    if (nuevoMedico.horas.length === 0) {
      showFeedback("danger", "Debes seleccionar al menos una franja horaria.");
      return;
    }

    try {
      const payload = {
        nombre,
        especialidad_id: especialidadId,
        dias: nuevoMedico.dias,
        horas: nuevoMedico.horas,
      };

      const { data, error } = await supabase
        .from("medicos")
        .insert([payload])
        .select()
        .single();

      if (error) throw error;

      const specObj = specialties.find((s) => s.id === especialidadId);
      const doctorWithSpec = {
        ...data,
        especialidad: specObj ? specObj.nombre : "Sin especialidad",
      };

      // Sincronizar inmediatamente con App.jsx
      setDoctors((prev) => [...prev, doctorWithSpec]);
      setNuevoMedico({
        nombre: "",
        especialidadId: "",
        dias: ["Lunes", "Miércoles", "Viernes"],
        horas: ["09:00", "10:00", "11:00"],
      });
      showFeedback("success", `Médico ${nombre} agregado con éxito.`);
    } catch (err) {
      showFeedback("danger", "No se pudo registrar al médico especialista.");
    }
  };

  const handleEliminarMedicoClick = (med) => {
    setModalConfig({
      isOpen: true,
      title: "Eliminar Médico",
      message: `¿Confirmas que deseas eliminar al Dr. ${med.nombre}?`,
      onConfirm: async () => {
        setModalConfig({ isOpen: false });
        try {
          const { error } = await supabase
            .from("medicos")
            .delete()
            .eq("id", med.id);
          if (error) throw error;

          // Sincronizar inmediatamente con App.jsx
          setDoctors((prev) => prev.filter((m) => m.id !== med.id));
          showFeedback("info", `Médico ${med.nombre} eliminado.`);
        } catch (err) {
          showFeedback("danger", "No se pudo eliminar al médico.");
        }
      },
    });
  };

  // --- 3. Gestión de Citas ---
  const handleEliminarCitaClick = (cita) => {
    setModalConfig({
      isOpen: true,
      title: "Eliminar Registro de Cita",
      message: `¿Deseas eliminar permanentemente la cita del ${cita.fecha} a las ${cita.hora}?`,
      onConfirm: async () => {
        setModalConfig({ isOpen: false });
        try {
          const { error } = await supabase
            .from("citas")
            .delete()
            .eq("id", cita.id);
          if (error) throw error;

          if (typeof setAppointments === "function") {
            setAppointments((prev) => prev.filter((c) => c.id !== cita.id));
          }
          showFeedback("info", "Cita eliminada permanentemente del sistema.");
        } catch (err) {
          showFeedback("danger", "No se pudo eliminar la cita.");
        }
      },
    });
  };

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="glass-panel p-4 mb-4 d-flex align-items-center gap-3">
        <div
          className="d-inline-flex align-items-center justify-content-center text-primary"
          style={{
            width: 52,
            height: 52,
            borderRadius: "16px",
            background: "rgba(0, 113, 227, 0.1)",
          }}
        >
          <ShieldIcon size={26} />
        </div>
        <div>
          <h2 className="fw-semibold text-dark mb-1" style={{ letterSpacing: "-0.02em" }}>
            Panel de Administración
          </h2>
          <p className="text-secondary mb-0" style={{ fontSize: "0.9rem" }}>
            Administración central de especialidades, plantilla de médicos y agenda de citas
          </p>
        </div>
      </div>

      {feedback && (
        <div className={`apple-alert apple-alert-${feedback.type}`}>
          {feedback.type === "success" ? (
            <CheckIcon size={18} />
          ) : (
            <AlertCircleIcon size={18} />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      <div className="row g-4 mb-4">
        {/* Sección: Especialidades */}
        <div className="col-12 col-lg-5">
          <div className="glass-panel p-4 h-100 d-flex flex-column">
            <div className="d-flex align-items-center gap-2 mb-3">
              <ListIcon size={20} className="text-primary" />
              <h4 className="fw-semibold text-dark m-0">Especialidades</h4>
              <span className="apple-badge apple-badge-info ms-auto">
                {specialties.length} registradas
              </span>
            </div>

            <form onSubmit={handleAgregarEspecialidad} className="mb-4">
              <label className="form-label" htmlFor="specInput">
                Nueva Especialidad
              </label>
              <div className="input-group">
                <input
                  id="specInput"
                  type="text"
                  value={nuevaEspecialidad}
                  onChange={(e) => setNuevaEspecialidad(e.target.value)}
                  className="form-control"
                  placeholder="Ej. Dermatología"
                />
                <button
                  type="submit"
                  className="btn-apple btn-apple-primary btn-apple-pill-sm ms-2"
                >
                  <PlusIcon size={16} />
                  <span>Agregar</span>
                </button>
              </div>
            </form>

            <div className="flex-grow-1 overflow-auto" style={{ maxHeight: "420px" }}>
              {specialties.length === 0 ? (
                <div className="text-center text-muted py-4 small">
                  No hay especialidades registradas en el sistema.
                </div>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {specialties.map((esp) => (
                    <div
                      key={esp.id}
                      className="glass-panel-subtle p-3 d-flex justify-content-between align-items-center"
                    >
                      <span className="fw-medium text-dark">{esp.nombre}</span>
                      <button
                        type="button"
                        className="btn-apple btn-apple-danger btn-apple-pill-sm"
                        onClick={() => handleEliminarEspecialidadClick(esp)}
                        title="Eliminar especialidad"
                      >
                        <TrashIcon size={14} />
                        <span>Eliminar</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sección: Médicos */}
        <div className="col-12 col-lg-7">
          <div className="glass-panel p-4 h-100 d-flex flex-column">
            <div className="d-flex align-items-center gap-2 mb-3">
              <StethoscopeIcon size={20} className="text-primary" />
              <h4 className="fw-semibold text-dark m-0">Médicos Especialistas</h4>
              <span className="apple-badge apple-badge-info ms-auto">
                {doctors.length} activos
              </span>
            </div>

            {/* Formulario Agregar Médico */}
            <form onSubmit={handleAgregarMedico} className="glass-panel-subtle p-3 mb-4">
              <h6 className="fw-semibold text-dark mb-3">Registrar Nuevo Médico</h6>
              <div className="row g-3 mb-3">
                <div className="col-12 col-sm-6">
                  <label className="form-label" htmlFor="docNombre">
                    Nombre del Médico
                  </label>
                  <input
                    id="docNombre"
                    type="text"
                    value={nuevoMedico.nombre}
                    onChange={(e) =>
                      setNuevoMedico({ ...nuevoMedico, nombre: e.target.value })
                    }
                    className="form-control"
                    placeholder="Ej. Dr. Roberto Gómez"
                    required
                  />
                </div>
                <div className="col-12 col-sm-6">
                  <label className="form-label" htmlFor="docEspecialidad">
                    Especialidad
                  </label>
                  <select
                    id="docEspecialidad"
                    value={nuevoMedico.especialidadId}
                    onChange={(e) =>
                      setNuevoMedico({
                        ...nuevoMedico,
                        especialidadId: e.target.value,
                      })
                    }
                    className="form-select"
                    required
                  >
                    <option value="">Selecciona especialidad</option>
                    {specialties.map((esp) => (
                      <option key={esp.id} value={esp.id}>
                        {esp.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Selección Dinámica de Días */}
              <div className="mb-3">
                <label className="form-label d-flex align-items-center gap-1">
                  <CalendarIcon size={14} className="text-primary" />
                  <span>Días de Atención Semanales</span>
                </label>
                <div className="d-flex flex-wrap gap-2">
                  {ALL_DAYS.map((dia) => {
                    const isSelected = nuevoMedico.dias.includes(dia);
                    return (
                      <button
                        type="button"
                        key={dia}
                        className={`apple-chip ${isSelected ? "selected" : ""}`}
                        onClick={() => toggleDiaMedico(dia)}
                      >
                        {isSelected && <CheckIcon size={13} />}
                        <span>{dia}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selección Dinámica de Horas */}
              <div className="mb-3">
                <label className="form-label d-flex align-items-center gap-1">
                  <ClockIcon size={14} className="text-primary" />
                  <span>Franjas Horarias Disponibles</span>
                </label>
                <div className="d-flex flex-wrap gap-2 mb-2">
                  {PRESET_HOURS.map((hora) => {
                    const isSelected = nuevoMedico.horas.includes(hora);
                    return (
                      <button
                        type="button"
                        key={hora}
                        className={`apple-chip ${isSelected ? "selected" : ""}`}
                        onClick={() => toggleHoraMedico(hora)}
                      >
                        {isSelected && <CheckIcon size={13} />}
                        <span>{hora}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Agregar hora personalizada */}
                <div className="input-group" style={{ maxWidth: "260px" }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="HH:MM (ej. 15:30)"
                    value={customHour}
                    onChange={(e) => setCustomHour(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn-apple btn-apple-secondary btn-apple-pill-sm ms-2"
                    onClick={handleAddCustomHour}
                  >
                    + Hora
                  </button>
                </div>
              </div>

              <div className="text-end">
                <button type="submit" className="btn-apple btn-apple-primary">
                  <PlusIcon size={16} />
                  <span>Registrar Médico</span>
                </button>
              </div>
            </form>

            {/* Listado de Médicos */}
            <div className="flex-grow-1 overflow-auto" style={{ maxHeight: "380px" }}>
              {doctors.length === 0 ? (
                <div className="text-center text-muted py-4 small">
                  No hay médicos registrados actualmente.
                </div>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {doctors.map((med) => {
                    const diasArray = Array.isArray(med.dias)
                      ? med.dias
                      : typeof med.dias === "string"
                      ? JSON.parse(med.dias || "[]")
                      : [];
                    const horasArray = Array.isArray(med.horas)
                      ? med.horas
                      : typeof med.horas === "string"
                      ? JSON.parse(med.horas || "[]")
                      : [];

                    return (
                      <div
                        key={med.id}
                        className="glass-panel-subtle p-3 d-flex justify-content-between align-items-center"
                      >
                        <div>
                          <div className="fw-semibold text-dark">{med.nombre}</div>
                          <div className="text-primary small mb-1">
                            {med.especialidad}
                          </div>
                          <div className="text-secondary small">
                            <span className="fw-medium">Días:</span>{" "}
                            {diasArray.join(", ") || "No definidos"} |{" "}
                            <span className="fw-medium">Horas:</span>{" "}
                            {horasArray.join(", ") || "No definidas"}
                          </div>
                        </div>
                        <button
                          type="button"
                          className="btn-apple btn-apple-danger btn-apple-pill-sm ms-3"
                          onClick={() => handleEliminarMedicoClick(med)}
                          title="Eliminar médico"
                        >
                          <TrashIcon size={14} />
                          <span>Eliminar</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sección: Todas las Citas Registradas */}
      <div className="glass-panel p-4">
        <div className="d-flex align-items-center gap-2 mb-3">
          <CalendarIcon size={20} className="text-primary" />
          <h4 className="fw-semibold text-dark m-0">Historial Global de Citas</h4>
          <span className="apple-badge apple-badge-info ms-auto">
            {appointments.length} totales
          </span>
        </div>

        {appointments.length === 0 ? (
          <div className="text-center text-muted py-5 small">
            No hay citas registradas en la base de datos.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle mb-0" style={{ background: "transparent" }}>
              <thead>
                <tr className="border-bottom border-light-subtle text-secondary small">
                  <th>Fecha y Hora</th>
                  <th>Paciente</th>
                  <th>Médico</th>
                  <th>Especialidad</th>
                  <th>Estado</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((cita) => (
                  <tr key={cita.id} className="border-bottom border-light-subtle">
                    <td className="fw-medium text-dark">
                      {cita.fecha} <span className="text-muted small">({cita.hora})</span>
                    </td>
                    <td>{cita.paciente}</td>
                    <td>{cita.medico}</td>
                    <td>
                      <span className="apple-badge apple-badge-info">
                        {cita.especialidad}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`apple-badge ${
                          cita.status === "Cancelada"
                            ? "apple-badge-cancelled"
                            : "apple-badge-active"
                        }`}
                      >
                        {cita.status || "Activa"}
                      </span>
                    </td>
                    <td className="text-end">
                      <button
                        type="button"
                        className="btn-apple btn-apple-danger btn-apple-pill-sm"
                        onClick={() => handleEliminarCitaClick(cita)}
                        title="Eliminar registro de cita"
                      >
                        <TrashIcon size={13} />
                        <span>Eliminar</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Confirmación Global */}
      <ConfirmModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText="Confirmar Eliminación"
        cancelText="Cancelar"
        isDanger={true}
        onConfirm={modalConfig.onConfirm}
        onCancel={() => setModalConfig({ isOpen: false })}
      />
    </div>
  );
}

export default AdminDashboard;
