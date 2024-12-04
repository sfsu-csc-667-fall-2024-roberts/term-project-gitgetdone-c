import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express from "express";
import httpErrors from "http-errors";
import morgan from "morgan";
import * as path from "path";
import connectLiveReload from "connect-livereload";
import livereload from "livereload";
import { timeMiddleware } from "./middleware/time";
import { createServer } from "http"; // Import for WebSocket
import { Server } from "socket.io"; // Import for WebSocket

dotenv.config();

import authRoutes from "./routes/auth";
import rootRoutes from "./routes/root";
import gameRoutes from "./routes/games";
import lobbyRoutes from "./routes/lobby";

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

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const staticPath = path.join(process.cwd(), "src", "public");
app.use(express.static(staticPath));

if (process.env.NODE_ENV === "development") {
  const reloadServer = livereload.createServer();

  reloadServer.watch(staticPath);
  app.use(connectLiveReload());
}

app.use(cookieParser());
app.set("views", path.join(process.cwd(), "src", "server", "views"));
app.set("view engine", "ejs");

// app.use(express.static(path.join(process.cwd(), "src", "public")));
app.use("/", rootRoutes);
app.use("/auth", authRoutes);
app.use("/games", gameRoutes);
app.use("/lobby", lobbyRoutes);

app.use((_request, _response, next) => {
  next(httpErrors(404, "Page Not Found"));
});

// Replace `app.listen` with `httpServer.listen` to use WebSocket
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
