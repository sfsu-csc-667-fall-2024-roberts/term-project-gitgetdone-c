import express, { Request } from "express";
import { Users } from "../db";
import { Games } from "../db";

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

router.post("/logout", async (req, res) => {
    try {
        // If user was in a game, notify other players
        if (req.session?.user?.id && req.session?.user?.username) {
            const userGames = await Games.getUserGameRooms(req.session.user.id);
            const io = req.app.get("io");
            
            userGames.forEach(({ game_id }) => {
                io.to(`game-${game_id}`).emit("player-left", {
                    playerId: req.session.user!.id,
                    username: req.session.user!.username
                });
            });
        }
         req.session.destroy((err) => {
            if (err) {
                console.error("Logout error:", err);
                return res.redirect("/lobby?error=Logout failed");
            }
            res.clearCookie("connect.sid");
            res.redirect("/lobby");
        });
    } catch (error) {
        console.error("Error during logout:", error);
        res.redirect("/lobby");
    }
}
 );

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

router.post("/logout", async (req, res) => {
    try {
        // If user was in a game, notify other players
        if (req.session?.user) {
            const userGames = await Games.getUserGameRooms(req.session.user.id);
            const io = req.app.get("io");
            
            userGames.forEach(({ game_id }) => {
                io.to(`game-${game_id}`).emit("player-left", {
                    playerId: req.session!.user!.id,
                    username: req.session!.user!.username
                });
            });
        }

        req.session.destroy((err) => {
            if (err) {
                console.error("Logout error:", err);
                return res.redirect("/lobby?error=Logout failed");
            }
            res.clearCookie("connect.sid");
            res.redirect("/lobby");
        });
    } catch (error) {
        console.error("Error during logout:", error);
        res.redirect("/lobby");
    }
});

export default router;
