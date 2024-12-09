import express from "express";
import checkAuthentication from "../middleware/check-authentication";
import chatMiddleware from "../middleware/chat";
import { Games } from "../db";
import { UnoGame } from "../game/gameLogic";

const router = express.Router();

// Store active games in memory
const activeGames: Record<number, UnoGame> = {};

// Existing endpoint: Does a thing for a game
router.post("/do-a-thing/:gameId", (request, response) => {
    const { gameId } = request.params;

    response.send(`Did a thing for game ${gameId}`);
    request.app.get("io").to(`game-${gameId}`).emit("thing", { thing: "thing", ts: Date.now() });
});

// Create a new UNO game
router.post("/create", checkAuthentication, async (request, response) => {
    // @ts-ignore
    const { id: user_id } = request.session.user;

    try {
        // Create a new game in the database
        const game = await Games.create(user_id);

        // Initialize UNO game logic
        const unoGame = new UnoGame(game.id, [user_id]);
        activeGames[game.id] = unoGame;

        request.app.get("io").emit("game-created", game);
        response.redirect(`/games/${game.id}`);
    } catch (error) {
        console.error("Error creating game:", error);
        response.redirect("/lobby?error=game-creation-failed");
    }
});

// Join an existing game
router.post("/join/:gameId", checkAuthentication, async (request, response) => {
    // @ts-ignore
    const { id: user_id } = request.session.user;
    const { gameId } = request.params;
    const game_id = parseInt(gameId, 10);

    try {
        const gameExists = activeGames[game_id];
        if (!gameExists) {
            response.redirect("/lobby?error=game-not-found");
            return;
        }

        // Check if user is already in the game
        const userInGame = await Games.isUserInGame(user_id, game_id);
        if (userInGame) {
            response.redirect(`/games/${gameId}`);
            return;
        }

        // Validate game capacity
        const gameInfo = await Games.getGameInfo(game_id);
        if (!gameInfo) {
            response.redirect("/lobby?error=game-not-found");
            return;
        }

        const players = parseInt(gameInfo.players, 10);
        const maxPlayers = parseInt(gameInfo.player_count, 10);
        if (players >= maxPlayers) {
            response.redirect("/lobby?error=game-full");
            return;
        }

        // Add player to the game
        await Games.join(user_id, game_id);
        gameExists.addPlayer(user_id);

        request.app.get("io").emit("game-updated", gameExists.getState());
        response.redirect(`/games/${gameId}`);
    } catch (error) {
        console.error("Error joining game:", error);
        response.redirect("/lobby?error=unknown-error");
    }
});

// Play a card in the game
router.post("/:gameId/play", checkAuthentication, (request, response) => {
    const { gameId } = request.params;
    const { cardIndex } = request.body;
    // @ts-ignore
    const { id: user_id } = request.session.user;

    try {
        const game = activeGames[parseInt(gameId, 10)];
        if (!game) {
            response.status(404).send({ error: "Game not found" });
            return;
        }

        const success = game.playCard(user_id, cardIndex);
        if (!success) {
            response.status(400).send({ error: "Invalid move" });
            return;
        }

        request.app.get("io").emit(`game-state:${gameId}`, game.getState());
        response.status(200).send(game.getState());
    } catch (error) {
        console.error("Error playing card:", error);
        response.status(500).send({ error: "Internal server error" });
    }
});

// Fetch current game state
router.get("/:gameId", checkAuthentication, chatMiddleware, (request, response) => {
    const { gameId } = request.params;

    try {
        const game = activeGames[parseInt(gameId, 10)];
        if (!game) {
            response.status(404).send({ error: "Game not found" });
            return;
        }

        response.status(200).send(game.getState());
    } catch (error) {
        console.error("Error fetching game state:", error);
        response.status(500).send({ error: "Internal server error" });
    }
});

export default router;
