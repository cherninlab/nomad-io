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
			sprite.x = Math.random() * this.app.screen.width * 2;
			sprite.y = Math.random() * this.app.screen.height * 2;
			const enemy = new Enemy(sprite);
			this.enemies.push(enemy);
			this.container.addChild(sprite);
		}
	}

	update(player: Player) {
		const maxSpeed = 1.5;
		const separationDistance = 30;

		this.enemies.forEach(enemy => {
			const sprite = enemy.sprite;

			// Move towards the player
			const dx = player.position.x - sprite.x;
			const dy = player.position.y - sprite.y;
			const distance = Math.sqrt(dx * dx + dy * dy);

			// Avoid getting in front of the car
			const angleToPlayer = Math.atan2(dy, dx);
			const angleDifference = Math.abs(angleToPlayer - player.angle);
			const frontAvoidanceAngle = Math.PI / 4; // 45 degrees

			if (
				angleDifference > frontAvoidanceAngle &&
				angleDifference < Math.PI * 2 - frontAvoidanceAngle
			) {
				// Move towards the player
				enemy.velocity.x += (dx / distance) * 0.1;
				enemy.velocity.y += (dy / distance) * 0.1;
			}

			// Avoid other enemies
			this.enemies.forEach(otherEnemy => {
				if (enemy !== otherEnemy) {
					const otherSprite = otherEnemy.sprite;
					const dx = sprite.x - otherSprite.x;
					const dy = sprite.y - otherSprite.y;
					const distance = Math.sqrt(dx * dx + dy * dy);
					if (distance < separationDistance && distance > 0) {
						enemy.velocity.x += (dx / distance) * 0.05;
						enemy.velocity.y += (dy / distance) * 0.05;
					}
				}
			});

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
		for (const enemy of this.enemies) {
			if (this.checkCollision(player.sprite, enemy.sprite)) {
				// Handle collision
				player.collideWithEnemy(enemy);
				// Optionally, apply damage to enemy or remove it
				// For now, enemy stays where it was hit
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
