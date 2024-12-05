import express from "express";
import chatMiddleware from "../middleware/chat";

const router = express.Router();

router.get("/:gameId", chatMiddleware, (request, response) => {
    const{ gameId } = request.params;
    const user = response.locals.user;

    if (!user) {
        return response.redirect("/auth/login");
    }

    response.render("games", { title: `Game ${gameId}`, gameId, roomId: response.locals.roomId })
});

export default router;