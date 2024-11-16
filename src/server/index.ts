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

const app = express();
const PORT = process.env.PORT || 3000;

import * as routes from "./routes/manifest";
import configureLiveReload from "./config/livereload";

app.use("/", routes.home);
app.use("/lobby", routes.mainLobby);
app.use("/auth", routes.auth);
app.use("/games", routes.games);

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const staticPath = path.join(process.cwd(), "src", "public");
app.use(express.static(staticPath));

configureLiveReload(app, staticPath);

app.use(cookieParser());
app.set("views", path.join(process.cwd(), "src", "server", "views"));
app.set("view engine", "ejs");

app.use((_request, _response, next) => {
    next(httpErrors(404, "Page Not Found"));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});




