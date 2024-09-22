import * as PIXI from 'pixi.js';
import { Player } from './player';
import { ResourceState } from './types';

export class ResourceManager {
	public container: PIXI.Container;
	private resources: PIXI.Sprite[];

	constructor(private app: PIXI.Application) {
		this.container = new PIXI.Container();
		this.resources = [];
	}

	initialize() {
		for (let i = 0; i < 100; i++) {
			const resource = PIXI.Sprite.from('assets/resource.png');
			resource.x = Math.random() * this.app.screen.width * 2 - this.app.screen.width;
			resource.y = Math.random() * this.app.screen.height * 2 - this.app.screen.height;
			this.resources.push(resource);
			this.container.addChild(resource);
		}
	}

	update() {
		// Add any resource-specific update logic here
	}

	checkCollisions(player: Player) {
		for (let i = this.resources.length - 1; i >= 0; i--) {
			const resource = this.resources[i];
			if (this.checkCollision(player.sprite, resource)) {
				player.resources++;
				this.container.removeChild(resource);
				this.resources.splice(i, 1);
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

	updateFromServer(resourceStates: ResourceState[] = []) {
		// Update resource positions based on server state
		resourceStates.forEach((state, index) => {
			if (this.resources[index]) {
				this.resources[index].x = state.position.x;
				this.resources[index].y = state.position.y;
			}
		});
	}
}
