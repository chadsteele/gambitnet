export interface SignalMessage { type: 'offer' | 'answer' | 'candidate'; room: string; payload: unknown; }

export class SignalingClient {
  private socket?: WebSocket;
  constructor(private readonly url: string) {}
  connect(onMessage: (message: SignalMessage) => void): void { this.socket = new WebSocket(this.url); this.socket.onmessage = event => onMessage(JSON.parse(event.data) as SignalMessage); }
  send(message: SignalMessage): void { if (this.socket?.readyState === WebSocket.OPEN) this.socket.send(JSON.stringify(message)); }
  close(): void { this.socket?.close(); }
}
