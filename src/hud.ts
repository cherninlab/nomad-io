// src/hud.ts
import * as PIXI from 'pixi.js';
import { Player } from './player';

export class HUD {
	public container: PIXI.Container;
	private healthBar: PIXI.Graphics;
	private player: Player;

	constructor(player: Player) {
		this.container = new PIXI.Container();
		this.player = player;

		// Create health bar
		this.healthBar = new PIXI.Graphics();
		this.container.addChild(this.healthBar);
	}

	update() {
		// Update health bar
		const healthPercentage = this.player.health / this.player.maxHealth;
		this.healthBar.clear();

		// Background bar (grey)
		this.healthBar.beginFill(0x555555);
		this.healthBar.drawRect(20, 20, 200, 20);
		this.healthBar.endFill();

		// Health bar (red)
		this.healthBar.beginFill(0xff0000);
		this.healthBar.drawRect(20, 20, 200 * healthPercentage, 20);
		this.healthBar.endFill();

		// Add border
		this.healthBar.lineStyle(2, 0xffffff);
		this.healthBar.drawRect(20, 20, 200, 20);
	}
}
