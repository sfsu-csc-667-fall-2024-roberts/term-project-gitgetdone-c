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
    // Always attach the user (or null) to `response.locals`
    response.locals.user = request.session?.user || null;

    // Define paths that do not require authentication
    const publicPaths = ["/auth/login", "/auth/register", "/auth/logout", "/lobby"];

    // Allow access to public paths without authentication
    if (publicPaths.some((path) => request.path.startsWith(path))) {
        return next();
    }

    // Redirect unauthenticated users from protected paths
    if (!request.session?.user) {
        console.log("Invalid authentication: User not logged in");
        return response.redirect("/auth/login");
    }

    // Proceed to the next middleware or route handler
    next();
}
