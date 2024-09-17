import { GameState, ServerUpdate } from './types';

export class NetworkManager {
	private socket: WebSocket | null = null;
	private serverUpdateCallback: (gameState: GameState) => void;

	constructor(serverUpdateCallback: (gameState: GameState) => void) {
		this.serverUpdateCallback = serverUpdateCallback;
	}

	connect() {
		if (import.meta.env.VITE_WORKER_URL) {
			this.socket = new WebSocket(import.meta.env.VITE_WORKER_URL);
		} else {
			this.socket = new WebSocket('ws://localhost:8787');
		}

		this.socket.onopen = () => {
			console.log('Connected to server');
		};

		this.socket.onmessage = event => {
			const gameState: GameState = JSON.parse(event.data);
			this.serverUpdateCallback(gameState);
		};

		this.socket.onerror = error => {
			console.error('WebSocket error:', error);
		};

		this.socket.onclose = () => {
			console.log('Disconnected from server');
			// Implement reconnection logic here if needed
		};
	}

	sendUpdate(update: ServerUpdate) {
		if (this.socket && this.socket.readyState === WebSocket.OPEN) {
			this.socket.send(JSON.stringify(update));
		}
	}

	disconnect() {
		if (this.socket) {
			this.socket.close();
		}
	}
}
