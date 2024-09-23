import { GameState, ClientMessage, ServerMessage } from './types';

export class GameStateDO {
	state: DurableObjectState;
	gameState: GameState;
	sessions: WebSocket[];

	constructor(state: DurableObjectState) {
		this.state = state;
		this.gameState = { players: {}, resources: [], enemies: [] };
		this.sessions = [];
	}

	async fetch(request: Request) {
		const upgradeHeader = request.headers.get('Upgrade');
		if (!upgradeHeader || upgradeHeader !== 'websocket') {
			return new Response('Expected Upgrade: websocket', { status: 426 });
		}

		const [client, server] = Object.values(new WebSocketPair());

		await this.handleSession(server);

		return new Response(null, {
			status: 101,
			webSocket: client,
		});
	}

	async handleSession(webSocket: WebSocket) {
		(webSocket as any).accept();
		this.sessions.push(webSocket);

		webSocket.addEventListener('message', async (msg) => {
			try {
				const data = JSON.parse(msg.data as string) as ClientMessage;
				await this.handleMessage(webSocket, data);
			} catch (error) {
				console.error('Error handling message:', error);
			}
		});

		webSocket.addEventListener('close', () => {
			this.sessions = this.sessions.filter(session => session !== webSocket);
		});

		// Send initial game state
		this.sendGameState(webSocket);
	}

	async handleMessage(_: WebSocket, message: ClientMessage) {
		switch (message.type) {
			case 'updatePlayer':
				this.gameState.players[message.data.id] = message.data;
				break;
			case 'collectResource':
				this.collectResource(message.data.playerId, message.data.resourceId);
				break;
			case 'spawnEnemy':
				this.gameState.enemies.push(message.data);
				break;
			case 'playerJoin':
				this.gameState.players[message.data.id] = message.data;
				break;
			case 'playerLeave':
				delete this.gameState.players[message.data];
				break;
		}

		// Broadcast updated game state to all connected clients
		this.broadcastGameState();
	}

	collectResource(playerId: string, resourceId: string) {
		const resourceIndex = this.gameState.resources.findIndex(r => r.id === resourceId);
		if (resourceIndex !== -1) {
			const resource = this.gameState.resources[resourceIndex];
			const player = this.gameState.players[playerId];
			if (player) {
				player.resources += resource.amount;
				this.gameState.resources.splice(resourceIndex, 1);
			}
		}
	}

	sendGameState(webSocket: WebSocket) {
		const message: ServerMessage = {
			type: 'gameState',
			data: this.gameState
		};
		webSocket.send(JSON.stringify(message));
	}

	broadcastGameState() {
		const message: ServerMessage = {
			type: 'gameState',
			data: this.gameState
		};
		this.broadcast(JSON.stringify(message));
	}

	broadcast(message: string) {
		this.sessions = this.sessions.filter(session => {
			try {
				session.send(message);
				return true;
			} catch {
				return false;
			}
		});
	}
}
