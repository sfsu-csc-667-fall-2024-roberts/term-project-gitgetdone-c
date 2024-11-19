import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express from "express";
import httpErrors from "http-errors";
import morgan from "morgan";
import * as path from "path";
import http from "http";
import { Server } from "socket.io"; // Import Server from socket.io

dotenv.config();

import * as config from "./config";
import * as routes from "./routes";
import checkAuthentication from "./middleware/check-authentication";

const app = express();
const PORT = process.env.PORT || 3000;

// Create HTTP server and initialize Socket.IO
const server = http.createServer(app);
const io = new Server(server); // Initialize Socket.IO with the HTTP server

// WebSocket connection setup
io.on("connection", (socket) => {
  // Now using `socket` directly
  console.log("a user connected");

  // Handle incoming chat messages
  socket.on("chat message", (msg: string) => {
    // Explicit typing for `msg`
    console.log("message: " + msg);
    // Broadcast message to all connected clients
    io.emit("chat message", msg);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use("/", routes.home);
app.use("/lobby", checkAuthentication, routes.mainLobby);
app.use("/auth", routes.auth);
app.use("/games", checkAuthentication, routes.games);

// Serve static files (e.g., for images, CSS, JS)
const staticPath = path.join(process.cwd(), "src", "public");
app.use(express.static(staticPath));

// Livereload for development environment
config.livereload(app, staticPath);

// Session management
config.session(app);

// Middleware to handle cookies
app.use(cookieParser());

// View engine setup
app.set("views", path.join(process.cwd(), "src", "server", "views"));
app.set("view engine", "ejs");

// 404 error handling
app.use((_request, _response, next) => {
  next(httpErrors(404, "Page Not Found"));
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
