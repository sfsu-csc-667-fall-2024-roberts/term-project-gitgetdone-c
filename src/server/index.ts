import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express from "express";
import httpErrors from "http-errors";
import morgan from "morgan";
import * as middleware from "./middleware";
import * as path from "path";
import { createServer } from "http";

dotenv.config();

import * as config from "./config";
import * as routes from "./routes";
import checkAuthentication from "./middleware/check-authentication";

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3000;

// Middleware setup
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Configure sessions
const sessionMiddleware = config.session(app);
app.use(sessionMiddleware);

// Set views and static files
app.set("views", path.join(process.cwd(), "src", "server", "views"));
app.set("view engine", "ejs");
app.use("/styles", express.static(path.join(__dirname, "views/styles")));
const staticPath = path.join(process.cwd(), "src", "public");
app.use(express.static(staticPath));

// Configure Socket.IO
config.livereload(app, staticPath);
config.configureSocketIO(server, app, sessionMiddleware);

// Apply global middleware for chat and user status
app.use(middleware.chat);

// Middleware to attach user session data to response.locals
app.use((req, res, next) => {
    res.locals.user = req.session?.user || null;
    next();
});

// Redirect root path to the lobby
app.get("/", (_req, res) => res.redirect("/lobby"));

// Route setup
app.use("/auth", routes.auth);
app.use("/lobby", routes.mainLobby);
app.use("/games", routes.games);
app.use("/chat", routes.chat);

// Handle 404 errors
app.use((_request, _response, next) => {
    next(httpErrors(404, "Page Not Found"));
});

// Debugging route for session data
app.get("/debug-session", (req, res) => {
    res.json(req.session);
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

