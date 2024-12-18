import { Router, Request, Response } from "express";
import checkAuthentication from "../../middleware/check-authentication";
import { Games } from "../../db";

const router = Router();

router.post(
    "/create",
    checkAuthentication,
    async (req: Request, res: Response): Promise<void> => {
        try {
            if (!req.session?.user) {
                res.status(401).json({ error: "Unauthorized. Please log in to create a game." });
                return;
            }

            const { id: user_id } = req.session.user;

            // Create a new game in the database
            const game = await Games.create(user_id);

            // Emit the game creation event to all connected clients
            req.app.get("io").emit("game-created", game);

            // Redirect to the new game's page
            res.redirect(`/games/${game.id}`);
        } catch (error) {
            console.error("Error creating game:", error);
            res.status(500).json({ error: "An error occurred while creating the game." });
        }
    }
);

export default router;
