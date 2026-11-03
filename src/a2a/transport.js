import { validMessage, validRoom } from "./protocol.js";

export function relayAddress(base, room) {
  if (!base || !validRoom(room)) return undefined;
  try {
    const url = new URL(base);
    if (!["ws:", "wss:"].includes(url.protocol) || url.username || url.password) return undefined;
    url.searchParams.set("room", room);
    return url.href;
  } catch { return undefined; }
}

/** One connection per mounted side, shared by presence and story listeners. No offline queue. */
export function connectRelay(url, onMessage, onOpen, onClose, Socket = WebSocket, retryMs = 2000) {
  let socket;
  let retry;
  let stopped = false;
  const connect = () => {
    if (stopped) return;
    try { socket = new Socket(url); } catch { retry = setTimeout(connect, retryMs); return; }
    socket.onopen = () => { if (!stopped) onOpen(); };
    socket.onmessage = (event) => {
      try {
        if (typeof event.data !== "string" || event.data.length > 1024) return;
        const m = JSON.parse(event.data);
        if (!stopped && validMessage(m)) onMessage(m);
      } catch { /* Ignore malformed relay traffic. */ }
    };
    socket.onerror = () => socket.close();
    socket.onclose = () => {
      if (!stopped) { onClose(); retry = setTimeout(connect, retryMs); }
    };
  };
  connect();
  return {
    send(m) { if (socket?.readyState === 1) socket.send(JSON.stringify(m)); },
    close() {
      stopped = true;
      clearTimeout(retry);
      if (socket) {
        socket.onopen = socket.onmessage = socket.onerror = socket.onclose = null;
        socket.close();
      }
    },
  };
}
