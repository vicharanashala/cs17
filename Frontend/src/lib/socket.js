import { io } from 'socket.io-client';

// Lazy singleton — connect on first access, reuse thereafter.
let socket = null;

export function getSocket() {
  if (!socket) {
    // In development Vite serves on 5173; backend is on 5002.
    // Use relative URL so it picks up the same host.
    socket = io({
      withCredentials: true,
      autoConnect: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('[socket] connected:', socket.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('[socket] disconnected:', reason);
    });

    socket.on('connect_error', (err) => {
      console.warn('[socket] connection error:', err.message);
    });
  }
  return socket;
}

/**
 * Subscribe to a socket event and auto-cleanup when the returned
 * cleanup function is called.
 * Pass the socket instance explicitly, or use the singleton.
 */
export function onSocketEvent(event, handler, sock = getSocket()) {
  sock.on(event, handler);
  return () => sock.off(event, handler);
}