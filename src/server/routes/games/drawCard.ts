import { Router, Request, Response } from "express";
import { Games } from "../../db";
import {advanceTurn} from "../../db/utils/gameFlow";

const router = Router();

router.post(
    "/:gameId/draw-card",
    async (req: Request<{ gameId: string }, {}, { playerId: number }>, res: Response): Promise<void> => {
        const { gameId } = req.params;
        const { playerId } = req.body;

        try {
            const state = await Games.getGameState(parseInt(gameId, 10));
            const currentPlayer = state.players[state.currentTurn];

            if (currentPlayer.id !== playerId) {
                req.app.get("io").to(`game-${gameId}`).emit("error", { message: "Not your turn." });
                res.status(400).json({ success: false, message: "Not your turn." });
                return;
            }

            if (state.deck.length === 0 && state.discardPile.length <= 1) {
                req.app.get("io").to(`game-${gameId}`).emit("error", { message: "No cards left to draw!" });
                res.status(400).json({ success: false, message: "No cards left to draw!" });
                return;
            }

            if (state.deck.length === 0) {
                const reshuffleCards = state.discardPile.splice(0, state.discardPile.length - 1);
                req.app.get("io").to(`game-${gameId}`).emit("deck-reshuffled", {
                    reshuffledDeckSize: reshuffleCards.length,
                });
                state.deck = reshuffleCards.sort(() => Math.random() - 0.5); // Shuffle
            }

            const card = state.deck.pop();
            if (!card) {
                req.app.get("io").to(`game-${gameId}`).emit("error", { message: "Deck is empty even after reshuffling!" });
                res.status(400).json({ success: false, message: "Deck is empty even after reshuffling!" });
                return;
            }

            currentPlayer.hand.push(card);
            advanceTurn(state);
            const updatedState = await Games.updateGameState(parseInt(gameId, 10), state);

            req.app.get("io").to(`game-${gameId}`).emit("turn-updated", {
                currentTurn: state.currentTurn,
                playerId: state.players[state.currentTurn].id,
                currentPlayerUsername: state.players[state.currentTurn].username,
            });

            req.app.get("io").to(`game-${gameId}-${req.query.tabId}`).emit("game-state", updatedState);
            req.app.get("io").to(`game-${gameId}`).emit("game-action", { type: "card-drawn", playerId, card });

            res.status(200).json({ success: true, card });
        } catch (error) {
            console.error("Error drawing card:", error);
            req.app.get("io").to(`game-${gameId}`).emit("error", { message: "Failed to draw card." });
            res.status(500).json({ success: false, message: "Failed to draw card." });
        }
    }
);

export default router;
