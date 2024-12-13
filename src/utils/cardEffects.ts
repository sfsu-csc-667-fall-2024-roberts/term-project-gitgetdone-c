import { GameState, Card } from "../types/games";

export const applyCardEffects = (state: GameState, card: Card): void => {
    if (card.value === "skip") {
        state.currentTurn = (state.currentTurn + state.direction + state.players.length) % state.players.length;
    }

    if (card.value === "reverse") {
        state.direction *= -1;
    }

    if (card.value === "draw2") {
        const nextPlayerIndex = (state.currentTurn + state.direction + state.players.length) % state.players.length;
        const nextPlayer = state.players[nextPlayerIndex];
        nextPlayer.hand.push(...state.deck.splice(-2));
    }

    if (card.value === "wild_draw4") {
        const nextPlayerIndex = (state.currentTurn + state.direction + state.players.length) % state.players.length;
        const nextPlayer = state.players[nextPlayerIndex];
        nextPlayer.hand.push(...state.deck.splice(-4));
    }

    if (card.value === "wild" || card.value === "wild_draw4") {
        state.chosenColor = card.color;
    } else {
        state.chosenColor = null;
    }
};
