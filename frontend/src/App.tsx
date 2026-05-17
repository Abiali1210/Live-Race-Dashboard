import { useEffect, useMemo, useRef, useState } from "react";

import { fetchRaceState, fetchStatus } from "./api/client";
import type { ApiStatus, RaceState } from "./api/types";
import { DiagnosticsPanel } from "./components/dashboard/DiagnosticsPanel";
import { FeaturedCarPanel } from "./components/dashboard/FeaturedCarPanel";
import { LeaderboardTable } from "./components/dashboard/LeaderboardTable";
import { MessagesPanel } from "./components/dashboard/MessagesPanel";
import { MetricCard } from "./components/dashboard/MetricCard";
import { StatusPill } from "./components/dashboard/StatusPill";
import { TrackStatePanel } from "./components/dashboard/TrackStatePanel";
import { TrackMap } from "./components/TrackMap";
import { formatDateTime, formatTrackStateSummary } from "./dashboard/formatters";
import "./App.css";

type DashboardData = {
  status: ApiStatus;
  raceState: RaceState;
};

type LoadState = "loading" | "ready" | "error";

const pollIntervalMs = 5_000;

function App() {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastSuccessfulRefreshAt, setLastSuccessfulRefreshAt] = useState<string | null>(null);
  const [selectedCarNumber, setSelectedCarNumber] = useState<string | null>(null);
  const hasLoadedDataRef = useRef(false);

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

        hasLoadedDataRef.current = true;
        setDashboardData({ status, raceState });
        setErrorMessage(null);
        setLastSuccessfulRefreshAt(new Date().toISOString());
        setLoadState("ready");
      } catch (caughtError) {
        if (!isMounted) {
          return;
        }

        const message = caughtError instanceof Error
          ? caughtError.message
          : "Unable to load backend data";

        setErrorMessage(message);
        setLoadState(hasLoadedDataRef.current ? "ready" : "error");
      }
    }

    void loadDashboardData();
    const intervalId = window.setInterval(loadDashboardData, pollIntervalMs);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const dashboardView = useMemo(() => {
    if (dashboardData === null) {
      return null;
    }

    const leaderboardCars = dashboardData.raceState.cars;
    const selectedCar = selectedCarNumber === null
      ? null
      : leaderboardCars.find((car) => car.carNumber === selectedCarNumber) ?? null;
    const featuredCar = selectedCar ?? leaderboardCars[0] ?? null;
    const recentMessages = dashboardData.raceState.messages.slice(-10).reverse();

    return {
      backendConnected: errorMessage === null,
      featuredCar,
      leaderboardCars,
      recentMessages,
      refreshedAtLabel: formatDateTime(lastSuccessfulRefreshAt),
      selectedCarNumber: featuredCar?.carNumber ?? null,
      trackStateSummary: dashboardData.raceState.trackState === null
        ? null
        : formatTrackStateSummary(dashboardData.raceState.trackState),
      wigeConnected: dashboardData.status.wige.connected,
    };
  }, [dashboardData, errorMessage, lastSuccessfulRefreshAt, selectedCarNumber]);

  const hasRefreshError = dashboardData !== null && errorMessage !== null;

  return (
    <main className="app-shell">
      <header className="hero-panel">
        <div>
          <p className="eyebrow">ADAC RAVENOL 24h Nürburgring 2026</p>
          <h1>Live Race Dash</h1>
          <p className="hero-copy">
            Race-control shell for local backend timing data, metadata, and circuit context.
          </p>
        </div>

        <div className="connection-stack" aria-label="Connection summary">
          <StatusPill label="Backend" isConnected={dashboardView?.backendConnected ?? false} />
          <StatusPill
            label="WIGE"
            isConnected={dashboardView?.wigeConnected ?? false}
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

      {hasRefreshError && (
        <section className="notice-panel error-panel" aria-live="polite">
          <h2>Live refresh failed</h2>
          <p>{errorMessage}</p>
          <p>Keeping the last successful dashboard data visible while polling continues.</p>
        </section>
      )}

      {dashboardData !== null && dashboardView !== null && (
        <>
          <section className="metric-grid command-metrics" aria-label="Race state summary">
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
              detail={`refreshed ${dashboardView.refreshedAtLabel}`}
            />
            <MetricCard
              label="WIGE messages"
              value={dashboardData.status.wige.messageCount}
              detail={`${dashboardData.status.wige.reconnectCount} reconnects`}
            />
          </section>

          <section className="dashboard-grid" aria-label="Live race dashboard panels">
            <article className="panel leaderboard-panel">
              <div className="panel-heading">
                <p className="eyebrow">Timing snapshot</p>
                <h2>Full field</h2>
                <span className="panel-kicker">{dashboardView.leaderboardCars.length} cars</span>
              </div>

              <LeaderboardTable
                cars={dashboardView.leaderboardCars}
                selectedCarNumber={dashboardView.selectedCarNumber}
                onSelectCar={setSelectedCarNumber}
              />
            </article>

            <article className="panel map-panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Circuit reference</p>
                  <h2>Nürburgring 24h layout</h2>
                </div>
                <span className="panel-kicker">Nordschleife + GP</span>
              </div>

              <TrackMap className="dashboard-track-map" />
            </article>

            <MessagesPanel messages={dashboardView.recentMessages} />

            <FeaturedCarPanel
              car={dashboardView.featuredCar}
              selectedCarNumber={selectedCarNumber}
            />

            <TrackStatePanel trackStateSummary={dashboardView.trackStateSummary} />

            <DiagnosticsPanel status={dashboardData.status} />
          </section>
        </>
      )}
    </main>
  );
}

export default App;