import express from "express";
import chatMiddleware from "../middleware/chat";
import { Games } from "../db";

const router = express.Router();

router.get("/", chatMiddleware, async (req, res) => {
    try {
        const user = res.locals.user ?? null;
        const roomId = res.locals.roomId ?? "unknown";
        const error = req.query.error || null;

        let availableGames = [];
        try {
            availableGames = await Games.availableGames();
            if (!Array.isArray(availableGames)) {
                console.error("Unexpected format for available games:", availableGames);
                availableGames = [];
            }
        } catch (err) {
            if (err instanceof Error) {
                console.error("Failed to fetch available games:", err.message);
            } else {
                console.error("Unexpected error fetching available games:", err);
            }
        }

        console.log("In /lobby route handler", {
            user: user ? user.username : "Guest",
            roomId,
            error,
            availableGamesCount: availableGames.length,
        });

        res.render("lobby", {
            title: "Game Lobby",
            user,
            roomId,
            availableGames,
            error,
        });
    } catch (err) {
        if (err instanceof Error) {
            console.error("Error in /lobby route:", {
                message: err.message,
                stack: err.stack,
                user: res.locals.user,
                roomId: res.locals.roomId,
            });

            res.status(500).render("error", {
                title: "Error",
                message: "An error occurred while loading the game lobby. Please try again later.",
            });
        } else {
            console.error("Unexpected error type in /lobby route:", err);

            res.status(500).render("error", {
                title: "Error",
                message: "An unknown error occurred. Please try again later.",
            });
        }
    }
});

export default router;
