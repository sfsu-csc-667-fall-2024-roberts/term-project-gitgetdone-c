import express from "express";
import chatMiddleware from "../middleware/chat";
import { Games } from "../db";

const router = express.Router();

router.get("/", chatMiddleware, async (req, res) => {
    try {
        // Retrieve user information from response.locals
        const user = res.locals.user || null;
        const roomId = res.locals.roomId || null;
        const error = req.query.error || null;

        // Fetch available games
        const availableGames = await Games.availableGames();

        // Log the data for debugging
        console.log("In /lobby route handler", {
            user: user ? user.username : "Guest",
            roomId,
            error,
        });

        // Render the lobby template with the provided data
        res.render("lobby", {
            title: "Game Lobby",
            user,
            roomId,
            availableGames,
            error,
        });
    } catch (err) {
        // Handle errors gracefully
        console.error("Error in /lobby route:", err);

        res.status(500).render("error", {
            title: "Error",
            message: "An error occurred while loading the game lobby. Please try again later.",
        });
    }
});

export default router;
