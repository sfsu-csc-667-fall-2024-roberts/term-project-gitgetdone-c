import { NextFunction, Request, Response } from "express";

const chatMiddleware = (request: Request, response: Response, next: NextFunction) => {
    //console.log("chatMiddleware is running");

    if (request.params.gameId !== undefined) {
        response.locals.roomId = request.params.gameId;
    } else {
        response.locals.roomId = 0;
    }

    //console.log("roomId in middleware:", response.locals.roomId);

    next();
};

export default chatMiddleware;
