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

config.session(app);

// Redirect root path to the lobby
app.get("/", (req, res) => res.redirect("/lobby"));

// Route setup
app.use("/", routes.home);
app.use("/lobby", routes.mainLobby); // No authentication required
app.use("/auth", routes.auth);
app.use("/games", checkAuthentication, routes.games); // Requires authentication
app.use("/chat", checkAuthentication, routes.chat); // Requires authentication

// Serve static files
app.use("/styles", express.static(path.join(__dirname, "views/styles")));
const staticPath = path.join(process.cwd(), "src", "public");
app.use(express.static(staticPath));

// Configure Socket.IO
config.livereload(app, staticPath);
const sessionMiddleware = config.session(app);
config.configureSocketIO(server, app, sessionMiddleware);

app.use(cookieParser());
app.set("views", path.join(process.cwd(), "src", "server", "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(process.cwd(), "src", "public")));


// Chat middleware
app.use(middleware.chat);

// Handle 404 errors
app.use((_request, _response, next) => {
    next(httpErrors(404, "Page Not Found"));
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
