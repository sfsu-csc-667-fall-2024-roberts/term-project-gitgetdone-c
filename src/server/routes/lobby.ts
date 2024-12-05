import express from "express";
import chatMiddleware from "../middleware/chat";

const router = express.Router();

router.get("/", chatMiddleware, (_request, response) => {
    const user = response.locals.user;
    const roomId = response.locals.roomId;
    console.log("In lobby");

    if (!user) {
        return response.redirect("/auth/login");
    }

    console.log("In /lobby route handler, roomId:", roomId);

    response.render("lobby", { title: "Game Lobby", user, roomId });
});

export default router;
