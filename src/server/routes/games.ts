import express from "express";
import checkAuthentication from "../middleware/check-authentication";
import chatMiddleware from "../middleware/chat";

const router = express.Router();

router.get("/:gameId", checkAuthentication, chatMiddleware, (request, response) => {
    const{ gameId } = request.params;
    const user = response.locals.user;

    response.render("games", { title: `Game ${gameId}`, gameId, roomId: response.locals.roomId })
});

export default router;