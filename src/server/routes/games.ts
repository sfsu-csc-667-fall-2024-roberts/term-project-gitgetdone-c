import express from "express";

const router = express.Router();

router.get("/lobby", (_request, response) => {
    response.render("lobby", { title: "Game lobby" });
});

router.get("/:id", (request, response) => {
    const{ id } = request.params;

    response.render("games", { title: `Game ${id}`, id })
});

export default router;