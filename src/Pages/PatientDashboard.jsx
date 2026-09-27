import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  CalendarIcon,
  ClockIcon,
  StethoscopeIcon,
  BellIcon,
  BellOffIcon,
  CloseIcon,
  CheckIcon,
  AlertCircleIcon,
  UserIcon,
} from "../Components/Icons";
import ConfirmModal from "../Components/ConfirmModal";

function PatientDashboard({ user, appointments, updateAppointment }) {
  const [reminderAppointment, setReminderAppointment] = useState(null);
  const [cancelModalState, setCancelModalState] = useState({ isOpen: false, appointmentId: null });
  const [feedback, setFeedback] = useState(null);

  // Set en useRef para evitar notificaciones duplicadas en cada tick del intervalo
  const notifiedAppointmentsRef = useRef(new Set());

  if (!user) {
    return (
      <div className="container py-5 text-center" style={{ maxWidth: "540px" }}>
        <div className="glass-panel p-5">
          <div className="d-inline-flex p-3 rounded-circle bg-warning-subtle text-warning mb-3">
            <AlertCircleIcon size={32} />
          </div>
          <h3 className="fw-semibold text-dark mb-2">Acceso Restringido</h3>
          <p className="text-secondary mb-4">
            Debes iniciar sesión con tu cuenta de paciente para gestionar tus citas médicas.
          </p>
          <Link to="/login" className="btn-apple btn-apple-primary">
            Iniciar Sesión
          </Link>
        </div>
      </div>
    );
  }

  const patientAppointments = appointments.filter(
    (a) => a.paciente_id === user.id || a.pacienteId === user.id
  );

  const toggleReminder = async (id) => {
    const current = appointments.find((a) => a.id === id);
    if (!current) return;
    const newReminderState = !current.reminder;

    try {
      await updateAppointment(id, { reminder: newReminderState });
      setFeedback({
        type: "success",
        message: newReminderState
          ? "Recordatorio activado correctamente."
          : "Recordatorio desactivado.",
      });
      setTimeout(() => setFeedback(null), 3500);
    } catch (err) {
      setFeedback({
        type: "danger",
        message: "No se pudo actualizar el recordatorio.",
      });
    }
  };

  const handleCancelClick = (id) => {
    setCancelModalState({ isOpen: true, appointmentId: id });
  };

  const handleConfirmCancel = async () => {
    const id = cancelModalState.appointmentId;
    setCancelModalState({ isOpen: false, appointmentId: null });
    if (!id) return;

    try {
      await updateAppointment(id, { status: "Cancelada" });
      setFeedback({
        type: "info",
        message: "La cita ha sido cancelada.",
      });
      setTimeout(() => setFeedback(null), 3500);
    } catch (err) {
      setFeedback({
        type: "danger",
        message: "No se pudo cancelar la cita.",
      });
    }
  };

  // Calcular estado visual dinámico de la cita
  const getAppointmentStatus = (app) => {
    if (app.status === "Cancelada") return "Cancelada";

    if (!app.fecha || !app.hora) return "Activa";
    const citaDate = new Date(`${app.fecha}T${app.hora}`);
    const now = new Date();

    if (citaDate < now) return "Vencida";
    return "Activa";
  };

  const playReminderSound = () => {
    try {
      const audio = new Audio("/sounds/alert.mp3");
      audio.play().catch(() => {});
    } catch {}
  };

  // Monitorear recordatorios (30 minutos antes) con protección de duplicados vía useRef
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission !== "granted" && Notification.permission !== "denied") {
        Notification.requestPermission().catch(() => {});
      }
    }

    const checkReminders = () => {
      const now = new Date();

      patientAppointments.forEach((app) => {
        if (app.reminder && app.status !== "Cancelada" && app.fecha && app.hora) {
          // Si ya fue notificada en este ciclo de vida, saltar
          if (notifiedAppointmentsRef.current.has(app.id)) {
            return;
          }

          const citaDate = new Date(`${app.fecha}T${app.hora}`);
          const diff = citaDate.getTime() - now.getTime();

          // Si faltan entre 0 y 30 minutos
          if (diff > 0 && diff <= 30 * 60 * 1000) {
            notifiedAppointmentsRef.current.add(app.id);
            setReminderAppointment(app);
            playReminderSound();

            if (
              typeof window !== "undefined" &&
              "Notification" in window &&
              Notification.permission === "granted"
            ) {
              new Notification("Recordatorio de Cita Médica", {
                body: `Tu cita con ${app.medico} (${app.especialidad}) es a las ${app.hora}`,
              });
            }
          }
        }
      });
    };

    checkReminders();
    const interval = setInterval(checkReminders, 15000);

    return () => clearInterval(interval);
  }, [patientAppointments]);

  return (
    <div className="container py-4">
      {/* Header del Dashboard */}
      <div className="glass-panel p-4 mb-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="apple-badge apple-badge-info">Paciente</span>
            <span className="text-muted small">DNI: {user.dni}</span>
          </div>
          <h2 className="fw-semibold text-dark mb-1" style={{ letterSpacing: "-0.02em" }}>
            {user.nombre} {user.apellido}
          </h2>
          <p className="text-secondary mb-0" style={{ fontSize: "0.9rem" }}>
            Gestiona tus consultas médicas programadas y preferencias de recordatorio
          </p>
        </div>

        <Link
          to="/appointment-form"
          className="btn-apple btn-apple-primary text-nowrap align-self-start align-self-md-center"
        >
          <CalendarIcon size={16} />
          <span>Agendar Nueva Cita</span>
        </Link>
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

      {/* Lista de Citas */}
      {patientAppointments.length === 0 ? (
        <div className="glass-panel text-center p-5">
          <div
            className="d-inline-flex p-3 rounded-circle text-primary mb-3"
            style={{ background: "rgba(0, 113, 227, 0.08)" }}
          >
            <CalendarIcon size={32} />
          </div>
          <h4 className="fw-semibold text-dark mb-2">No tienes citas programadas</h4>
          <p className="text-secondary mb-4" style={{ maxWidth: "420px", margin: "0 auto" }}>
            Puedes reservar una consulta médica con nuestros especialistas en el horario que mejor te convenga.
          </p>
          <Link to="/appointment-form" className="btn-apple btn-apple-primary">
            Agendar Primera Cita
          </Link>
        </div>
      ) : (
        <div className="row g-4">
          {patientAppointments.map((app) => {
            const status = getAppointmentStatus(app);
            const isCancelled = status === "Cancelada";
            const isExpired = status === "Vencida";

            return (
              <div key={app.id} className="col-12 col-md-6 col-lg-4">
                <div className="glass-panel h-100 p-4 d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <span
                        className={`apple-badge ${
                          isCancelled
                            ? "apple-badge-cancelled"
                            : isExpired
                            ? "apple-badge-expired"
                            : "apple-badge-active"
                        }`}
                      >
                        {status}
                      </span>

                      <span
                        className="d-flex align-items-center gap-1 text-muted"
                        style={{ fontSize: "0.8rem" }}
                      >
                        {app.reminder ? (
                          <BellIcon size={14} className="text-primary" />
                        ) : (
                          <BellOffIcon size={14} />
                        )}
                        <span>{app.reminder ? "Aviso activo" : "Sin aviso"}</span>
                      </span>
                    </div>

                    <h5 className="fw-semibold text-dark mb-2">
                      {app.especialidad}
                    </h5>

                    <div className="d-flex flex-column gap-2 text-secondary mb-4" style={{ fontSize: "0.9rem" }}>
                      <div className="d-flex align-items-center gap-2">
                        <StethoscopeIcon size={16} className="text-primary" />
                        <span>{app.medico}</span>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <CalendarIcon size={16} className="text-primary" />
                        <span>{app.fecha}</span>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <ClockIcon size={16} className="text-primary" />
                        <span>{app.hora}</span>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex gap-2 pt-3 border-top border-light-subtle">
                    <button
                      type="button"
                      className={`btn-apple btn-apple-pill-sm flex-grow-1 ${
                        app.reminder ? "btn-apple-secondary" : "btn-apple-outline"
                      }`}
                      onClick={() => toggleReminder(app.id)}
                      disabled={isCancelled || isExpired}
                    >
                      {app.reminder ? (
                        <>
                          <BellOffIcon size={14} />
                          <span>Desactivar Aviso</span>
                        </>
                      ) : (
                        <>
                          <BellIcon size={14} />
                          <span>Activar Aviso</span>
                        </>
                      )}
                    </button>

                    {!isCancelled && !isExpired && (
                      <button
                        type="button"
                        className="btn-apple btn-apple-pill-sm btn-apple-danger"
                        onClick={() => handleCancelClick(app.id)}
                        title="Cancelar esta cita"
                      >
                        <CloseIcon size={14} />
                        <span>Cancelar</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Alerta Preventiva 30 Minutos */}
      {reminderAppointment && (
        <div className="apple-modal-overlay" onClick={() => setReminderAppointment(null)}>
          <div className="apple-modal-card p-4" onClick={(e) => e.stopPropagation()}>
            <div className="d-flex align-items-center gap-2 text-primary mb-3">
              <div
                className="d-flex align-items-center justify-content-center text-primary"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "12px",
                  background: "rgba(0, 113, 227, 0.1)",
                }}
              >
                <BellIcon size={20} />
              </div>
              <h5 className="fw-semibold text-dark m-0">Recordatorio de Cita Médica</h5>
            </div>

            <p className="text-secondary mb-3" style={{ fontSize: "0.95rem" }}>
              Tu consulta médica está programada para iniciar en aproximadamente 30 minutos:
            </p>

            <div className="glass-panel-subtle p-3 mb-4">
              <div className="fw-semibold text-dark mb-1">{reminderAppointment.especialidad}</div>
              <div className="text-secondary small mb-1">
                Especialista: <strong>{reminderAppointment.medico}</strong>
              </div>
              <div className="text-secondary small">
                Horario: <strong>{reminderAppointment.fecha} a las {reminderAppointment.hora}</strong>
              </div>
            </div>

            <div className="d-flex justify-content-end">
              <button
                type="button"
                className="btn-apple btn-apple-primary"
                onClick={() => setReminderAppointment(null)}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación para Cancelar Cita */}
      <ConfirmModal
        isOpen={cancelModalState.isOpen}
        title="Cancelar Cita Médica"
        message="¿Estás seguro de que deseas cancelar esta cita? Esta acción no se puede deshacer."
        confirmText="Sí, cancelar cita"
        cancelText="Volver"
        isDanger={true}
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancelModalState({ isOpen: false, appointmentId: null })}
      />
    </div>
  );
}

export default PatientDashboard;
