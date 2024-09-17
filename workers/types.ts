export interface Player {
	id: string;
	name: string;
	position: { x: number; y: number };
	resources: number;
	health: number;
	spriteUrl: string;
}

export interface Resource {
	id: string;
	position: { x: number; y: number };
	amount: number;
	type: 'scrap' | 'fuel';
}

export interface Enemy {
	id: string;
	position: { x: number; y: number };
	health: number;
	type: 'raider' | 'mutant';
}

export interface GameState {
	players: { [id: string]: Player };
	resources: Resource[];
	enemies: Enemy[];
}

export type MessageType =
	| { type: 'updatePlayer'; player: Player }
	| { type: 'collectResource'; playerId: string; resourceId: string }
	| { type: 'spawnEnemy'; enemy: Enemy }
	| { type: 'playerJoin'; player: Player }
	| { type: 'playerLeave'; playerId: string };

export interface ClientMessage {
	type: MessageType['type'];
	data: any;
}

export interface ServerMessage {
	type: 'gameState';
	data: GameState;
}
