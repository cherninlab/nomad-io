import * as PIXI from 'pixi.js';
import { PlayerState } from './types';

export class Player {
	public id: string;
	public name: string;
	public sprite: PIXI.Sprite;
	public position: PIXI.Point;
	public resources: number;
	public health: number;
	public maxHealth: number;
	public spriteUrl: string;
	public angle: number;
	public velocity: PIXI.Point;
	public acceleration: number;
	public deceleration: number;
	public friction: number;
	public maxSpeed: number;
	public rotationSpeed: number;
	public slowdownFactor: number;

	private isLocalPlayer: boolean;

	constructor(
		private app: PIXI.Application,
		name: string,
		spriteUrl: string,
		isLocalPlayer: boolean = true
	) {
		this.id = Math.random().toString(36).substr(2, 9);
		this.name = name;
		this.spriteUrl = spriteUrl;
		this.sprite = PIXI.Sprite.from(spriteUrl);
		this.position = new PIXI.Point(0, 0);
		this.resources = 0;
		this.health = 100;
		this.maxHealth = 100;
		this.angle = 0;

		// Movement properties
		this.velocity = new PIXI.Point(0, 0);
		this.acceleration = 0.2;
		this.deceleration = 0.1;
		this.friction = 0.05;
		this.maxSpeed = 5;
		this.rotationSpeed = 0.05;
		this.slowdownFactor = 1;

		this.isLocalPlayer = isLocalPlayer;
	}

	initialize() {
		this.sprite.anchor.set(0.5);
		this.respawn();
	}

	update(delta: number) {
		if (this.isLocalPlayer) {
			// Apply velocity to position
			this.position.x += this.velocity.x * delta;
			this.position.y += this.velocity.y * delta;
		}

		// Update the sprite position and rotation
		this.sprite.position.copyFrom(this.position);
		this.sprite.rotation = this.angle;
	}

	control(
		turningLeft: boolean,
		turningRight: boolean,
		movingForward: boolean,
		movingBackward: boolean
	) {
		if (!this.isLocalPlayer) return;

		// Handle rotation
		if (turningLeft) {
			this.angle -= this.rotationSpeed;
		}
		if (turningRight) {
			this.angle += this.rotationSpeed;
		}

		// Update velocity
		const direction = new PIXI.Point(Math.sin(this.angle), -Math.cos(this.angle));
		if (movingForward) {
			this.velocity.x += direction.x * this.acceleration;
			this.velocity.y += direction.y * this.acceleration;
		} else if (movingBackward) {
			this.velocity.x -= direction.x * this.deceleration;
			this.velocity.y -= direction.y * this.deceleration;
		} else {
			// Apply friction
			this.velocity.x *= 1 - this.friction;
			this.velocity.y *= 1 - this.friction;
		}

		// Limit speed
		const speed = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2);
		if (speed > this.maxSpeed) {
			this.velocity.x = (this.velocity.x / speed) * this.maxSpeed;
			this.velocity.y = (this.velocity.y / speed) * this.maxSpeed;
		}

		// Apply slowdown factor
		this.velocity.x *= this.slowdownFactor;
		this.velocity.y *= this.slowdownFactor;

		// Reset slowdown factor for next frame
		this.slowdownFactor = 1;
	}

	collideWithEnemy(enemyPosition: PIXI.Point): 'kill' | 'slow' | 'none' {
		const dx = enemyPosition.x - this.position.x;
		const dy = enemyPosition.y - this.position.y;
		const distance = Math.sqrt(dx * dx + dy * dy);

		// Normalize the distance vector
		const distanceVectorNormalized = new PIXI.Point(dx / distance, dy / distance);

		// Calculate the dot product of the velocity vector and the distance vector
		const dotProduct =
			this.velocity.x * distanceVectorNormalized.x + this.velocity.y * distanceVectorNormalized.y;

		// Calculate the angle between the player's direction and the enemy
		const playerDirection = new PIXI.Point(Math.sin(this.angle), -Math.cos(this.angle));
		const collisionAngle = Math.acos(
			playerDirection.x * distanceVectorNormalized.x +
				playerDirection.y * distanceVectorNormalized.y
		);

		if (dotProduct > 0) {
			// Moving towards the enemy
			if (collisionAngle < Math.PI / 4) {
				// Head-on collision, slow down
				this.slowdownFactor = 0.5;
				return 'slow';
			} else {
				// Side or back collision, kill the enemy
				return 'kill';
			}
		} else {
			// Moving away from the enemy
			return 'none';
		}
	}

	takeDamage(amount: number) {
		this.health -= amount;
		if (this.health <= 0) {
			this.health = 0;
			this.respawn();
		}
	}

	updateFromServer(playerState: PlayerState) {
		if (!this.isLocalPlayer) {
			this.position.set(playerState.position.x, playerState.position.y);
			this.angle = playerState.angle;
		}
		this.resources = playerState.resources;
		this.health = playerState.health;
		this.spriteUrl = playerState.spriteUrl;

		// Update the sprite if the spriteUrl has changed
		if (this.sprite.texture.baseTexture.resource.url !== this.spriteUrl) {
			this.sprite.texture = PIXI.Texture.from(this.spriteUrl);
		}
	}

	respawn() {
		this.position.set(
			Math.random() * this.app.screen.width,
			Math.random() * this.app.screen.height
		);
		this.sprite.position.copyFrom(this.position);
		this.health = this.maxHealth;
		this.velocity.set(0, 0);
		this.angle = 0;
		this.resources = 0;
	}

	getState(): PlayerState {
		return {
			id: this.id,
			name: this.name,
			position: { x: this.position.x, y: this.position.y },
			angle: this.angle,
			resources: this.resources,
			health: this.health,
			spriteUrl: this.spriteUrl,
		};
	}
}
