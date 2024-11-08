import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express from "express";
import httpErrors from "http-errors";
import morgan from "morgan";
import * as path from "path";
import connectLiveReload from "connect-livereload";
import livereload from "livereload";
import {timeMiddleware} from "./middleware/time";

dotenv.config();

import authRoutes from "./routes/auth";
import rootRoutes from "./routes/root";
import gameRoutes from "./routes/games";

const app = express();
const PORT = process.env.PORT || 3000;

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

app.use((_request, _response, next) => {
    next(httpErrors(404, "Page Not Found"));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});




