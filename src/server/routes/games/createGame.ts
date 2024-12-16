import { Router } from "express";
import { Games } from "../../db";

const router = Router();

router.post("/create", async (req, res) => {
    // @ts-ignore
    const { id: user_id } = req.session.user;
    const game = await Games.create(user_id);

    req.app.get("io").emit("game-created", game);
    res.redirect(`/games/${game.id}`);
});

export default router;
