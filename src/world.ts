import * as PIXI from 'pixi.js';

export class World {
	public container: PIXI.Container;
	private background: PIXI.Graphics;
	public worldSize: number;

	constructor(_: PIXI.Application) {
		this.container = new PIXI.Container();
		this.background = new PIXI.Graphics();
		this.worldSize = 2000; // Adjust this value to change the size of the world
	}

	initialize() {
		this.createBackground();
		this.container.addChild(this.background);
	}

	private createBackground() {
		// Create the ground
		this.background.clear();
		this.background.setFillStyle({ color: 0x000000 }); // Light green color for the ground
		this.background.rect(
			-this.worldSize / 2,
			-this.worldSize / 2,
			this.worldSize,
			this.worldSize
		);
		this.background.fill();

		// Add a simple grid pattern
		this.background.setStrokeStyle({
			color: 0x90ee90,
			width: 1,
			alpha: 0.3
		});
		for (let i = -this.worldSize / 2; i <= this.worldSize / 2; i += 100) {
			this.background.moveTo(i, -this.worldSize / 2);
			this.background.lineTo(i, this.worldSize / 2);
			this.background.moveTo(-this.worldSize / 2, i);
			this.background.lineTo(this.worldSize / 2, i);
		}
		this.background.stroke();
	}

	update(_: number) {
		// Add any world update logic here if needed
	}

	isInBounds(x: number, y: number): boolean {
		const halfSize = this.worldSize / 2;
		return x >= -halfSize && x <= halfSize && y >= -halfSize && y <= halfSize;
	}
}
