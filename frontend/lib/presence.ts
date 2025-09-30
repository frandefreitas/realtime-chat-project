import { publishJSON } from './nats';

let timer: any;

export function startPresenceHeartbeat(userId: string) {
  stopPresenceHeartbeat();
  const beat = () => publishJSON(`presence.heartbeat.${userId}`, { t: Date.now() });
  beat();
  timer = setInterval(beat, 10_000);
}

export function stopPresenceHeartbeat() {
  if (timer) clearInterval(timer);
  timer = null;
}
