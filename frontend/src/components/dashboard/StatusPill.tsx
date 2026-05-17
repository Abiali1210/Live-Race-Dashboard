type StatusPillProps = {
  label: string;
  isConnected: boolean;
};

export function StatusPill({ label, isConnected }: StatusPillProps) {
  return (
    <div
      className={isConnected ? "status-pill is-connected" : "status-pill"}
      role="status"
      aria-label={`${label} is ${isConnected ? "online" : "offline"}`}
    >
      <span aria-hidden="true" />
      {label}: {isConnected ? "online" : "offline"}
    </div>
  );
}