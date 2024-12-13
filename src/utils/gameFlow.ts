import {GameState} from "../types/games";

export const advanceTurn = (state: GameState): number => {
    const nextTurn = (state.currentTurn + state.direction + state.players.length) % state.players.length;
    state.currentTurn = nextTurn;
    return nextTurn;
};

export const checkWinCondition = (state: GameState): boolean => {
    const currentPlayer = state.players[state.currentTurn];
    return currentPlayer.hand.length === 0;
};
