import express from "express"

const router = express.Router();

router.get("/register", (_request, response) => {
    response.render("auth/register");
});

router.get("/login", (_request, response) => {
    response.render("auth/login");
});

router.get("/logout", (_request, response) => {
    response.render("auth/logout");
});

export default router;