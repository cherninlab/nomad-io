import { GameState, ServerMessage, ClientMessage } from './types';

export class NetworkManager {
	private socket: WebSocket | null = null;
	private serverUpdateCallback: (gameState: GameState) => void;
	private reconnectInterval: number = 5000; // 5 seconds
	private reconnectTimeout: NodeJS.Timeout | null = null;

	constructor(serverUpdateCallback: (gameState: GameState) => void) {
		this.serverUpdateCallback = serverUpdateCallback;
	}

	connect() {
		if (this.socket) {
			this.socket.close();
		}

		const wsUrl = import.meta.env.VITE_WORKER_URL || 'ws://localhost:8787';
		this.socket = new WebSocket(wsUrl);

		this.socket.onopen = this.handleOpen.bind(this);
		this.socket.onmessage = this.handleMessage.bind(this);
		this.socket.onerror = this.handleError.bind(this);
		this.socket.onclose = this.handleClose.bind(this);
	}

	private handleOpen() {
		console.log('WebSocket connection established');
		if (this.reconnectTimeout) {
			clearTimeout(this.reconnectTimeout);
			this.reconnectTimeout = null;
		}
	}

	private handleMessage(event: MessageEvent) {
		try {
			const message: ServerMessage = JSON.parse(event.data);
			if (message.type === 'gameState') {
				this.serverUpdateCallback(message.data);
			} else {
				console.warn('Received unknown message type:', message);
			}
		} catch (error) {
			console.error('Error parsing server message:', error);
		}
	}

	private handleError(error: Event) {
		console.error('WebSocket error:', error);
	}

	private handleClose(event: CloseEvent) {
		console.log('WebSocket connection closed:', event.code, event.reason);
		this.scheduleReconnect();
	}

	private scheduleReconnect() {
		if (!this.reconnectTimeout) {
			this.reconnectTimeout = setTimeout(() => {
				console.log('Attempting to reconnect...');
				this.connect();
			}, this.reconnectInterval);
		}
	}

	sendUpdate(update: ClientMessage) {
		if (this.socket && this.socket.readyState === WebSocket.OPEN) {
			this.socket.send(JSON.stringify(update));
		} else {
			console.warn('Cannot send update: WebSocket is not open');
		}
	}

	disconnect() {
		if (this.socket) {
			this.socket.close();
		}
		if (this.reconnectTimeout) {
			clearTimeout(this.reconnectTimeout);
			this.reconnectTimeout = null;
		}
	}
}
