import {NextFunction, Request, response, Response} from "express";

export default (
    request: Request,
    _response: Response,
    next: NextFunction
) => {
    console.log(request.session);

    // @ts-expect-error TODO fix this error for session
    if (!request.session.user) {
        response.redirect("/login");
    }
    else {
        // @ts-expect-error TODO fix this error for session
        response.locals.users = request.session.user;
        next();
    }
};