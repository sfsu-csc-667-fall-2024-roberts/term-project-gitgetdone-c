import express from "express"

const router = express.Router();

router.get("/register", (_request, response) => {
    response.render("register");
});

router.get("/login", (_request, response) => {
    response.render("login");
});

export default router;