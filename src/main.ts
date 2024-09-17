import './style.css';
import { Game } from './game';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div id="gameContainer"></div>
`;

async function startGame() {
	const game = new Game();
	await game.init();
}

startGame().catch(console.error);
