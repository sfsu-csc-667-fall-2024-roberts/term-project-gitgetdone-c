import express, { Request } from "express"
import {Users} from "../db";

const router = express.Router();

router.get("/register", (_request, response) => {
    response.render("register", { title: "Auth: Register" });
});

type RegisterRequest = Request<{
    username: string;
    email: string;
    password: string;
}>;

type LoginRequest = Request<{
    email: string;
    password: string;
}>;

router.post("/register", async (request: RegisterRequest, response) => {
    const { username, email, password } = request.body;

    try {
        // @ts-expect-error TODO fix this error for session
        request.session.user = await Users.create({ username, email, password });

        request.session.save((err) => {
            if (err) {
                console.error("Session save error:", err);
                return response.redirect("/auth/register");
            }
            response.redirect("/lobby");
        });
    } catch (error) {
        console.error(error);
        response.redirect("register");
    }
});

router.get("/login", (_request, response) => {
    response.render("login", { title: "Auth: Login"});
});

router.post("/login", async (request: LoginRequest, response) => {
    const { email, password } = request.body;

    try {
        // @ts-expect-error TODO fix this error for session
        request.session.user = await Users.login({ email, password });

        request.session.save((err) => {
            if (err) {
                console.error("Session save error:", err);
                return response.redirect("/auth/login");
            }
            response.redirect("/lobby");
        });
    } catch (error) {
        console.error(error);
        response.redirect("login");
    }
});

router.get("/logout", async (request, response) => {
    request.session.destroy((error) => {
        if (error) {
            console.error("Error destroying session:", error);
            return response.redirect("/");
        }

        response.clearCookie("connect.sid")
        response.redirect("/auth/login");
    });
});

export default router;