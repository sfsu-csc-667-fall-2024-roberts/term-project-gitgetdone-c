import {NextFunction, Request, Response} from "express";

export default (
    request: Request,
    response: Response,
    next: NextFunction
) => {
    // console.log("Session in Middleware: ", request.session);

    // @ts-expect-error TODO fix this error for session
    if (!request.session.user) {
        console.log("Invalid authentication");
        return response.redirect("/auth/login");
    }

    response.locals = response.locals || {};
    // @ts-expect-error TODO fix this error for session
    response.locals.user = request.session.user;

    next();
};