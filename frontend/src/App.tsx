import { useEffect, useMemo, useState } from "react";

import { fetchRaceState, fetchStatus } from "./api/client";
import type { ApiStatus, RaceState, TimingCar } from "./api/types";
import "./App.css";

type DashboardData = {
  status: ApiStatus;
  raceState: RaceState;
};

type LoadState = "loading" | "ready" | "error";

const pollIntervalMs = 5_000;

function formatDateTime(value: string | null): string {
  if (value === null) {
    return "Waiting for data";
  }

  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(value));
}

function formatOptional(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  return String(value);
}

function getCarTeamName(car: TimingCar): string {
  return car.metadata?.teamName ?? car.teamName ?? "Unknown team";
}

function getCarModel(car: TimingCar): string {
  const make = car.metadata?.make;
  const model = car.metadata?.model;

  if (make !== null && make !== undefined && model !== null && model !== undefined) {
    return `${make} ${model}`;
  }

  return car.vehicle ?? make ?? "Unknown vehicle";
}

function App() {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData(): Promise<void> {
      try {
        const [status, raceState] = await Promise.all([
          fetchStatus(),
          fetchRaceState(),
        ]);

        if (!isMounted) {
          return;
        }

        setDashboardData({ status, raceState });
        setErrorMessage(null);
        setLoadState("ready");
      } catch (caughtError) {
        if (!isMounted) {
          return;
        }

        const message = caughtError instanceof Error
          ? caughtError.message
          : "Unable to load backend data";

        setErrorMessage(message);
        setLoadState("error");
      }
    }

    void loadDashboardData();
    const intervalId = window.setInterval(loadDashboardData, pollIntervalMs);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const leadingCars = useMemo(
    () => dashboardData?.raceState.cars.slice(0, 5) ?? [],
    [dashboardData],
  );

  return (
    <main className="app-shell">
      <header className="hero-panel">
        <div>
          <p className="eyebrow">ADAC RAVENOL 24h Nürburgring 2026</p>
          <h1>Live Race Dash</h1>
          <p className="hero-copy">
            Frontend connection test for the local backend race state. This is a
            temporary preview before the full dashboard layout.
          </p>
        </div>

        <div className="connection-stack" aria-label="Connection summary">
          <StatusPill label="Backend" isConnected={loadState === "ready"} />
          <StatusPill
            label="WIGE"
            isConnected={dashboardData?.status.wige.connected ?? false}
          />
        </div>
      </header>

      {loadState === "loading" && (
        <section className="notice-panel" aria-live="polite">
          Connecting to the local backend…
        </section>
      )}

      {loadState === "error" && (
        <section className="notice-panel error-panel" aria-live="polite">
          <h2>Backend connection failed</h2>
          <p>{errorMessage}</p>
          <p>
            Start the backend with <code>cd backend; npm start</code>, then keep
            this page open. It retries every {pollIntervalMs / 1_000} seconds.
          </p>
        </section>
      )}

      {dashboardData !== null && (
        <>
          <section className="metric-grid" aria-label="Race state summary">
            <MetricCard
              label="Live cars"
              value={dashboardData.status.raceState.carCount}
              detail={`${dashboardData.status.raceState.carsWithMetadata} with metadata`}
            />
            <MetricCard
              label="Race messages"
              value={dashboardData.status.raceState.messageCount}
              detail="from WIGE PID 3"
            />
            <MetricCard
              label="Last update"
              value={formatDateTime(dashboardData.status.raceState.lastUpdate)}
              detail={`last PID ${dashboardData.status.wige.lastMessagePid ?? "—"}`}
            />
            <MetricCard
              label="WIGE messages"
              value={dashboardData.status.wige.messageCount}
              detail={`${dashboardData.status.wige.reconnectCount} reconnects`}
            />
          </section>

          <section className="dashboard-grid">
            <article className="panel leaderboard-panel">
              <div className="panel-heading">
                <p className="eyebrow">Timing snapshot</p>
                <h2>Top five cars</h2>
              </div>

              <div className="leaderboard-list">
                {leadingCars.map((car) => (
                  <div className="leaderboard-row" key={car.carNumber}>
                    <span className="position">P{formatOptional(car.position)}</span>
                    <div>
                      <strong>#{car.carNumber}</strong>
                      <p>{getCarTeamName(car)}</p>
                    </div>
                    <div className="row-meta">
                      <span>{getCarModel(car)}</span>
                      <span>Lap {formatOptional(car.lap)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="panel diagnostics-panel">
              <div className="panel-heading">
                <p className="eyebrow">Backend diagnostics</p>
                <h2>API status</h2>
              </div>

              <dl className="diagnostics-list">
                <div>
                  <dt>Metadata cars</dt>
                  <dd>{dashboardData.status.metadata.count}</dd>
                </div>
                <div>
                  <dt>Images</dt>
                  <dd>{dashboardData.status.metadata.withImages}</dd>
                </div>
                <div>
                  <dt>PID 0 packets</dt>
                  <dd>{dashboardData.status.raceState.counters.pid0}</dd>
                </div>
                <div>
                  <dt>Track state</dt>
                  <dd>{dashboardData.status.raceState.hasTrackState ? "yes" : "no"}</dd>
                </div>
              </dl>
            </article>
          </section>
        </>
      )}
    </main>
  );
}

type MetricCardProps = {
  label: string;
  value: string | number;
  detail: string;
};

function MetricCard({ label, value, detail }: MetricCardProps) {
  return (
    <article className="metric-card">
      <p>{label}</p>
      <strong>{value}</strong>
      <span>{detail}</span>
    </article>
  );
}

type StatusPillProps = {
  label: string;
  isConnected: boolean;
};

function StatusPill({ label, isConnected }: StatusPillProps) {
  return (
    <div className={isConnected ? "status-pill is-connected" : "status-pill"}>
      <span aria-hidden="true" />
      {label}: {isConnected ? "online" : "offline"}
    </div>
  );
}

export default App;