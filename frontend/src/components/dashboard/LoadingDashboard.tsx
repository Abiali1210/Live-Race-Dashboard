const skeletonRows = Array.from({ length: 8 }, (_, index) => `skeleton-row-${index}`);

export function LoadingDashboard() {
  return (
    <section className="loading-dashboard" aria-label="Dashboard loading preview" aria-hidden="true">
      <div className="dashboard-grid loading-grid">
        <article className="panel leaderboard-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Timing snapshot</p>
              <h2>Preparing field</h2>
            </div>
          </div>
          <div className="skeleton-table" aria-hidden="true">
            {skeletonRows.map((rowKey) => (
              <span className="skeleton-line" key={rowKey} />
            ))}
          </div>
        </article>

        <article className="panel map-panel loading-map-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Circuit reference</p>
              <h2>Nürburgring 24h layout</h2>
            </div>
          </div>
          <div className="skeleton-map" />
        </article>
      </div>
    </section>
  );
}