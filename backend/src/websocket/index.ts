import { WebSocketService } from './socket.js';

// Global WebSocket Service Instance
let globalWebSocketService: WebSocketService | null = null;

export function setWebSocketService(service: WebSocketService): void {
  globalWebSocketService = service;
  console.log('✅ Global WebSocket service registered');
}

export function getWebSocketService(): WebSocketService | null {
  return globalWebSocketService;
}

export function isWebSocketAvailable(): boolean {
  return globalWebSocketService !== null;
}
