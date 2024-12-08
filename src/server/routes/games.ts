import express from "express";
import checkAuthentication from "../middleware/check-authentication";
import chatMiddleware from "../middleware/chat";
import {Games} from "../db";

const router = express.Router();

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

router.get("/:gameId", checkAuthentication, chatMiddleware, (request, response) => {
    const{ gameId } = request.params;
    const user = response.locals.user;

    response.render("games", { title: `Game ${gameId}`, gameId, roomId: response.locals.roomId })
});

export default router;