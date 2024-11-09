import express from "express";

const router = express.Router();

router.get("/", (_request, response) => {
    response.render("register", { title: "Register" });
});

export default router;