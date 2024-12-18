import express from "express";

const router = express.Router();

// Login Route
router.get("/", (req, res) => {
    // Retrieve error messages from query parameters
    const error = req.query.error || null;

    // Render the login page with an error message if provided
    res.render("login", {
        title: "Login",
        error,
    });
});

export default router;
