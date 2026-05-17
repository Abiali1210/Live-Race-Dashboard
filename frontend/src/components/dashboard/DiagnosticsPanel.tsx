import type { ApiStatus } from "../../api/types";
import { formatOptional } from "../../dashboard/formatters";

type DiagnosticsPanelProps = {
  status: ApiStatus;
};

export function DiagnosticsPanel({ status }: DiagnosticsPanelProps) {
  return (
    <article className="panel diagnostics-panel">
      <div className="panel-heading">
        <p className="eyebrow">Backend diagnostics</p>
        <h2>API status</h2>
      </div>

      <dl className="diagnostics-list">
        <div>
          <dt>Metadata cars</dt>
          <dd>{status.metadata.count}</dd>
        </div>
        <div>
          <dt>Images</dt>
          <dd>{status.metadata.withImages}</dd>
        </div>
        <div>
          <dt>Cars with metadata</dt>
          <dd>{status.raceState.carsWithMetadata}</dd>
        </div>
        <div>
          <dt>Cars missing metadata</dt>
          <dd>{status.raceState.carsWithoutMetadata}</dd>
        </div>
        <div>
          <dt>Last PID</dt>
          <dd>{formatOptional(status.wige.lastMessagePid)}</dd>
        </div>
        <div>
          <dt>Reconnects</dt>
          <dd>{status.wige.reconnectCount}</dd>
        </div>
        <div>
          <dt>PID 0 / 3 / 4 / 9002</dt>
          <dd>
            {status.raceState.counters.pid0} / {status.raceState.counters.pid3} / {status.raceState.counters.pid4} / {status.raceState.counters.pid9002}
          </dd>
        </div>
      </dl>
    </article>
  );
}