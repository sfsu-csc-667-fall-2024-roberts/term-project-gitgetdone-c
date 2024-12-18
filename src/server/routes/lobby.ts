import express from "express";
import chatMiddleware from "../middleware/chat";
import { Games } from "../db";

const router = express.Router();

router.get("/", chatMiddleware, async (request, response) => {
    const user = response.locals.user || null; // Optional user
    const roomId = response.locals.roomId || null; // Optional roomId
    const error = request.query.error || null; // Extract 'error' query parameter
    const availableGames = await Games.availableGames();

    console.log("In /lobby route handler", {
        roomId,
        user: user ? user.username : "Guest",
        error,
    });

    // Render the lobby with error messages and available games
    response.render("lobby", {
        title: "Game Lobby",
        user,
        roomId,
        availableGames,
        error,
    });
});

export default router;
