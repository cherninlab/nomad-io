import * as PIXI from 'pixi.js';
import { Player } from './player';
import { EnemyState } from './types';

class Enemy {
	public sprite: PIXI.Sprite;
	public velocity: PIXI.Point;
	public health: number;

	constructor(texture: PIXI.Texture, x: number, y: number) {
		this.sprite = new PIXI.Sprite(texture);
		this.sprite.anchor.set(0.5);
		this.sprite.position.set(x, y);
		this.velocity = new PIXI.Point(0, 0);
		this.health = 100;
	}

	update(deltaTime: number) {
		this.sprite.x += this.velocity.x * deltaTime;
		this.sprite.y += this.velocity.y * deltaTime;
	}
}

export class EnemyManager {
	public container: PIXI.Container;
	private enemies: Map<string, Enemy> = new Map();
	private enemyTexture: PIXI.Texture;

	constructor(_: PIXI.Application) {
		this.container = new PIXI.Container();
		this.enemyTexture = PIXI.Texture.from('assets/enemy.png');
	}

	initialize() {
		// You can initialize some enemies here if needed
		// For now, we'll leave it empty and let the server dictate enemy creation
	}

	update(player: Player, deltaTime: number) {
		this.enemies.forEach(enemy => {
			// Simple AI: move towards the player
			const dx = player.position.x - enemy.sprite.x;
			const dy = player.position.y - enemy.sprite.y;
			const distance = Math.sqrt(dx * dx + dy * dy);

			const speed = 1; // Adjust as needed
			enemy.velocity.x = (dx / distance) * speed;
			enemy.velocity.y = (dy / distance) * speed;

			enemy.update(deltaTime);
		});
	}

	checkCollisions(player: Player) {
		this.enemies.forEach((enemy, id) => {
			if (this.checkCollision(player.sprite, enemy.sprite)) {
				const collisionResult = player.collideWithEnemy(enemy.sprite.position);

				switch (collisionResult) {
					case 'kill':
						this.removeEnemy(id);
						console.log('Enemy killed!');
						break;
					case 'slow':
						console.log('Player slowed down!');
						break;
					case 'none':
						// No action needed
						break;
				}
			}
		});
	}

	private checkCollision(a: PIXI.Sprite, b: PIXI.Sprite): boolean {
		const aBox = a.getBounds();
		const bBox = b.getBounds();
		return (
			aBox.x + aBox.width > bBox.x &&
			aBox.x < bBox.x + bBox.width &&
			aBox.y + aBox.height > bBox.y &&
			aBox.y < bBox.y + bBox.height
		);
	}

	updateFromServer(enemyStates: EnemyState[]) {
		const currentEnemyIds = new Set(this.enemies.keys());

		enemyStates.forEach(state => {
			let enemy = this.enemies.get(state.id);
			if (enemy) {
				// Update existing enemy
				enemy.sprite.position.set(state.position.x, state.position.y);
				enemy.health = state.health;
			} else {
				// Create new enemy
				enemy = new Enemy(this.enemyTexture, state.position.x, state.position.y);
				this.enemies.set(state.id, enemy);
				this.container.addChild(enemy.sprite);
			}
			currentEnemyIds.delete(state.id);
		});

		// Remove enemies that are no longer in the server state
		currentEnemyIds.forEach(id => this.removeEnemy(id));
	}

	private removeEnemy(id: string) {
		const enemy = this.enemies.get(id);
		if (enemy) {
			this.container.removeChild(enemy.sprite);
			this.enemies.delete(id);
		}
	}
}
