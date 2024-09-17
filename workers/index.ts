import { GameStateDO } from './gameState';

export { GameStateDO };

export interface Env {
	GAME_STATE: DurableObjectNamespace;
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		if (request.headers.get("Upgrade") !== "websocket") {
			return new Response("Expected Upgrade: websocket", { status: 426 });
		}

		const gameStateId = env.GAME_STATE.idFromName("GAME");
		const gameState = env.GAME_STATE.get(gameStateId);
		return gameState.fetch(request);
	},
};
