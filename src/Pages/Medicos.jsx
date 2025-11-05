import React from "react";

function Doctors({ doctors }) {
  return (
    <div className="container my-4">
      <div className="card shadow p-4">
        <h2 className="text-center text-primary mb-3">
          👨‍⚕️ Médicos Disponibles
        </h2>
        <ul className="list-group">
          {doctors.map((doc) => (
            <li key={doc.id} className="list-group-item">
              👨‍⚕️ <strong>{doc.nombre}</strong> — {doc.especialidad}
              <br />
              <small className="text-muted">
                Días: {doc.dias.join(", ")} | Horas: {doc.horas.join(", ")}
              </small>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Doctors;
