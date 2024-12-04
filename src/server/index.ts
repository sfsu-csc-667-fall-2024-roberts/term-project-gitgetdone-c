import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express from "express";
import httpErrors from "http-errors";
import morgan from "morgan";
import * as path from "path";
import { createServer } from "http"; // Import for WebSocket
import { Server } from "socket.io"; // Import for WebSocket

dotenv.config();

import * as config from "./config";
import * as routes from "./routes";
import checkAuthentication from "./middleware/check-authentication";

const app = express();
const PORT = process.env.PORT || 3000;

// Create HTTP and WebSocket servers
const httpServer = createServer(app);
const io = new Server(httpServer);

// WebSocket Implementation
io.on("connection", (socket) => {
  console.log("A user connected");

  // Listen for chat messages
  socket.on("chat message", (msg) => {
    console.log("Message received: ", msg);
    io.emit("chat message", msg); // Broadcast message to all connected clients
  });

  // Handle user disconnect
  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

// Middleware for request logging and JSON parsing
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session configuration from friend's code
config.session(app);

// Routes setup
app.use("/", routes.home);
app.use("/lobby", checkAuthentication, routes.mainLobby);
app.use("/auth", routes.auth);
app.use("/games", checkAuthentication, routes.games);

// Serve static files
const staticPath = path.join(process.cwd(), "src", "public");
app.use(express.static(staticPath));

// Livereload setup
config.livereload(app, staticPath);

// Cookie parser
app.use(cookieParser());

// View engine setup
app.set("views", path.join(process.cwd(), "src", "server", "views"));
app.set("view engine", "ejs");

// Error handling for 404
app.use((_request, _response, next) => {
  next(httpErrors(404, "Page Not Found"));
});

// Replace app.listen with httpServer.listen for WebSocket support
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
