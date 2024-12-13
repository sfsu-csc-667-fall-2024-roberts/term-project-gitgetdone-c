import express from "express";
import checkAuthentication from "../middleware/check-authentication";
import chatMiddleware from "../middleware/chat";
import {Games} from "../db";
import { Request, Response, Router } from "express";
import {Card} from "../../types/games";
import { validateCardPlay } from "../../utils/uno";
import {advanceTurn, checkWinCondition} from "../../utils/gameFlow";
const router = Router();

router.post("/do-a-thing/:gameId", (request, response) => {
    const {gameId} = request.params;

    response.send(`Did a thing for game ${gameId}`);

    request.app.get("io").to(`game-${gameId}`).emit("thing", {thing:"thing", ts:Date.now()});
});

router.post("/create", async (request, response) => {
    // @ts-ignore
    const {id: user_id} = request.session.user;
    const game = await Games.create(user_id);

    request.app.get("io").emit("game-created", game);

    response.redirect(`/games/${game.id}`);
});

router.post("/join/:gameId", async (request, response) => {
    // @ts-expect-error TODO update session to include user id
    const {id: user_id} = request.session.user;
    const {gameId} = request.params;
    const game_id = parseInt(gameId, 10);

    try {
        const userInGame = await Games.isUserInGame(user_id, game_id);
        if (userInGame) {
            return response.redirect(`/games/${gameId}`);
        }

        const gameInfo = await Games.getGameInfo(game_id);

        if (!gameInfo) {
            return response.redirect("/lobby?error=game-not-found");
        }

        const players = parseInt(gameInfo.players, 10);
        const maxPlayers = parseInt(gameInfo.player_count, 10);

        if (players >= maxPlayers) {
            return response.redirect("/lobby?error=game-full");
        }

        const game = await Games.join(user_id, game_id);
        game.players = 1;

        request.app.get("io").emit("game-updated", game);

        response.redirect(`/games/${gameId}`);
    } catch (error) {
        console.error("Error joining game:", error);
        return response.redirect("/lobby?error=unknown-error");
}
});

router.get("/:gameId", checkAuthentication, chatMiddleware, async (request, response) => {
    const{ gameId } = request.params;
    const user = response.locals.user;

    try {
        const state = await Games.getGameState(parseInt(gameId, 10));
        //console.log("Fetched Game State:", state);

        if (!state) {
            return response.redirect("/lobby?error=game-not-found");
        }

        response.render("games", {
            title: `Game ${gameId}`,
            gameId: parseInt(gameId, 10),
            gameState: state,
            currentPlayerId: user.id,
            roomId: response.locals.roomId,
        });
    } catch (error) {
        console.error("Error fetching game state:", error);
        response.redirect("/lobby?error=failed-to-load-game");
    }
});

router.get("/:gameId/state", async (request: Request<{ gameId: string }>, _: Response) => {
        const { gameId } = request.params;

        try {
            const state = await Games.getGameState(parseInt(gameId, 10));

            if (!state) {
                request.app.get("io").to(`game-${gameId}`).emit("error", { message: "Game state not found." });
                return;
            }

            request.app.get("io").to(`game-${gameId}`).emit("game-state", state);
        } catch (error) {
            console.error("Error fetching game state:", error);
            request.app.get("io").to(`game-${gameId}`).emit("error", { message: "Failed to fetch game state." });
        }
    }
);


router.put("/:gameId/state", async (request, response) => {
    const { gameId } = request.params;
    const { state } = request.body;

    try {
        const updatedState = await Games.updateGameState(parseInt(gameId, 10), state);

        request.app.get("io").to(`game-${gameId}`).emit("game-state-updated", updatedState);

        response.status(200).json(updatedState);
    } catch (error) {
        console.error("Error updating game state:", error);
        response.status(500).json({ error: "Failed to update game state." });
    }
});

router.post(
    "/:gameId/play-card",
    async (req: Request<{ gameId: string }, {}, { playerId: number; card: Card }>, res: Response): Promise<void> => {
        const { gameId } = req.params;
        const { playerId, card } = req.body;
        console.log("In play-card route");

        try {
            const state = await Games.getGameState(parseInt(gameId, 10));
            const currentPlayer = state.players[state.currentTurn];

            console.log("Received play-card request:", { playerId, card });

            if (currentPlayer.id !== playerId) {
                console.error("Not the current player's turn.");
                req.app.get("io").to(`game-${gameId}`).emit("error", { message: "Not your turn." });
                res.status(400).json({ success: false, message: "Not your turn." });
                return;
            }

            if (!validateCardPlay(state, card)) {
                console.error("Invalid card play:", card);
                req.app.get("io").to(`game-${gameId}`).emit("error", {
                    message: "Invalid card play.",
                    playerId,
                    card
                });
                console.log("Emitted error event for invalid card play.");
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
                    console.error("Wild card must have a chosen color.");
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

            console.log("Before card removal:", currentPlayer.hand);
            currentPlayer.hand = currentPlayer.hand.filter(c => {
                if (c.value === "wild" || c.value === "wild_draw4") {
                    return c.value !== card.value || (c.color !== null && c.color !== "null");
                }
                return c.color !== card.color || c.value !== card.value;
            });
            console.log("After card removal:", currentPlayer.hand);

            if (currentPlayer.hand.length === 0) {
                req.app.get("io").to(`game-${gameId}`).emit("game-over", { winnerId: playerId });
                await Games.finishGame(parseInt(gameId, 10));
                res.status(200).json({ success: true, message: "Player won!" });
                return;
            }

            advanceTurn(state);
            const updatedState = await Games.updateGameState(parseInt(gameId, 10), state);
           //console.log("Updated game state:", updatedState);

           // request.app.get("io").to(`game-${gameId}`).emit("turn-updated", {
            //    currentTurn: state.currentTurn,
            //    playerId: state.players[state.currentTurn].id,
           // });

            req.app.get("io").to(`game-${gameId}`).emit("game-state", updatedState);
            req.app.get("io").to(`game-${gameId}`).emit("game-action", { type: "card-played", card, playerId });
            console.log("Card played successfully:", card);
            res.status(200).json({ success: true, card });
        } catch (error) {
            console.error("Error playing card:", error);
            req.app.get("io").to(`game-${gameId}`).emit("error", { message: "Failed to play card." });
            res.status(500).json({ success: false, message: "Failed to play card." });
        }
    }
);

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
            });

            req.app.get("io").to(`game-${gameId}`).emit("game-state", updatedState);
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