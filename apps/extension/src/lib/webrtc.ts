import { SignalingClient, type SignalMessage } from './signaling';

export class PeerTournament {
  private readonly connection: RTCPeerConnection;
  private readonly channel: RTCDataChannel;
  constructor(private readonly room: string, signalingUrl = 'wss://gambitnet-signaling.onrender.com') {
    const signaling = new SignalingClient(signalingUrl);
    this.connection = new RTCPeerConnection();
    this.channel = this.connection.createDataChannel('gambitnet-match');
    this.connection.onicecandidate = event => { if (event.candidate) signaling.send({ type: 'candidate', room, payload: event.candidate }); };
    signaling.connect(message => this.handleSignal(message, signaling));
  }
  send(payload: unknown): void { if (this.channel.readyState === 'open') this.channel.send(JSON.stringify(payload)); }
  onMessage(handler: (payload: unknown) => void): void { this.channel.onmessage = event => handler(JSON.parse(event.data)); }
  private async handleSignal(message: SignalMessage, signaling: SignalingClient): Promise<void> { if (message.room !== this.room) return; if (message.type === 'offer') { await this.connection.setRemoteDescription(message.payload as RTCSessionDescriptionInit); const answer = await this.connection.createAnswer(); await this.connection.setLocalDescription(answer); signaling.send({ type: 'answer', room: this.room, payload: answer }); } else if (message.type === 'answer') await this.connection.setRemoteDescription(message.payload as RTCSessionDescriptionInit); else if (message.type === 'candidate') await this.connection.addIceCandidate(message.payload as RTCIceCandidateInit); }
}
