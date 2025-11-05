import { useState } from "react";

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

  const handleDoctorSelect = (id) => {
    const doctor = doctors.find((doc) => String(doc.id) === String(id));
    setForm({ ...form, medico_id: id, fecha: "", hora: "" });
    setSelectedDoctor(doctor);
  };

  const handleDaySelect = (day) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // ⏰ Forzar a medianoche local

    const targetDay = [
      "domingo",
      "lunes",
      "martes",
      "miércoles",
      "jueves",
      "viernes",
      "sábado",
    ].findIndex((d) => d.toLowerCase() === day.toLowerCase());

    let date = new Date(today);
    while (date.getDay() !== targetDay) {
      date.setDate(date.getDate() + 1);
    }
//---#
    const fechaLocal = date.toLocaleDateString("en-CA"); 
    setForm({ ...form, fecha: fechaLocal, hora: "" });
  };

  const handleHourSelect = (hour) => {
    setForm({ ...form, hora: hour });
  };

  const resetForm = () => {
    setForm({ ...initialForm, paciente_id: user.id });
    setSelectedSpecialty("");
    setSelectedDoctor(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.medico_id || !form.fecha || !form.hora) {
      alert("Selecciona médico, día y hora.");
      return;
    }

    addAppointment(form);
    alert("¡Cita agendada exitosamente!");
    resetForm();
  };

  const availableDoctors = doctors.filter(
    (doc) => doc.especialidad === selectedSpecialty
  );

  return (
    <div className="container my-4">
      <div className="card shadow p-4 mx-auto" style={{ maxWidth: "700px" }}>
        <h2 className="text-center text-primary mb-4">Agendar Nueva Cita</h2>
        <form onSubmit={handleSubmit} className="row g-3">
          {/* Especialidad */}
          <div className="col-12">
            <label className="form-label">Especialidad</label>
            <select
              value={selectedSpecialty}
              onChange={(e) => {
                setSelectedSpecialty(e.target.value);
                setSelectedDoctor(null);
                setForm({ ...form, medico_id: "", fecha: "", hora: "" });
              }}
              className="form-select"
              required
            >
              <option value="">Seleccionar Especialidad</option>
              {specialties.map((spec, index) => (
                <option key={index} value={spec.nombre}>
                  {spec.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Médico */}
          <div className="col-12">
            <label className="form-label">Médico</label>
            <select
              value={form.medico_id}
              onChange={(e) => handleDoctorSelect(e.target.value)}
              className="form-select"
              required
              disabled={!selectedSpecialty}
            >
              <option value="">Seleccionar Médico</option>
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
              <label className="form-label">Días disponibles</label>
              <div className="d-flex flex-wrap gap-2">
                {selectedDoctor.dias.map((day, idx) => (
                  <button
                    type="button"
                    key={idx}
                    className={`btn ${
                      form.fecha &&
                      new Date(form.fecha)
                        .toLocaleDateString("es-ES", { weekday: "long" })
                        .toLowerCase() === day.toLowerCase()
                        ? "btn-primary"
                        : "btn-outline-primary"
                    }`}
                    onClick={() => handleDaySelect(day)}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Selección de horas */}
          {form.fecha && selectedDoctor && (
            <div className="col-12">
              <label className="form-label">Horas disponibles</label>
              <div className="d-flex flex-wrap gap-2">
                {selectedDoctor.horas.map((hour, idx) => (
                  <button
                    type="button"
                    key={idx}
                    className={`btn ${
                      form.hora === hour ? "btn-success" : "btn-outline-success"
                    }`}
                    onClick={() => handleHourSelect(hour)}
                  >
                    {hour}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Switch de recordatorio */}
          <div className="col-12 d-flex align-items-center">
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                id="recordatorioSwitch"
                name="reminder"
                checked={form.reminder}
                onChange={(e) =>
                  setForm({ ...form, reminder: e.target.checked })
                }
              />
              <label
                className="form-check-label ms-2"
                htmlFor="recordatorioSwitch"
              >
                Activar recordatorio
              </label>
            </div>
          </div>

          {/* Botón */}
          <div className="col-12 d-grid">
            <button type="submit" className="btn btn-primary btn-lg">
              Agendar Cita
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AppointmentForm;
