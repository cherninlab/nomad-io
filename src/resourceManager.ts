import * as PIXI from 'pixi.js';
import { Player } from './player';
import { ResourceState } from './types';

class Resource {
	public sprite: PIXI.Sprite;
	public amount: number;

	constructor(texture: PIXI.Texture, x: number, y: number, amount: number) {
		this.sprite = new PIXI.Sprite(texture);
		this.sprite.anchor.set(0.5);
		this.sprite.position.set(x, y);
		this.amount = amount;
	}
}

export class ResourceManager {
	public container: PIXI.Container;
	private resources: Map<string, Resource> = new Map();
	private resourceTexture: PIXI.Texture;

	constructor(_: PIXI.Application) {
		this.container = new PIXI.Container();
		this.resourceTexture = PIXI.Texture.from('assets/resource.png');
	}

	initialize() {
		// You can initialize some resources here if needed
		// For now, we'll leave it empty and let the server dictate resource creation
	}

	update(deltaTime: number) {
		// Add any resource-specific update logic here
		// For example, you might want to make resources glow or animate
		this.resources.forEach(resource => {
			// Example: make resources slowly rotate
			resource.sprite.rotation += 0.01 * deltaTime;
		});
	}

	checkCollisions(player: Player) {
		this.resources.forEach((resource, id) => {
			if (this.checkCollision(player.sprite, resource.sprite)) {
				player.resources += resource.amount;
				this.removeResource(id);
				console.log(`Player collected resource! Total: ${player.resources}`);
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

	updateFromServer(resourceStates: ResourceState[]) {
		const currentResourceIds = new Set(this.resources.keys());

		resourceStates.forEach(state => {
			let resource = this.resources.get(state.id);
			if (resource) {
				// Update existing resource
				resource.sprite.position.set(state.position.x, state.position.y);
				resource.amount = state.amount;
			} else {
				// Create new resource
				resource = new Resource(
					this.resourceTexture,
					state.position.x,
					state.position.y,
					state.amount
				);
				this.resources.set(state.id, resource);
				this.container.addChild(resource.sprite);
			}
			currentResourceIds.delete(state.id);
		});

		// Remove resources that are no longer in the server state
		currentResourceIds.forEach(id => this.removeResource(id));
	}

	private removeResource(id: string) {
		const resource = this.resources.get(id);
		if (resource) {
			this.container.removeChild(resource.sprite);
			this.resources.delete(id);
		}
	}
}
