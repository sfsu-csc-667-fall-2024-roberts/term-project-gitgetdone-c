import connectPgSimple from "connect-pg-simple";
import type { Express, RequestHandler } from "express";
import flash from "express-flash";
import session from "express-session";


let sessionMiddleware: RequestHandler | undefined = undefined;

export default (app: Express): RequestHandler => {
    if (sessionMiddleware === undefined) {
        sessionMiddleware = session({
            store: new (connectPgSimple(session))({
                createTableIfMissing: true,
            }),
            secret: process.env.SESSION_SECRET!,
            resave: false,
            saveUninitialized: false,
        });

        app.use(sessionMiddleware);
        app.use(flash());
    }

    return sessionMiddleware;
};