import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express from "express";
import httpErrors from "http-errors";
import morgan from "morgan";
import * as path from "path";

dotenv.config();

import * as config from "./config";
import * as routes from "./routes";
import checkAuthentication from "./middleware/check-authentication";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", routes.home);
app.use("/lobby", checkAuthentication, routes.mainLobby);
app.use("/auth", routes.auth);
app.use("/games", checkAuthentication, routes.games);

const staticPath = path.join(process.cwd(), "src", "public");
app.use(express.static(staticPath));

config.livereload(app, staticPath);
config.session(app);

app.use(cookieParser());
app.set("views", path.join(process.cwd(), "src", "server", "views"));
app.set("view engine", "ejs");

app.use((_request, _response, next) => {
    next(httpErrors(404, "Page Not Found"));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});




