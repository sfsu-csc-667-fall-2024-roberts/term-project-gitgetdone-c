import { Router } from "express";
import { Games } from "../../db";

const router = Router();

router.post("/join/:gameId", async (req, res) => {
    if (!req.session?.user) {
        return res.redirect('/auth/login?error=Please login to join a game');
    }

    const { id: userId, username } = req.session.user;
    const { gameId } = req.params;
    const game_id = parseInt(gameId, 10);

    try {
        // Get current game state
        const state = await Games.getGameState(game_id);
        if (!state) {
            return res.redirect("/lobby?error=game-not-found");
        }

        // Check if user is already in the game
        const playerExists = state.players.some(p => p.id === userId);
        if (playerExists) {
            return res.redirect(`/games/${gameId}`);
        }

        // Check if game is full
        if (state.players.length >= 4) {
            return res.redirect("/lobby?error=game-full");
        }

        // Create new player with initial hand
        const newPlayer = {
            id: userId,
            username: username,
            hand: state.deck.splice(0, 7) // Deal 7 cards from the deck
        };

        // Add new player to the game
        state.players.push(newPlayer);

        // Update game state
        await Games.updateGameState(game_id, state);

        // Notify other players
        req.app.get("io").to(`game-${gameId}`).emit("player-joined", {
            playerId: userId,
            username: username
        });

        res.redirect(`/games/${gameId}`);
    } catch (error) {
        console.error("Error joining game:", error);
        return res.redirect("/lobby?error=unknown-error");
    }
});

export default router;
