import {Card, GameState} from "../../../types/games";
import { applyCardEffects } from "./cardEffects";

export const validateCardPlay = (state: GameState, card: Card): boolean => {
    const topCard = state.discardPile[state.discardPile.length - 1];

    if ((topCard.value === "wild" || topCard.value === "wild_draw4") && state.chosenColor) {
        if (card.color === state.chosenColor || card.value === "wild" || card.value === "wild_draw4") {
            applyCardEffects(state, card);
            return true;
        }
        return false;
    }

    if (topCard.color === card.color || topCard.value === card.value) {
        applyCardEffects(state, card);
        return true;
    }

    if (card.value === "wild" || card.value === "wild_draw4") {
        applyCardEffects(state, card);
        return true;
    }

    return false;
};