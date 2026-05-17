import type { RaceMessage } from "../../api/types";
import { formatMessageMeta, formatOptional } from "../../dashboard/formatters";

type MessagesPanelProps = {
  messages: RaceMessage[];
};

export function MessagesPanel({ messages }: MessagesPanelProps) {
  return (
    <article className="panel messages-panel">
      <div className="panel-heading">
        <p className="eyebrow">Race control</p>
        <h2>Recent messages</h2>
      </div>

      {messages.length > 0 ? (
        <div className="message-list" role="list">
          {messages.map((message, index) => (
            <div className="message-row" key={`${message.id ?? "message"}-${index}`} role="listitem">
              <span>{formatMessageMeta(message)}</span>
              <p>{formatOptional(message.text)}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="panel-note">
          No race-control messages received yet. WIGE messages arrive only when the live feed emits them.
        </p>
      )}
    </article>
  );
}