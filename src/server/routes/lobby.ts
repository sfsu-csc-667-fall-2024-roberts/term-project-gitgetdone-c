import express from "express";
import checkAuthentication from "../middleware/check-authentication";
import chatMiddleware from "../middleware/chat";
import {Games} from "../db";

const router = express.Router();

router.get("/", checkAuthentication, chatMiddleware, async (_request, response) => {
    const user = response.locals.user;
    const roomId = response.locals.roomId;
    const availableGames = await Games.availableGames();

    console.log("In /lobby route handler, roomId:", roomId);

    response.render("lobby", { title: "Game Lobby", user, roomId, availableGames });
});

export default router;
