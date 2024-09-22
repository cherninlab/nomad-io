import * as PIXI from 'pixi.js';
import { Player } from './player';
import { EnemyState } from './types';

export class Enemy {
	public sprite: PIXI.Sprite;
	public velocity: PIXI.Point;
	public health: number;

	constructor(sprite: PIXI.Sprite) {
		this.sprite = sprite;
		this.velocity = new PIXI.Point(0, 0);
		this.health = 100; // Default health
	}
}

export class EnemyManager {
	public container: PIXI.Container;
	private enemies: Enemy[];

	constructor(private app: PIXI.Application) {
		this.container = new PIXI.Container();
		this.enemies = [];
	}

	initialize() {
		for (let i = 0; i < 10; i++) {
			const sprite = PIXI.Sprite.from('assets/enemy.png');
			sprite.x = Math.random() * this.app.screen.width * 2 - this.app.screen.width;
			sprite.y = Math.random() * this.app.screen.height * 2 - this.app.screen.height;
			const enemy = new Enemy(sprite);
			this.enemies.push(enemy);
			this.container.addChild(sprite);
		}
	}

	update(player: Player) {
		const maxSpeed = 1.5;

		this.enemies.forEach(enemy => {
			const sprite = enemy.sprite;

			// Move towards the player
			const dx = player.position.x - sprite.x;
			const dy = player.position.y - sprite.y;
			const distance = Math.sqrt(dx * dx + dy * dy);

			// Simple AI: move towards the player
			enemy.velocity.x += (dx / distance) * 0.1;
			enemy.velocity.y += (dy / distance) * 0.1;

			// Limit speed
			const speed = Math.sqrt(
				enemy.velocity.x * enemy.velocity.x + enemy.velocity.y * enemy.velocity.y
			);
			if (speed > maxSpeed) {
				enemy.velocity.x = (enemy.velocity.x / speed) * maxSpeed;
				enemy.velocity.y = (enemy.velocity.y / speed) * maxSpeed;
			}

			// Update position
			sprite.x += enemy.velocity.x;
			sprite.y += enemy.velocity.y;
		});
	}

	checkCollisions(player: Player) {
		for (let i = this.enemies.length - 1; i >= 0; i--) {
			const enemy = this.enemies[i];
			if (this.checkCollision(player.sprite, enemy.sprite)) {
				const collisionResult = player.collideWithEnemy(new PIXI.Point(enemy.sprite.x, enemy.sprite.y));

				switch (collisionResult) {
					case 'kill':
						// Remove the enemy
						this.container.removeChild(enemy.sprite);
						this.enemies.splice(i, 1);
						console.log('Enemy killed!');
						break;
					case 'slow':
						// The player is already slowed down in the Player class
						console.log('Player slowed down!');
						break;
					case 'none':
						// No action needed
						break;
				}
			}
		}
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
		enemyStates.forEach((state, index) => {
			const enemy = this.enemies[index];
			if (enemy) {
				enemy.sprite.x = state.position.x;
				enemy.sprite.y = state.position.y;
			}
		});
	}
}
