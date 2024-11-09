import express from "express";

const router = express.Router();

// Display the main lobby page
router.get("/", (_request, response) => {
    response.render("lobby", { title: "Game Lobby" });
});

export default router;
