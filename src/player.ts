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
	public isStunned: boolean;
	private stunDuration: number;
	private stunTimer: number;

	private velocity: number;
	private acceleration: number;
	private deceleration: number;
	private friction: number;
	private maxSpeed: number;
	private rotationSpeed: number;

	constructor(
		private app: PIXI.Application,
		name: string,
		spriteUrl: string,
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
		this.isStunned = false;
		this.stunDuration = 30; // Number of frames to stay stunned
		this.stunTimer = 0;

		// Movement properties
		this.velocity = 0;
		this.acceleration = 0.2;
		this.deceleration = 0.1;
		this.friction = 0.05;
		this.maxSpeed = 5;
		this.rotationSpeed = 0.05;
	}

	initialize() {
		this.sprite.anchor.set(0.5);
		this.respawn();
	}

	control(
		turningLeft: boolean,
		turningRight: boolean,
		movingForward: boolean,
		movingBackward: boolean
	) {
		if (this.isStunned) {
			this.stunTimer++;
			if (this.stunTimer >= this.stunDuration) {
				this.isStunned = false;
				this.stunTimer = 0;
			}
			return; // Skip control while stunned
		}

		// Handle rotation
		if (turningLeft) {
			this.angle -= this.rotationSpeed;
		}
		if (turningRight) {
			this.angle += this.rotationSpeed;
		}

		// Update velocity
		if (movingForward) {
			this.velocity += this.acceleration;
		} else if (movingBackward) {
			this.velocity -= this.deceleration;
		} else {
			// Apply friction
			if (this.velocity > 0) {
				this.velocity -= this.friction;
				if (this.velocity < 0) this.velocity = 0;
			} else {
				this.velocity += this.friction;
				if (this.velocity > 0) this.velocity = 0;
			}
		}

		// Limit speed
		if (this.velocity > this.maxSpeed) this.velocity = this.maxSpeed;
		if (this.velocity < -this.maxSpeed / 2) this.velocity = -this.maxSpeed / 2;

		// Update position
		this.position.x += Math.sin(this.angle) * this.velocity;
		this.position.y -= Math.cos(this.angle) * this.velocity;
		this.sprite.position.copyFrom(this.position);

		// Rotate the sprite to match the angle
		this.sprite.rotation = this.angle;
	}

	takeDamage(amount: number) {
		this.health -= amount;
		if (this.health <= 0) {
			this.health = 0;
			// Handle player death (e.g., respawn or game over)
			this.respawn();
		}
	}

	collideWithEnemy() {
		// Calculate damage based on speed
		const impactSpeed = Math.abs(this.velocity);
		const damage = impactSpeed * 10; // Adjust multiplier as needed
		this.takeDamage(damage);

		// Stop the car
		this.velocity = 0;
		this.isStunned = true;
		this.stunTimer = 0;

		// Enemy also deals damage to the player
		// Optional: You can implement enemy damage here if desired

		// Enemy stays where it was hit (no further action needed)
	}

	updateFromServer(playerState: PlayerState) {
		this.position.set(playerState.position.x, playerState.position.y);
		this.sprite.position.copyFrom(this.position);
		this.resources = playerState.resources;
		this.health = playerState.health;
	}

	respawn() {
		this.position.set(
			Math.random() * this.app.renderer.width * 2,
			Math.random() * this.app.renderer.height * 2
		);
		this.sprite.position.copyFrom(this.position);
		this.health = this.maxHealth;
		this.velocity = 0;
		this.isStunned = false;
	}
}
