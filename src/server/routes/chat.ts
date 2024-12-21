import express from "express";
import checkAuthentication from "../middleware/check-authentication";
import chatMiddleware from "../middleware/chat";

const router = express.Router();

router.get("/:roomId", checkAuthentication, chatMiddleware, (request, response) => {
    const{ roomId } = request.params;
    const message = request.body.message;
    response.status(200).send();
});

router.post("/:roomId", checkAuthentication, chatMiddleware, (request, response) => {
    const { roomId } = request.params;
    const message = request.body.message;
    // @ts-expect-error
    const { email, gravatar } = request.session.user;
    const io = request.app.get("io");

    io.emit(`message:${roomId}`, {
        message,
        gravatar,
        sender: email,
        timestamp: new Date()
    });

    response.status(200).send({ status: "ok" });
});

export default router;