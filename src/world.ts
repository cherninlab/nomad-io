import * as PIXI from 'pixi.js';

export class World {
	public container: PIXI.Container;

	constructor(private app: PIXI.Application) {
		this.container = new PIXI.Container();
	}

	initialize() {
		const background = new PIXI.Graphics();
		background.beginFill(0x3b3838);
		background.drawRect(
			-this.app.screen.width,
			-this.app.screen.height,
			this.app.screen.width * 2,
			this.app.screen.height * 2
		);
		background.endFill();
		this.container.addChild(background);
	}

	update() {
	}
}
