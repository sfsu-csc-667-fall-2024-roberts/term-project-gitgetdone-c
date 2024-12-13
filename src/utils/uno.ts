import {Card, GameState} from "../types/games";

export const validateCardPlay = (state: GameState, card: Card): boolean => {
    const topCard = state.discardPile[state.discardPile.length - 1];

    if (topCard.color === card.color || topCard.value === card.value) {
        return true;
    }

    if (card.value === "wild" || card.value === "wild_draw4") {
        return true;
    }

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

    if (state.chosenColor) {
        if (card.color === state.chosenColor || card.value === "wild" || card.value === "wild_draw4") {
            state.chosenColor = null;
            return true;
        }
        return false;
    }

    return false;
};
