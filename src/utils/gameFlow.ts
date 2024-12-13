import {GameState} from "../types/games";

export const advanceTurn = (state: GameState): number => {
    if (!state.players || state.players.length === 0) {
        throw new Error("Cannot advance turn: No players in the game state.");
    }

    if (state.currentTurn < 0 || state.currentTurn >= state.players.length) {
        console.error(
            `Invalid currentTurn: ${state.currentTurn}. Resetting to 0.`
        );
        state.currentTurn = 0;
    }

    if (state.direction !== 1 && state.direction !== -1) {
        console.error(`Invalid direction: ${state.direction}. Defaulting to 1.`);
        state.direction = 1;
    }

    const nextTurn = (state.currentTurn + state.direction + state.players.length) % state.players.length;
    state.currentTurn = nextTurn;

    console.log(`Advanced turn to: ${nextTurn}`);
    return nextTurn;
};

export const checkWinCondition = (state: GameState): boolean => {
    const currentPlayer = state.players[state.currentTurn];
    return currentPlayer.hand.length === 0;
};
