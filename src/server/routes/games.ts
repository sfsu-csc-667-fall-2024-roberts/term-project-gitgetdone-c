import express from "express";
import checkAuthentication from "../middleware/check-authentication";
import chatMiddleware from "../middleware/chat";
import {Games} from "../db";

const router = express.Router();

router.post("/create", async (request, response) => {
    // @ts-ignore
    const {id: user_id} = request.session.user;
    const gameId = await Games.create(user_id);

    response.redirect(`/games/${gameId}`);
});

router.get("/:gameId", checkAuthentication, chatMiddleware, (request, response) => {
    const{ gameId } = request.params;
    const user = response.locals.user;

    response.render("games", { title: `Game ${gameId}`, gameId, roomId: response.locals.roomId })
});

export default router;