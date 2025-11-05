import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { supabase } from "./supabase";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

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
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [specialties, setSpecialties] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Normalizar cita con joins
  const normalizeAppointment = (a) => ({
    ...a,
    paciente: a.pacientes
      ? `${a.pacientes.nombre} ${a.pacientes.apellido}`
      : "Paciente desconocido",
    medico: a.medicos?.nombre || "Médico desconocido",
    especialidad: a.medicos?.especialidades?.nombre || "Sin especialidad",
  });

  // 🔹 Cargar datos desde Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Especialidades
        const { data: specData, error: specError } = await supabase
          .from("especialidades")
          .select("*");
        if (specError) throw specError;

        // Médicos con relación a especialidad
        const { data: docData, error: docError } = await supabase
          .from("medicos")
          .select("id, nombre, dias, horas, especialidades(nombre)");
        if (docError) throw docError;

        // Citas con join a pacientes y médicos
        const { data: appData, error: appError } = await supabase.from("citas")
          .select(`
            id, fecha, hora, status, reminder, paciente_id, medico_id,
            pacientes(id, nombre, apellido),
            medicos(id, nombre, especialidades(nombre))
          `);
        if (appError) throw appError;

        setSpecialties(specData || []);
        setDoctors(
          (docData || []).map((d) => ({
            ...d,
            especialidad: d.especialidades?.nombre || "Sin especialidad",
          }))
        );
        setAppointments((appData || []).map(normalizeAppointment));
      } catch (error) {
        console.error("Error al cargar datos de Supabase:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 🔹 Agregar nueva cita
  const addAppointment = async (newAppointment) => {
    try {
      const { data, error } = await supabase
        .from("citas")
        .insert([newAppointment])
        .select(
          `
          id, fecha, hora, status, reminder, paciente_id, medico_id,
          pacientes(id, nombre, apellido),
          medicos(id, nombre, especialidades(nombre))
        `
        )
        .single();
      if (error) throw error;

      setAppointments([...appointments, normalizeAppointment(data)]);
    } catch (error) {
      console.error("Error al agregar cita:", error);
    }
  };

  // 🔹 Actualizar cita
  const updateAppointment = async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from("citas")
        .update(updates)
        .eq("id", id)
        .select(
          `
          id, fecha, hora, status, reminder, paciente_id, medico_id,
          pacientes(id, nombre, apellido),
          medicos(id, nombre, especialidades(nombre))
        `
        )
        .single();
      if (error) throw error;

      setAppointments(
        appointments.map((a) => (a.id === id ? normalizeAppointment(data) : a))
      );
    } catch (error) {
      console.error("Error al actualizar cita:", error);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="d-flex flex-column min-vh-100 bg-light">
        <Navbar user={user} onLogout={handleLogout} />
        <main className="flex-grow-1 container py-4">
          <Routes>
            <Route path="/" element={<Home user={user} />} />
            <Route path="/login" element={<Login setUser={setUser} />} />
            <Route path="/register" element={<Register setUser={setUser} />} />

            <Route
              path="/specialties"
              element={
                <ProtectedRoute user={user}>
                  <Specialties specialties={specialties.map((s) => s.nombre)} />
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
                <ProtectedRoute user={user}>
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
                <ProtectedRoute user={user} role="patient">
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
                <ProtectedRoute user={user} role="admin">
                  <AdminDashboard
                    specialties={specialties}
                    setSpecialties={setSpecialties}
                    doctors={doctors}
                    setDoctors={setDoctors}
                    appointments={appointments}
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
