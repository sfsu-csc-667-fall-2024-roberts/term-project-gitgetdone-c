import express, { Request } from "express";
import { Users } from "../db";

const router = express.Router();

router.get("/register", (req, res) => {
    const error = req.query.error || null;
    res.render("register", { title: "Auth: Register", error });
});

type RegisterRequest = Request<{
    username: string;
    email: string;
    password: string;
}>;

router.post("/register", async (req: RegisterRequest, res) => {
    const { username, email, password } = req.body;

    try {
        const existingUser = await Users.findByEmail(email);
        if (existingUser) {
            return res.redirect("/auth/register?error=User already exists");
        }

        const user = await Users.create({ username, email, password });
        req.session.user = { id: user.id, username: user.username, email: user.email };

        req.session.save((err) => {
            if (err) {
                console.error("Session save error:", err);
                return res.redirect("/auth/register?error=Session save failed");
            }
            res.redirect("/lobby");
        });
    } catch (error) {
        console.error("Registration error:", error);
        res.redirect("/auth/register?error=Unknown error occurred");
    }
});

router.get("/login", (req, res) => {
    const error = req.query.error || null;
    res.render("login", { title: "Auth: Login", error });
});

type LoginRequest = Request<{
    email: string;
    password: string;
}>;

router.post("/login", async (req: LoginRequest, res) => {
    const { email, password } = req.body;

    try {
        const user = await Users.login({ email, password });
        req.session.user = { id: user.id, username: user.username, email: user.email };

        req.session.save((err) => {
            if (err) {
                console.error("Session save error:", err);
                return res.redirect("/auth/login?error=Session save failed");
            }
            res.redirect("/lobby");
        });
    } catch (error) {
        console.error("Login error:", error);
        res.redirect("/auth/login?error=Invalid email or password");
    }
});

// Updated POST Logout Route
router.post("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Logout error:", err);
            return res.redirect("/?error=Logout failed");
        }
        res.clearCookie("connect.sid");
        res.redirect("/auth/login");
    });
});

export default router;
