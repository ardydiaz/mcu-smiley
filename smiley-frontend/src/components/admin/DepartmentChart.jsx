export default function DepartmentChart({ departments = [] }) {
  const max = Math.max(1, ...departments.map(row => Number(row.votes) || 0));
  return (
    <section className="data-panel">
      <h2>Departments</h2>
      <div className="bar-list">
        {departments.map(row => (
          <div className="bar-row" key={row.id}>
            <div>
              <strong>{row.name}</strong>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: ((Number(row.votes) || 0) / max * 100) + '%' }} />
              </div>
            </div>
            <span>{row.votes}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
