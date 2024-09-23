import * as PIXI from 'pixi.js';
import { Player } from './player';
import { World } from './world';
import { ResourceManager } from './resourceManager';
import { EnemyManager } from './enemyManager';
import { NetworkManager } from './networkManager';
import { GameState, PlayerState, ClientMessage } from './types';
import { UI } from './ui';
import { HUD } from './hud';
import { Pane } from 'tweakpane';
import { Ticker } from 'pixi.js';

export class Game {
	private app: PIXI.Application;
	private player!: Player;
	private otherPlayers: Map<string, Player> = new Map();
	private world!: World;
	private resourceManager!: ResourceManager;
	private enemyManager!: EnemyManager;
	private networkManager!: NetworkManager;
	private ui!: UI;
	private hud!: HUD;
	private camera!: PIXI.Container;
	private gameContainer!: PIXI.Container;

	constructor() {
		this.app = new PIXI.Application();
	}

	async init(options: Partial<PIXI.ApplicationOptions> = {}) {
		await this.app.init({
			width: window.innerWidth,
			height: window.innerHeight,
			backgroundColor: 0x87ceeb, // Sky blue background
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

		this.initializeGame(playerName, playerSprite);
		this.setupKeyboardControls();
		this.app.ticker.add(this.gameLoop, this);
		this.networkManager.connect();
	}

	private initializeGame(playerName: string, playerSprite: string) {
		this.gameContainer = new PIXI.Container();
		this.camera = new PIXI.Container();
		this.gameContainer.addChild(this.camera);
		this.app.stage.addChild(this.gameContainer);

		this.world = new World(this.app);
		this.world.initialize();
		this.camera.addChild(this.world.container);

		this.player = new Player(this.app, playerName, playerSprite);
		this.player.initialize();
		this.camera.addChild(this.player.sprite);

		this.resourceManager = new ResourceManager(this.app);
		this.resourceManager.initialize();
		this.camera.addChild(this.resourceManager.container);

		this.enemyManager = new EnemyManager(this.app);
		this.enemyManager.initialize();
		this.camera.addChild(this.enemyManager.container);

		this.hud = new HUD(this.player);
		this.app.stage.addChild(this.hud.container);

		this.networkManager = new NetworkManager(this.handleServerUpdate.bind(this));

		// Set up Tweakpane
		this.setupTweakpane();

		// Center the camera on the player
		this.centerCamera();
	}

	private setupTweakpane() {
		const pane = new Pane();

		const folder = pane.addFolder({
			title: 'Car Dynamics',
			expanded: true,
		});

		folder.addBinding(this.player, 'acceleration', { min: 0, max: 1 });
		folder.addBinding(this.player, 'deceleration', { min: 0, max: 1 });
		folder.addBinding(this.player, 'friction', { min: 0, max: 1 });
		folder.addBinding(this.player, 'maxSpeed', { min: 0, max: 20 });
		folder.addBinding(this.player, 'rotationSpeed', { min: 0, max: 0.2 });
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
			const turningLeft = keys['a'] || keys['arrowleft'];
			const turningRight = keys['d'] || keys['arrowright'];
			const movingForward = keys['w'] || keys['arrowup'];
			const movingBackward = keys['s'] || keys['arrowdown'];

			this.player.control(turningLeft, turningRight, movingForward, movingBackward);
		});
	}

	private gameLoop(ticker: Ticker) {
		const deltaTime = ticker.deltaTime;
		// Update local player
		this.player.update(deltaTime);

		// Update game objects
		this.world.update(deltaTime);
		this.resourceManager.update(deltaTime);
		this.enemyManager.update(this.player, deltaTime);
		this.checkCollisions();

		// Update other players
		this.otherPlayers.forEach(player => player.update(deltaTime));

		// Update HUD elements
		this.hud.update();

		// Center the camera on the player
		this.centerCamera();

		// Send network updates
		const updateMessage: ClientMessage = {
			type: 'updatePlayer',
			data: this.player.getState(),
		};
		this.networkManager.sendUpdate(updateMessage);
	}

	private centerCamera() {
		this.camera.position.set(
			-this.player.position.x + this.app.screen.width / 2,
			-this.player.position.y + this.app.screen.height / 2
		);
	}

	private checkCollisions() {
		this.resourceManager.checkCollisions(this.player);
		this.enemyManager.checkCollisions(this.player);
	}

	private handleServerUpdate(gameState: GameState) {
		if (gameState && gameState.players) {
			Object.entries(gameState.players).forEach(([id, playerState]) => {
				if (id === this.player.id) {
					// Update local player's non-position properties
					this.player.updateFromServer(playerState);
				} else {
					this.updateOrCreateOtherPlayer(playerState);
				}
			});

			// Remove players that are no longer in the game state
			this.otherPlayers.forEach((_, id) => {
				if (!gameState.players[id]) {
					this.removeOtherPlayer(id);
				}
			});
		}

		if (gameState && gameState.resources) {
			this.resourceManager.updateFromServer(gameState.resources);
		}

		if (gameState && gameState.enemies) {
			this.enemyManager.updateFromServer(gameState.enemies);
		}
	}

	private updateOrCreateOtherPlayer(playerState: PlayerState) {
		let otherPlayer = this.otherPlayers.get(playerState.id);
		if (!otherPlayer) {
			otherPlayer = new Player(this.app, playerState.name, playerState.spriteUrl, false);
			otherPlayer.initialize();
			this.otherPlayers.set(playerState.id, otherPlayer);
			this.camera.addChild(otherPlayer.sprite);
		}
		otherPlayer.updateFromServer(playerState);
	}

	private removeOtherPlayer(playerId: string) {
		const player = this.otherPlayers.get(playerId);
		if (player) {
			this.camera.removeChild(player.sprite);
			this.otherPlayers.delete(playerId);
		}
	}

	public resize() {
		this.app.renderer.resize(window.innerWidth, window.innerHeight);
		this.centerCamera();
	}
}
