import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express from "express";
import httpErrors from "http-errors";
import morgan from "morgan";
import * as path from "path";
import connectLiveReload from "connect-livereload";
import livereload from "livereload";
import { createServer } from "http"; // Import for WebSocket
import { Server } from "socket.io"; // Import for WebSocket

import { timeMiddleware } from "./middleware/time";
import authApiRoutes from "./routes/authApiRoutes";
import authRoutes from "./routes/auth"; // Handles rendering (views)
import rootRoutes from "./routes/root";
import gameRoutes from "./routes/games";
import lobbyRoutes from "./routes/lobby";
import loginRoutes from "./routes/login";

dotenv.config();

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
    io.emit("chat message", msg); // Broadcast the message to all connected clients
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

// Middleware for logging, parsing JSON, and URL-encoded data
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Static file serving
const staticPath = path.join(process.cwd(), "src", "public");
app.use(express.static(staticPath));

// Enable LiveReload for development
if (process.env.NODE_ENV === "development") {
  const reloadServer = livereload.createServer({ port: 35730 });
  reloadServer.watch(staticPath);
  app.use(connectLiveReload());
}

// Middleware for cookies and custom time middleware
app.use(cookieParser());
app.use(timeMiddleware);

// Set views directory and view engine
app.set("views", path.join(process.cwd(), "src", "server", "views"));
app.set("view engine", "ejs");

// Route definitions
app.use("/", rootRoutes); // Root route
app.use("/auth", authRoutes); // Routes for rendering login/register views
app.use("/api/auth", authApiRoutes); // API routes for registration/login logic
app.use("/games", gameRoutes); // Game routes
app.use("/lobby", lobbyRoutes); // Lobby routes
app.use("/login", loginRoutes); // Route for rendering login page

// 404 Error handling
app.use((_request, _response, next) => {
  next(httpErrors(404, "Page Not Found"));
});

// Global error handler
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error(err.stack);
    res.status(err.status || 500).json({ error: err.message });
  },
);

// Start server
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
