function Specialties({ specialties }) {
  return (
    <div className="container my-4">
      <div className="card shadow p-4">
        <h2 className="text-center text-primary mb-3">
          📋 Especialidades Disponibles
        </h2>
        <ul className="list-group">
          {specialties.map((spec) => (
            <li key={spec} className="list-group-item">
              🏥 {spec}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
export default Specialties;
