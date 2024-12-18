import express from "express";
const router = express.Router();

// Redirect to lobby
router.get("/", (_request, response) => {
    response.redirect("/lobby");
});

export default router;
