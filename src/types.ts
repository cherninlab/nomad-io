export interface Position {
	x: number;
	y: number;
}

export interface PlayerState {
	id: string;
	name: string;
	position: Position;
	angle: number;
	resources: number;
	health: number;
	spriteUrl: string;
}

export interface ResourceState {
	id: string;
	position: Position;
	amount: number;
	type: 'scrap' | 'fuel';
}

export interface EnemyState {
	id: string;
	position: Position;
	health: number;
	type: 'raider' | 'mutant';
}

export interface GameState {
	players: { [id: string]: PlayerState };
	resources: ResourceState[];
	enemies: EnemyState[];
}

export type ClientMessage =
	| { type: 'updatePlayer'; data: PlayerState }
	| { type: 'collectResource'; data: { playerId: string; resourceId: string } }
	| { type: 'spawnEnemy'; data: EnemyState }
	| { type: 'playerJoin'; data: PlayerState }
	| { type: 'playerLeave'; data: string };

export interface ServerMessage {
	type: 'gameState';
	data: GameState;
}

export interface InputState {
	turningLeft: boolean;
	turningRight: boolean;
	movingForward: boolean;
	movingBackward: boolean;
}

export interface CollisionResult {
	type: 'kill' | 'slow' | 'none';
}

export interface GameOptions {
	worldWidth: number;
	worldHeight: number;
	maxPlayers: number;
	maxResources: number;
	maxEnemies: number;
}

export interface PlayerStats {
	kills: number;
	deaths: number;
	resourcesCollected: number;
}
