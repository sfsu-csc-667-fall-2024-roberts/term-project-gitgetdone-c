import express from "express";
import chatMiddleware from "../middleware/chat";
import { Games } from "../db";

const router = express.Router();

router.get("/", chatMiddleware, async (req, res) => {
    try {
        const user = req.session?.user || null;
        const roomId = res.locals.roomId ?? "unknown";
        const error = req.query.error || null;

        let availableGames = [];
        if (user) {
            try {
                availableGames = await Games.availableGames();
                if (!Array.isArray(availableGames)) {
                    console.error("Unexpected format for available games:", availableGames);
                    availableGames = [];
                }
            } catch (err) {
                console.error("Failed to fetch available games:", err);
            }
        }

        res.render("lobby", {
            title: "Game Lobby",
            user,
            roomId,
            availableGames,
            error,
        });
    } catch (err) {
        console.error("Error in /lobby route:", err);
        res.status(500).render("error", {
            title: "Error",
            message: "An error occurred while loading the game lobby.",
        });
    }
});

export default router;
