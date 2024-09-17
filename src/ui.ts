import * as PIXI from 'pixi.js';
import { Button, Input } from '@pixi/ui';

export class UI {
	public container: PIXI.Container;
	private nameInput: Input;
	private startButton: Button;
	private playerSelectionButtons: Button[];

	constructor() {
		this.container = new PIXI.Container();

		// Initialize the name input
		this.nameInput = new Input({
			bg: PIXI.Sprite.from('assets/input-bg.png'),
			placeholder: 'Enter your name',
			textStyle: new PIXI.TextStyle({ fill: 0xffffff, fontSize: 24 }),
			padding: 10,
			maxLength: 20,
			align: 'center',
		});

		// Initialize the start button
		const startButtonSprite = PIXI.Sprite.from('assets/button.png');
		this.startButton = new Button(startButtonSprite);

		// Add text to the start button
		const startButtonText = new PIXI.Text('Start', { fill: 0xffffff, fontSize: 24 });
		startButtonText.anchor.set(0.5);
		startButtonText.position.set(startButtonSprite.width / 2, startButtonSprite.height / 2);
		startButtonSprite.addChild(startButtonText);

		this.playerSelectionButtons = [];
	}

	async init() {
		// Position the name input and start button
		this.nameInput.position.set(400, 200); // Adjust positions as needed

		// Set position on the start button's view
		this.startButton.view.position.set(400, 300);

		this.container.addChild(this.nameInput);
		this.container.addChild(this.startButton.view);

		// Initialize player selection buttons but don't add them yet
		for (let i = 1; i <= 3; i++) {
			const playerSprite = PIXI.Sprite.from(`assets/player${i}.png`);
			const button = new Button(playerSprite);

			// Set position on the button's view
			button.view.position.set(200 * i, 400); // Adjust positions as needed

			this.playerSelectionButtons.push(button);
		}
	}

	showNameInput(): Promise<string> {
		return new Promise(resolve => {
			this.startButton.onPress.connect(() => {
				resolve(this.nameInput.value);
				this.container.removeChild(this.nameInput);
				this.container.removeChild(this.startButton.view);

				// Add player selection buttons to the container
				this.playerSelectionButtons.forEach(button => {
					this.container.addChild(button.view);
				});
			});
		});
	}

	showPlayerSelection(): Promise<string> {
		return new Promise(resolve => {
			this.playerSelectionButtons.forEach((button, index) => {
				button.onPress.connect(() => {
					resolve(`assets/player${index + 1}.png`);
					this.playerSelectionButtons.forEach(b => this.container.removeChild(b.view));
				});
			});
		});
	}

	showMessage(message: string) {
		const text = new PIXI.Text(message, { fill: 0xffffff, fontSize: 24 });
		text.position.set(400, 100); // Adjust position as needed
		this.container.addChild(text);
		setTimeout(() => this.container.removeChild(text), 3000);
	}
}
