import * as PIXI from 'pixi.js';
import { Player } from './player';
import { World } from './world';
import { ResourceManager } from './resourceManager';
import { EnemyManager } from './enemyManager';
import { NetworkManager } from './networkManager';
import { GameState } from './types';
import { UI } from './ui';
import { HUD } from './hud';

export class Game {
	private app: PIXI.Application;
	private player!: Player;
	private world!: World;
	private resourceManager!: ResourceManager;
	private enemyManager!: EnemyManager;
	private networkManager!: NetworkManager;
	private ui!: UI;
	private hud!: HUD;

	constructor() {
		this.app = new PIXI.Application();
	}

	async init(options: Partial<PIXI.ApplicationOptions> = {}) {
		await this.app.init({
			width: window.innerWidth,
			height: window.innerHeight,
			backgroundColor: 0x000000,
			...options,
		});

		document.getElementById('gameContainer')?.appendChild(this.app.canvas);

		// Load assets
		await PIXI.Assets.load([
			'assets/player1.png',
			'assets/player2.png',
			'assets/player3.png',
			'assets/enemy.png',
			'assets/resource.png',
			'assets/input-bg.png',
			'assets/button.png',
		]);

		this.ui = new UI();
		await this.ui.init();

		// Add the UI container to the stage before awaiting input
		this.app.stage.addChild(this.ui.container);

		const playerName = await this.ui.showNameInput();
		const playerSprite = await this.ui.showPlayerSelection();

		// Remove UI container after selection
		this.app.stage.removeChild(this.ui.container);

		this.world = new World(this.app);
		this.enemyManager = new EnemyManager(this.app);
		this.player = new Player(this.app, playerName, playerSprite);
		this.resourceManager = new ResourceManager(this.app);
		this.networkManager = new NetworkManager(this.handleServerUpdate.bind(this));

		this.initializeGame();
		this.setupKeyboardControls();
		this.app.ticker.add(() => this.gameLoop());
		this.networkManager.connect();
	}

	private initializeGame() {
		this.world.initialize();
		this.player.initialize();
		this.resourceManager.initialize();
		this.enemyManager.initialize();

		this.app.stage.addChild(this.world.container);
		this.app.stage.addChild(this.resourceManager.container);
		this.app.stage.addChild(this.enemyManager.container);
		this.app.stage.addChild(this.player.sprite);

		// Initialize and add the HUD
		this.hud = new HUD(this.player);
		this.app.stage.addChild(this.hud.container);
	}

	private setupKeyboardControls() {
		const keys: { [key: string]: boolean } = {};

		window.addEventListener('keydown', e => {
			keys[e.key.toLowerCase()] = true;
		});

		window.addEventListener('keyup', e => {
			keys[e.key.toLowerCase()] = false;
		});

		this.app.ticker.add(() => {
			let turningLeft = false;
			let turningRight = false;
			let movingForward = false;
			let movingBackward = false;

			if (keys['w'] || keys['arrowup']) movingForward = true;
			if (keys['s'] || keys['arrowdown']) movingBackward = true;
			if (keys['a'] || keys['arrowleft']) turningLeft = true;
			if (keys['d'] || keys['arrowright']) turningRight = true;

			this.player.control(turningLeft, turningRight, movingForward, movingBackward);
		});
	}

	private gameLoop() {
		this.world.update(this.player.position);
		this.resourceManager.update();
		this.enemyManager.update(this.player);
		this.checkCollisions();

		// Update HUD elements
		this.hud.update();

		this.networkManager.sendUpdate({
			playerId: this.player.id,
			position: { x: this.player.position.x, y: this.player.position.y },
			resources: this.player.resources,
			health: this.player.health,
			sprite: this.player.spriteUrl,
		});
	}

	private checkCollisions() {
		this.resourceManager.checkCollisions(this.player);
		this.enemyManager.checkCollisions(this.player);
	}

	private handleServerUpdate(gameState: GameState) {
		Object.values(gameState.players).forEach(playerState => {
			if (playerState.id === this.player.id) {
				this.player.updateFromServer(playerState);
			} else {
				// Update or create other players
				// Implementation needed
			}
		});
		this.resourceManager.updateFromServer(gameState.resources);
		this.enemyManager.updateFromServer(gameState.enemies);
	}

	render() {
		this.app.render();
	}

	destroy() {
		this.app.destroy();
	}
}
