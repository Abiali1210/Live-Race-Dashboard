import type { ApiStatus } from "../../api/types";

type FeedStatusSummaryProps = {
  status: ApiStatus;
  refreshedAtLabel: string;
};

function formatTimingSource(source: ApiStatus["timingSource"]): string {
  return source === "playback" ? "Playback" : "Live";
}

export function FeedStatusSummary({ status, refreshedAtLabel }: FeedStatusSummaryProps) {
  return (
    <aside className="feed-status-summary" aria-label="Feed status summary">
      <p>Feed status</p>
      <dl>
        <div>
          <dt>Cars</dt>
          <dd>{status.raceState.carCount}</dd>
        </div>
        <div>
          <dt>Messages</dt>
          <dd>{status.raceState.messageCount}</dd>
        </div>
        <div>
          <dt>Source</dt>
          <dd>{formatTimingSource(status.timingSource)}</dd>
        </div>
        <div>
          <dt>Refreshed</dt>
          <dd>{refreshedAtLabel}</dd>
        </div>
        <div>
          <dt>WIGE</dt>
          <dd>{status.wige.messageCount}</dd>
        </div>
      </dl>
    </aside>
  );
}