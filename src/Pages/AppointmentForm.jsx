import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarIcon,
  ClockIcon,
  StethoscopeIcon,
  ListIcon,
  CheckIcon,
  AlertCircleIcon,
  BellIcon,
} from "../Components/Icons";

function AppointmentForm({ specialties, doctors, user, addAppointment }) {
  const initialForm = {
    paciente_id: user ? user.id : "",
    medico_id: "",
    fecha: "",
    hora: "",
    reminder: false,
    status: "Activa",
  };

  const [form, setForm] = useState(initialForm);
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Normalizador para eliminar tildes y diacríticos
  const normalizeDayName = (str) =>
    String(str || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  const DAYS_ORDER = [
    "domingo",
    "lunes",
    "martes",
    "miercoles",
    "jueves",
    "viernes",
    "sabado",
  ];

  // Helper seguro para arrays JSONB
  const parseSafeArray = (data) => {
    if (Array.isArray(data)) return data;
    if (typeof data === "string") {
      try {
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return data.split(",").map((s) => s.trim()).filter(Boolean);
      }
    }
    return [];
  };

  const handleDoctorSelect = (id) => {
    const doctor = doctors.find((doc) => String(doc.id) === String(id));
    setForm({ ...form, medico_id: id ? parseInt(id, 10) || id : "", fecha: "", hora: "" });
    setSelectedDoctor(doctor || null);
    setErrorMessage("");
    setSuccessMessage("");
  };

  // Cálculo modular sin bucles while
  const handleDaySelect = (day) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentDay = today.getDay();

    const targetDay = DAYS_ORDER.indexOf(normalizeDayName(day));
    if (targetDay === -1) return;

    // Cálculo modular exacto: (targetDay - currentDay + 7) % 7
    const diff = (targetDay - currentDay + 7) % 7;
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + diff);

    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, "0");
    const d = String(targetDate.getDate()).padStart(2, "0");
    const fechaLocal = `${year}-${month}-${d}`;

    setForm((prev) => ({ ...prev, fecha: fechaLocal, hora: "" }));
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleHourSelect = (hour) => {
    setForm((prev) => ({ ...prev, hora: hour }));
    setErrorMessage("");
    setSuccessMessage("");
  };

  const resetForm = () => {
    setForm({ ...initialForm, paciente_id: user ? user.id : "" });
    setSelectedSpecialty("");
    setSelectedDoctor(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!form.medico_id || !form.fecha || !form.hora) {
      setErrorMessage("Por favor selecciona una especialidad, médico, día y hora disponible.");
      return;
    }

    setSubmitting(true);
    try {
      const citaPayload = {
        paciente_id: user.id,
        medico_id: form.medico_id,
        fecha: form.fecha,
        hora: form.hora,
        status: "Activa",
        reminder: Boolean(form.reminder),
      };

      await addAppointment(citaPayload);
      setSuccessMessage("¡Tu cita ha sido agendada con éxito!");
      resetForm();
    } catch (err) {
      setErrorMessage("Ocurrió un error al agendar la cita. Por favor intenta nuevamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const availableDoctors = doctors.filter(
    (doc) => doc.especialidad === selectedSpecialty
  );

  const docDias = parseSafeArray(selectedDoctor?.dias);
  const docHoras = parseSafeArray(selectedDoctor?.horas);

  return (
    <div className="container py-4" style={{ maxWidth: "760px" }}>
      <div className="glass-panel p-4 p-md-5">
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
            <CalendarIcon size={26} />
          </div>
          <h2 className="fw-semibold text-dark mb-1" style={{ letterSpacing: "-0.02em" }}>
            Agendar Nueva Cita
          </h2>
          <p className="text-secondary" style={{ fontSize: "0.9rem" }}>
            Selecciona tu especialidad, médico y horario de atención de preferencia
          </p>
        </div>

        {successMessage && (
          <div className="apple-alert apple-alert-success d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2">
            <div className="d-flex align-items-center gap-2">
              <CheckIcon size={20} />
              <span className="fw-medium">{successMessage}</span>
            </div>
            <Link
              to="/patient-dashboard"
              className="btn-apple btn-apple-pill-sm btn-apple-secondary text-nowrap"
            >
              Ver mis citas
            </Link>
          </div>
        )}

        {errorMessage && (
          <div className="apple-alert apple-alert-danger">
            <AlertCircleIcon size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="row g-4">
          {/* Especialidad */}
          <div className="col-12">
            <label className="form-label d-flex align-items-center gap-2" htmlFor="specialtySelect">
              <ListIcon size={16} className="text-primary" />
              <span>Especialidad Médica</span>
            </label>
            <select
              id="specialtySelect"
              value={selectedSpecialty}
              onChange={(e) => {
                setSelectedSpecialty(e.target.value);
                setSelectedDoctor(null);
                setForm({ ...form, medico_id: "", fecha: "", hora: "" });
              }}
              className="form-select"
              required
            >
              <option value="">Selecciona una especialidad</option>
              {specialties.map((spec) => (
                <option key={spec.id || spec.nombre} value={spec.nombre}>
                  {spec.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Médico */}
          <div className="col-12">
            <label className="form-label d-flex align-items-center gap-2" htmlFor="doctorSelect">
              <StethoscopeIcon size={16} className="text-primary" />
              <span>Médico Especialista</span>
            </label>
            <select
              id="doctorSelect"
              value={form.medico_id}
              onChange={(e) => handleDoctorSelect(e.target.value)}
              className="form-select"
              required
              disabled={!selectedSpecialty}
            >
              <option value="">
                {selectedSpecialty
                  ? "Selecciona un médico disponible"
                  : "Primero elige una especialidad"}
              </option>
              {availableDoctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Selección de días */}
          {selectedDoctor && (
            <div className="col-12">
              <label className="form-label d-flex align-items-center gap-2 mb-2">
                <CalendarIcon size={16} className="text-primary" />
                <span>Días de Atención Disponibles</span>
              </label>
              {docDias.length === 0 ? (
                <p className="text-muted small">No hay días asignados para este médico.</p>
              ) : (
                <div className="d-flex flex-wrap gap-2">
                  {docDias.map((day, idx) => {
                    const targetIdx = DAYS_ORDER.indexOf(normalizeDayName(day));
                    let isDaySelected = false;
                    if (form.fecha && targetIdx !== -1) {
                      const [y, m, dNum] = form.fecha.split("-").map(Number);
                      const dt = new Date(y, m - 1, dNum);
                      isDaySelected = dt.getDay() === targetIdx;
                    }

                    return (
                      <button
                        type="button"
                        key={idx}
                        className={`apple-chip ${isDaySelected ? "selected" : ""}`}
                        onClick={() => handleDaySelect(day)}
                      >
                        <CalendarIcon size={14} />
                        <span>{day}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Selección de horas */}
          {form.fecha && selectedDoctor && (
            <div className="col-12">
              <label className="form-label d-flex align-items-center gap-2 mb-2">
                <ClockIcon size={16} className="text-primary" />
                <span>Horas Disponibles para {form.fecha}</span>
              </label>
              {docHoras.length === 0 ? (
                <p className="text-muted small">No hay franjas horarias configuradas.</p>
              ) : (
                <div className="d-flex flex-wrap gap-2">
                  {docHoras.map((hour, idx) => (
                    <button
                      type="button"
                      key={idx}
                      className={`apple-chip ${form.hora === hour ? "selected" : ""}`}
                      onClick={() => handleHourSelect(hour)}
                    >
                      <ClockIcon size={14} />
                      <span>{hour}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Switch de recordatorio */}
          <div className="col-12">
            <div className="glass-panel-subtle p-3 d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="d-flex align-items-center justify-content-center text-primary"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "10px",
                    background: "rgba(0, 113, 227, 0.1)",
                  }}
                >
                  <BellIcon size={18} />
                </div>
                <div>
                  <div className="fw-medium text-dark" style={{ fontSize: "0.925rem" }}>
                    Recordatorio de Cita
                  </div>
                  <div className="text-secondary small">
                    Recibirás una notificación preventiva 30 minutos antes de tu consulta
                  </div>
                </div>
              </div>
              <div className="form-check form-switch m-0">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="recordatorioSwitch"
                  checked={form.reminder}
                  onChange={(e) =>
                    setForm({ ...form, reminder: e.target.checked })
                  }
                  style={{ cursor: "pointer", width: "2.5em", height: "1.25em" }}
                />
              </div>
            </div>
          </div>

          {/* Botón de envío */}
          <div className="col-12 pt-2">
            <button
              type="submit"
              className="btn-apple btn-apple-primary w-100 py-3"
              disabled={submitting || !form.medico_id || !form.fecha || !form.hora}
            >
              {submitting ? "Confirmando cita..." : "Confirmar y Agendar Cita"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AppointmentForm;
