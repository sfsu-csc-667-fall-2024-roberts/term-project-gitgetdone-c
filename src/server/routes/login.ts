import express from "express";

const router = express.Router();

router.get("/", (_request, response) => {
    response.render("login", { title: "Login" });
});

export default router;