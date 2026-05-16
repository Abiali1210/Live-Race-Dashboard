const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const eventId = Number(process.argv[2] || 50);
const eventPids = (process.argv[3] || '0,4,3,9002')
  .split(',')
  .map((v) => Number(v.trim()))
  .filter((v) => Number.isFinite(v));
const durationMs = Number(process.argv[4] || 30000);
const url = process.argv[5] || 'wss://livetiming.azurewebsites.net';

fs.mkdirSync('captures', { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const outPath = path.join('captures', `livetiming-ws-event-${eventId}-${stamp}.jsonl`);
const out = fs.createWriteStream(outPath, { flags: 'a' });

function write(record) {
  out.write(JSON.stringify({ ts: new Date().toISOString(), ...record }) + '\n');
}

console.log(`Connecting ${url} eventId=${eventId} eventPid=${eventPids.join(',')} for ${durationMs}ms`);
console.log(`Writing ${outPath}`);

const ws = new WebSocket(url, {
  headers: {
    Origin: 'https://livetiming.azurewebsites.net',
    Referer: `https://livetiming.azurewebsites.net/events/${eventId}/results`,
    'User-Agent': 'Mozilla/5.0 LiveRaceDashDiscovery/1.0',
  },
});

ws.on('open', () => {
  console.log('open');
  const hello = { eventId, eventPid: eventPids, clientLocalTime: Date.now() };
  write({ direction: 'out', data: hello });
  ws.send(JSON.stringify(hello));
});

ws.on('message', (data) => {
  const text = data.toString();
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = text;
  }
  write({ direction: 'in', data: parsed });
  if (typeof parsed === 'object' && parsed !== null) {
    console.log('message', parsed.PID, Object.keys(parsed).slice(0, 16).join(','));
  } else {
    console.log('message-text', text.slice(0, 120));
  }
});

ws.on('error', (err) => {
  console.error('error', err.message);
  write({ direction: 'error', message: err.message });
});

ws.on('close', (code, reason) => {
  console.log('close', code, reason.toString());
  write({ direction: 'close', code, reason: reason.toString() });
  out.end();
});

setTimeout(() => {
  console.log('timeout closing');
  ws.close(1000, 'capture complete');
}, durationMs);