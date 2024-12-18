import { NextFunction, Request, Response } from "express";

// Extend the session interface to include `user`
declare module "express-session" {
    interface Session {
        user?: {
            id: number;
            username: string;
            email: string;
        };
    }
}

export default function checkAuthentication(
    request: Request,
    response: Response,
    next: NextFunction
) {
    // Define paths that do not require authentication
    const publicPaths = ["/auth/login", "/auth/register", "/auth/logout"];

    // Allow access to public paths without authentication
    if (publicPaths.includes(request.path)) {
        // Attach the user to response.locals if the user is logged in
        if (request.session?.user) {
            response.locals.user = request.session.user;
        } else {
            response.locals.user = null;
        }
        return next();
    }

    // Check if user session exists
    if (!request.session?.user) {
        console.log("Invalid authentication: User not logged in");
        return response.redirect("/auth/login");
    }

    // Attach the user object from session to response.locals for template rendering
    response.locals.user = request.session.user;

    // Proceed to the next middleware or route handler
    next();
}
