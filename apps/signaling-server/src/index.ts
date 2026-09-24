import { WebSocketServer, WebSocket, type RawData } from 'ws';

const port = Number(process.env.PORT ?? 8787);
const rooms = new Map<string, Set<WebSocket>>();
const server = new WebSocketServer({ port });
server.on('connection', (socket: WebSocket) => {
  socket.on('message', (data: RawData) => {
    const message = JSON.parse(data.toString()) as { room: string };
    const peers = rooms.get(message.room) ?? new Set<WebSocket>();
    peers.add(socket);
    rooms.set(message.room, peers);
    peers.forEach(peer => { if (peer !== socket && peer.readyState === WebSocket.OPEN) peer.send(data.toString()); });
  });
  socket.on('close', () => rooms.forEach(peers => peers.delete(socket)));
});
console.log(`GambitNet signaling server listening on ${port}`);
