import { Router } from "express";
import { Games } from "../../db";

const router = Router();

router.post("/join/:gameId", async (req, res) => {
    // @ts-ignore
    const { id: user_id } = req.session.user;
    const { gameId } = req.params;
    const game_id = parseInt(gameId, 10);

    try {
        const userInGame = await Games.isUserInGame(user_id, game_id);
        if (userInGame) {
            return res.redirect(`/games/${gameId}`);
        }

        const gameInfo = await Games.getGameInfo(game_id);
        if (!gameInfo) {
            return res.redirect("/lobby?error=game-not-found");
        }

        const players = parseInt(gameInfo.players, 10);
        const maxPlayers = parseInt(gameInfo.player_count, 10);
        if (players >= maxPlayers) {
            return res.redirect("/lobby?error=game-full");
        }

        await Games.join(user_id, game_id);

        const updatedState = await Games.getGameState(game_id);
        req.app.get("io").to(`game-${game_id}`).emit("game-state", updatedState);

        res.redirect(`/games/${gameId}`);
    } catch (error) {
        console.error("Error joining game:", error);
        return res.redirect("/lobby?error=unknown-error");
    }
});

export default router;
