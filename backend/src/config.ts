export type WigeSource = "live" | "playback";

function readWigeSource(): WigeSource {
  return process.env.WIGE_SOURCE === "live" ? "live" : "playback";
}

export const config = {
  port: 3001,
  eventId: 50,
  livetimingWsUrl: "wss://livetiming.azurewebsites.net",
  eventhubBootstrapUrl: "https://maps.24h-rennen.de/api/v2/bootstrap",
  livetimingPids: [0, 4, 3, 9002] as const,
  wigeSource: readWigeSource(),
  playbackPacketsPath:
    process.env.WIGE_PLAYBACK_PATH ?? "playback/2026-05-17T13-11-43-056Z/packets.ndjson",
};