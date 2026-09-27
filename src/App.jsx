import React, { useEffect, useState, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { supabase } from "./supabase";

import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import ProtectedRoute from "./Components/ProtectedRoute";
import { AlertCircleIcon, RefreshIcon } from "./Components/Icons";

import Home from "./Pages/Home";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import PatientDashboard from "./Pages/PatientDashboard";
import AppointmentForm from "./Pages/AppointmentForm";
import AdminDashboard from "./Pages/AdminDashboard";
import Specialties from "./Pages/Especialidades";
import Doctors from "./Pages/Medicos";

function App() {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [specialties, setSpecialties] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estado del indicador de conexión con Supabase
  const [dbStatus, setDbStatus] = useState("connecting"); // 'connecting' | 'connected' | 'error'
  const [dbError, setDbError] = useState(null);

  // Normalizar estructura de citas con joins de pacientes y médicos
  const normalizeAppointment = (a) => ({
    ...a,
    paciente: a.pacientes
      ? `${a.pacientes.nombre} ${a.pacientes.apellido}`.trim()
      : "Paciente no registrado",
    medico: a.medicos?.nombre || "Médico no asignado",
    especialidad:
      a.medicos?.especialidades?.nombre || "Sin especialidad",
  });

  // Función de carga y verificación de conexión con Supabase
  const fetchData = useCallback(async () => {
    setDbStatus("connecting");
    setDbError(null);

    try {
      // 1. Especialidades
      const { data: specData, error: specError } = await supabase
        .from("especialidades")
        .select("id, nombre")
        .order("nombre", { ascending: true });
      if (specError) throw specError;

      // 2. Médicos con relación a especialidades
      const { data: docData, error: docError } = await supabase
        .from("medicos")
        .select("id, nombre, especialidad_id, dias, horas, especialidades(id, nombre)")
        .order("nombre", { ascending: true });
      if (docError) throw docError;

      // 3. Citas con joins hacia pacientes y médicos
      const { data: appData, error: appError } = await supabase
        .from("citas")
        .select(`
          id, fecha, hora, status, reminder, paciente_id, medico_id,
          pacientes (id, nombre, apellido),
          medicos (id, nombre, especialidad_id, especialidades (id, nombre))
        `)
        .order("fecha", { ascending: false });
      if (appError) throw appError;

      setSpecialties(specData || []);
      setDoctors(
        (docData || []).map((d) => ({
          ...d,
          especialidad: d.especialidades?.nombre || "Sin especialidad",
        }))
      );
      setAppointments((appData || []).map(normalizeAppointment));

      // Conexión exitosa verificada
      setDbStatus("connected");
      setDbError(null);
    } catch (err) {
      setDbStatus("error");
      const errorMsg =
        err?.message ||
        (typeof err === "string" ? err : "Error de comunicación con Supabase");
      setDbError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Agregar nueva cita en Supabase
  const addAppointment = async (newAppointment) => {
    const { data, error } = await supabase
      .from("citas")
      .insert([newAppointment])
      .select(`
        id, fecha, hora, status, reminder, paciente_id, medico_id,
        pacientes (id, nombre, apellido),
        medicos (id, nombre, especialidad_id, especialidades (id, nombre))
      `)
      .single();

    if (error) throw error;
    setAppointments((prev) => [normalizeAppointment(data), ...prev]);
    return data;
  };

  // Actualizar cita en Supabase
  const updateAppointment = async (id, updates) => {
    const { data, error } = await supabase
      .from("citas")
      .update(updates)
      .eq("id", id)
      .select(`
        id, fecha, hora, status, reminder, paciente_id, medico_id,
        pacientes (id, nombre, apellido),
        medicos (id, nombre, especialidad_id, especialidades (id, nombre))
      `)
      .single();

    if (error) throw error;
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? normalizeAppointment(data) : a))
    );
    return data;
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  if (loading) {
    return (
      <div
        className="d-flex flex-column justify-content-center align-items-center vh-100"
        style={{
          background: "linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 50%, #F1F5F9 100%)",
        }}
      >
        <div
          className="glass-panel p-5 text-center d-flex flex-column align-items-center gap-3"
          style={{ maxWidth: "340px" }}
        >
          <div
            className="spinner-border text-primary"
            style={{ width: "2.75rem", height: "2.75rem", borderWidth: "3px" }}
            role="status"
          >
            <span className="visually-hidden">Cargando...</span>
          </div>
          <div className="fw-medium text-dark" style={{ fontSize: "1rem" }}>
            Clínica Salud+
          </div>
          <div className="text-secondary small">
            Verificando conexión con Supabase...
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="d-flex flex-column min-vh-100">
        {/* Banner de Alerta Global si falla la conexión al iniciar */}
        {dbStatus === "error" && (
          <div
            className="py-2 px-3 text-center small d-flex justify-content-center align-items-center gap-2"
            style={{
              backgroundColor: "rgba(239, 68, 68, 0.92)",
              backdropFilter: "blur(10px)",
              color: "#ffffff",
              fontSize: "0.85rem",
              zIndex: 1060,
            }}
          >
            <AlertCircleIcon size={16} />
            <span>
              <strong>Sin conexión con Supabase:</strong> {dbError}
            </span>
            <button
              type="button"
              className="btn btn-sm btn-light py-0 px-2 ms-2 rounded-pill d-inline-flex align-items-center gap-1"
              style={{ fontSize: "0.775rem" }}
              onClick={fetchData}
            >
              <RefreshIcon size={12} />
              <span>Reintentar</span>
            </button>
          </div>
        )}

        <Navbar
          user={user}
          onLogout={handleLogout}
          dbStatus={dbStatus}
          dbError={dbError}
          onRetryDb={fetchData}
        />

        <main className="flex-grow-1 container py-4">
          <Routes>
            <Route path="/" element={<Home user={user} />} />
            <Route
              path="/login"
              element={
                <Login
                  setUser={setUser}
                  dbStatus={dbStatus}
                  dbError={dbError}
                />
              }
            />
            <Route path="/register" element={<Register setUser={setUser} />} />

            <Route
              path="/specialties"
              element={
                <ProtectedRoute user={user}>
                  <Specialties specialties={specialties} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/doctors"
              element={
                <ProtectedRoute user={user}>
                  <Doctors doctors={doctors} />
                </ProtectedRoute>
              }
            />

            <Route
              path="/appointment-form"
              element={
                <ProtectedRoute user={user} requiredRole="patient">
                  <AppointmentForm
                    specialties={specialties}
                    doctors={doctors}
                    user={user}
                    addAppointment={addAppointment}
                  />
                </ProtectedRoute>
              }
            />

            <Route
              path="/patient-dashboard"
              element={
                <ProtectedRoute user={user} requiredRole="patient">
                  <PatientDashboard
                    user={user}
                    appointments={appointments}
                    updateAppointment={updateAppointment}
                  />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin-dashboard"
              element={
                <ProtectedRoute user={user} requiredRole="admin">
                  <AdminDashboard
                    specialties={specialties}
                    setSpecialties={setSpecialties}
                    doctors={doctors}
                    setDoctors={setDoctors}
                    appointments={appointments}
                    setAppointments={setAppointments}
                  />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
