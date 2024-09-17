export interface PlayerState {
	id: string;
	name: string;
	position: { x: number; y: number };
	resources: number;
	health: number;
	spriteUrl: string;
}

export interface ResourceState {
	id: string;
	position: { x: number; y: number };
	amount: number;
}

export interface EnemyState {
	id: string;
	position: { x: number; y: number };
	health: number;
}

export interface GameState {
	players: { [id: string]: PlayerState };
	resources: ResourceState[];
	enemies: EnemyState[];
}

export interface ServerUpdate {
	playerId: string;
	position: { x: number; y: number };
	resources: number;
	health: number;
	sprite: string;
}
