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
    username: string;
    password: string;
}>;

router.post("/register", async (request: RegisterRequest, response) => {
    const { username, email, password } = request.body;

    try {
        // @ts-expect-error TODO fix this error for session
        request.session.user = await Users.create({ username, email, password });
        request.session.save();

        response.redirect("/lobby");
    } catch (error) {
        // TODO: Implement error handling
        console.error(error);
        response.redirect("register");
    }
});

router.get("/login", (_request, response) => {
    response.render("login", { title: "Auth: Login"});
});

router.post("/login", async (request: LoginRequest, response) => {
    const { username, password } = request.body;

    try {
        // @ts-expect-error TODO fix this error for session
        request.session.user = await Users.login({ username, password });
        request.session.save();
        response.redirect("/lobby");
    } catch (error) {
        console.error(error);
        response.redirect("login");
    }
});

router.get("/logout", async (request, response) => {
    request.session.destroy((error) => {
        if (error) {
            console.error(error);
        }
    });

    response.redirect("/");
});

export default router;