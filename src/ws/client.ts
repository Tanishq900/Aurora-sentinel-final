import { io, Socket } from 'socket.io-client';

const WS_URL = (import.meta as any).env?.VITE_WS_URL || 'http://localhost:3001';

let socket: Socket | null = null;

function getCleanAccessToken(): string | null {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    return null;
  }

  const cleanedToken = token.trim().replace(/^Bearer\s+/i, '');
  if (!cleanedToken || cleanedToken === 'null' || cleanedToken === 'undefined') {
    return null;
  }

  return cleanedToken;
}

function handleSocketAuthFailure(message: string): void {
  console.warn('WebSocket authentication failed:', message);
  localStorage.removeItem('accessToken');

  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
}

export function getSocket(): Socket | null {
  return socket;
}

export function connectSocket(token: string): Socket {
  if (socket?.connected) {
    return socket;
  }

  if (socket) {
    socket.disconnect();
    socket = null;
  }

  const initialToken = token?.trim().replace(/^Bearer\s+/i, '');
  if (!initialToken) {
    console.error('WebSocket: No token provided, cannot connect');
    throw new Error('Token required for WebSocket connection');
  }

  socket = io(WS_URL, {
    auth: {
      token: initialToken,
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });

  socket.io.on('reconnect_attempt', () => {
    if (!socket) {
      return;
    }

    const refreshedToken = getCleanAccessToken();
    if (!refreshedToken) {
      socket.disconnect();
      handleSocketAuthFailure('Missing access token');
      return;
    }

    socket.auth = { token: refreshedToken };
  });

  socket.on('connect_error', (error) => {
    const message = String(error?.message || 'Unknown socket error');
    const normalized = message.toLowerCase();

    if (normalized.includes('invalid or expired token') || normalized.includes('authentication required')) {
      socket?.disconnect();
      handleSocketAuthFailure(message);
      return;
    }

    console.error('WebSocket connection error:', message);
  });

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
