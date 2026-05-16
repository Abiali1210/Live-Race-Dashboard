export const config = {
  port: 3001,
  eventId: 50,
  livetimingWsUrl: "wss://livetiming.azurewebsites.net",
  eventhubBootstrapUrl: "https://maps.24h-rennen.de/api/v2/bootstrap",
  livetimingPids: [0, 4, 3, 9002] as const,
};