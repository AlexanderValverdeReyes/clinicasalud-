import React, { useEffect, useState } from "react";

function PatientDashboard({ user, appointments, updateAppointment }) {
  const [reminderAppointment, setReminderAppointment] = useState(null);

  if (!user) {
    return (
      <div className="container text-center my-5">
        <div className="alert alert-warning shadow-sm">
          ⚠️ Debes iniciar sesión para ver tus citas.
        </div>
      </div>
    );
  }

  const patientAppointments = appointments.filter(
    (a) => a.paciente_id === user.id || a.pacienteId === user.id
  );

  const toggleReminder = (id) => {
    const current = appointments.find((a) => a.id === id);
    updateAppointment(id, { reminder: !current.reminder });
  };

  const cancelAppointment = (id) =>
    updateAppointment(id, { status: "Cancelada" });

  // 🔹 Calcular estado dinámico
  const getAppointmentStatus = (app) => {
    if (app.status === "Cancelada") return "Cancelada";

    const citaDate = new Date(`${app.fecha}T${app.hora}`);
    const now = new Date();

    if (citaDate < now) return "Vencida";
    return "Activa";
  };

  const playReminderSound = () => {
    const audio = new Audio("/sounds/alert.mp3");
    audio.play().catch((err) => {
      console.warn("No se pudo reproducir el sonido:", err);
    });
  };
  // 🔔 Monitorear recordatorios (30 min antes)
  useEffect(() => {
    if (Notification && Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    const interval = setInterval(() => {
      const now = new Date();

      patientAppointments.forEach((app) => {
        if (app.reminder && app.status !== "Cancelada") {
          const citaDate = new Date(`${app.fecha}T${app.hora}`);
          const diff = citaDate - now;

          // Si faltan 30 minutos exactos (±1 min de margen)
          if (diff > 0 && diff <= 30 * 60 * 1000) {
            setReminderAppointment(app);
            playReminderSound();
            if (Notification && Notification.permission === "granted") {
              new Notification("🔔 Recordatorio de Cita", {
                body: `Tu cita con ${app.medico} (${app.especialidad}) es a las ${app.hora}`,
              });
            }
          }
        }
      });
    }, 15000); // revisa cada 15 segundos

    return () => clearInterval(interval);
  }, [patientAppointments]);

  return (
    <div className="container my-5">
      <div className="text-center mb-4">
        <h2 className="text-primary fw-bold">
          Panel del Paciente: {user.nombre} {user.apellido}
        </h2>
        <p className="text-muted">
          Aquí puedes consultar tus citas médicas y gestionar recordatorios.
        </p>
      </div>

      {patientAppointments.length === 0 ? (
        <div className="alert alert-info text-center shadow-sm">
          No tienes citas agendadas.
        </div>
      ) : (
        <div className="row">
          {patientAppointments.map((app) => {
            const status = getAppointmentStatus(app);
            return (
              <div key={app.id} className="col-md-4 mb-4">
                <div
                  className={`card h-100 shadow-sm border-${
                    status === "Cancelada"
                      ? "danger"
                      : status === "Vencida"
                      ? "secondary"
                      : "success"
                  }`}
                >
                  <div className="card-body">
                    <h5 className="card-title text-primary">
                      {app.especialidad}
                    </h5>
                    <p className="mb-1">
                      <strong>Médico:</strong> {app.medico}
                    </p>
                    <p className="mb-1">
                      <strong>Fecha:</strong> {app.fecha} {app.hora}
                    </p>
                    <p className="mb-1">
                      <strong>Estado:</strong>{" "}
                      <span
                        className={`badge bg-${
                          status === "Cancelada"
                            ? "danger"
                            : status === "Vencida"
                            ? "secondary"
                            : "success"
                        }`}
                      >
                        {status}
                      </span>
                    </p>
                    <p className="mb-3">
                      <strong>Recordatorio:</strong>{" "}
                      {app.reminder ? "Activado ✅" : "Desactivado ❌"}
                    </p>

                    <div className="d-flex justify-content-between">
                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => toggleReminder(app.id)}
                        disabled={status === "Cancelada"}
                        title={
                          status === "Cancelada"
                            ? "No se puede activar recordatorio en una cita cancelada"
                            : ""
                        }
                      >
                        {app.reminder ? "Desactivar" : "Activar"} Recordatorio
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => cancelAppointment(app.id)}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 🔔 Modal de recordatorio */}
      {reminderAppointment && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">🔔 Recordatorio de Cita</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setReminderAppointment(null)}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  Tienes una cita con{" "}
                  <strong>{reminderAppointment.medico}</strong> de{" "}
                  <strong>{reminderAppointment.especialidad}</strong>.
                </p>
                <p>
                  Fecha y hora: {reminderAppointment.fecha}{" "}
                  {reminderAppointment.hora}
                </p>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-success"
                  onClick={() => setReminderAppointment(null)}
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PatientDashboard;
