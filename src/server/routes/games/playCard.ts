import { Router, Request, Response } from "express";
import { Games } from "../../db";
import {Card} from "../../../types/games";
import {advanceTurn} from "../../db/utils/gameFlow";
import {validateCardPlay} from "../../db/utils/cardValidation";

const router = Router();

router.post(
    "/:gameId/play-card",
    async (req: Request<{ gameId: string }, {}, { playerId: number; card: Card }>, res: Response): Promise<void> => {
        const { gameId } = req.params;
        const { playerId, card } = req.body;

        try {
            const state = await Games.getGameState(parseInt(gameId, 10));
            const currentPlayer = state.players[state.currentTurn];

            if (currentPlayer.id !== playerId) {
                req.app.get("io").to(`game-${gameId}`).emit("error", { message: "Not your turn." });
                res.status(400).json({ success: false, message: "Not your turn." });
                return;
            }

            if (!validateCardPlay(state, card)) {
                req.app.get("io").to(`game-${gameId}`).emit("error", {
                    message: "Invalid card play.",
                    playerId,
                    card
                });
                res.status(400).json({ success: false, message: "Invalid card play." });
                return;
            }

            if (card.value === "skip") {
                state.currentTurn = (state.currentTurn + state.direction + state.players.length) % state.players.length;
                req.app.get("io").to(`game-${gameId}`).emit("special-action", { type: "skip", playedBy: playerId });
            }

            if (card.value === "reverse") {
                state.direction *= -1;
                req.app.get("io").to(`game-${gameId}`).emit("special-action", { type: "reverse", playedBy: playerId });
            }

            if (card.value === "draw2") {
                const nextPlayerIndex = (state.currentTurn + state.direction + state.players.length) % state.players.length;
                const nextPlayer = state.players[nextPlayerIndex];
                nextPlayer.hand.push(...state.deck.splice(-2));
                req.app.get("io").to(`game-${gameId}`).emit("special-action", { type: "draw2", playedBy: playerId });
            }

            if (card.value === "wild" || card.value === "wild_draw4") {
                if (!card.color || card.color === "null") {
                    req.app.get("io").to(`game-${gameId}`).emit("error", {
                        message: "You must choose a color for the wild card.",
                        playerId,
                        card
                    });
                    res.status(400).json({ success: false, message: "You must choose a color for the wild card." });
                    return;
                }

                state.chosenColor = card.color;

                if (card.value === "wild_draw4") {
                    const nextPlayerIndex = (state.currentTurn + state.direction + state.players.length) % state.players.length;
                    const nextPlayer = state.players[nextPlayerIndex];
                    nextPlayer.hand.push(...state.deck.splice(-4));
                    req.app.get("io").to(`game-${gameId}`).emit("special-action", {
                        type: "wild_draw4",
                        playedBy: playerId,
                        chosenColor: card.color
                    });
                } else {
                    req.app.get("io").to(`game-${gameId}`).emit("special-action", {
                        type: "wild",
                        playedBy: playerId,
                        chosenColor: card.color
                    });
                }
            }

            state.discardPile.push(card);

            currentPlayer.hand = currentPlayer.hand.filter(c => {
                if (c.value === "wild" || c.value === "wild_draw4") {
                    return c.value !== card.value || (c.color !== null && c.color !== "null");
                }
                return c.color !== card.color || c.value !== card.value;
            });

            if (currentPlayer.hand.length === 0) {
                req.app.get("io").to(`game-${gameId}`).emit("game-over", {
                    winnerId: playerId,
                    winnerUsername: currentPlayer.username
                });
                await Games.finishGame(parseInt(gameId, 10));
                res.status(200).json({ success: true, message: "Player won!" });
                return;
            }

            advanceTurn(state);

            const updatedState = await Games.updateGameState(parseInt(gameId, 10), state);

            req.app.get("io").to(`game-${gameId}`).emit("turn-updated", {
                currentTurn: state.currentTurn,
                playerId: state.players[state.currentTurn].id,
                currentPlayerUsername: state.players[state.currentTurn].username,
            });
            req.app.get("io").to(`game-${gameId}`).emit("game-state", updatedState);

            res.status(200).json({ success: true, card });
        } catch (error) {
            req.app.get("io").to(`game-${gameId}`).emit("error", { message: "Failed to play card." });
            res.status(500).json({ success: false, message: "Failed to play card." });
        }
    }
);

export default router;