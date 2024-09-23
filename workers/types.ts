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

export type ClientMessage =
	| { type: 'updatePlayer'; data: Player }
	| { type: 'collectResource'; data: { playerId: string; resourceId: string } }
	| { type: 'spawnEnemy'; data: Enemy }
	| { type: 'playerJoin'; data: Player }
	| { type: 'playerLeave'; data: string };

export interface ServerMessage {
	type: 'gameState';
	data: GameState;
}
