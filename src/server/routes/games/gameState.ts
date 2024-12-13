import {Request, Response, Router} from "express";
import { Games } from "../../db";
import checkAuthentication from "../../middleware/check-authentication";
import chatMiddleware from "../../middleware/chat";

const router = Router();

router.get("/:gameId", checkAuthentication, chatMiddleware, async (req, res) => {
    const { gameId } = req.params;
    const user = res.locals.user;

    try {
        const state = await Games.getGameState(parseInt(gameId, 10));
        if (!state) {
            return res.redirect("/lobby?error=game-not-found");
        }

        res.render("games", {
            title: `Game ${gameId}`,
            gameId: parseInt(gameId, 10),
            gameState: state,
            currentPlayerId: user.id,
            roomId: res.locals.roomId,
        });
    } catch (error) {
        console.error("Error fetching game state:", error);
        res.redirect("/lobby?error=failed-to-load-game");
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

export default router;
