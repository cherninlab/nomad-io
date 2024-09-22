import * as PIXI from 'pixi.js';

export class World {
	public container: PIXI.Container;

	constructor(private app: PIXI.Application) {
		this.container = new PIXI.Container();
	}

	initialize() {
		const background = new PIXI.Graphics();
		background.beginFill(0x3b3838);
		background.drawRect(0, 0, this.app.screen.width * 2, this.app.screen.height * 2);
		background.endFill();
		this.container.addChild(background);

		this.container.x = -this.app.screen.width / 2;
		this.container.y = -this.app.screen.height / 2;
	}

	update(playerPosition: PIXI.Point) {
		this.container.x = -playerPosition.x + this.app.screen.width / 2;
		this.container.y = -playerPosition.y + this.app.screen.height / 2;
	}
}
