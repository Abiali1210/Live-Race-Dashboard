import type { TrackStateSummaryItem } from "../../dashboard/formatters";

type TrackStatePanelProps = {
  trackStateSummary: TrackStateSummaryItem[] | null;
};

export function TrackStatePanel({ trackStateSummary }: TrackStatePanelProps) {
  return (
    <article className="panel track-state-panel">
      <div className="panel-heading">
        <p className="eyebrow">Track state</p>
        <h2>Race control state</h2>
      </div>

      {trackStateSummary !== null ? (
        <dl className="diagnostics-list">
          {trackStateSummary.map((item) => (
            <div key={item.label}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="panel-note">Waiting for track-state packet.</p>
      )}
    </article>
  );
}