import { Router, Request, Response } from "express";
import pool from "../db/connection";
import bcrypt from "bcrypt";

const apiRouter = Router();

// User registration API
apiRouter.post("/register", async (req: Request, res: Response): Promise<void> => {
  const { username, email, password } = req.body;
  try {
    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
    await pool.query(query, [username, email, hashedPassword]);

    res.status(201).json({ message: "User registered successfully!" });
  } catch (err) {
    res.status(500).json({
      error: "Registration failed",
      details: (err as Error).message,
    });
  }
});

// User login API
apiRouter.post("/login", async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  try {
    // Query the database for the user
    const query = "SELECT * FROM users WHERE email = ?";
    const [rows]: any = await pool.query(query, [email]);

    if (rows.length === 0) {
      res.status(404).json({ error: "User not found!" });
      return;
    }

    const user = rows[0];
    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      res.status(401).json({ error: "Invalid credentials!" });
      return;
    }

    // Success response
    res.status(200).json({ message: "Login successful!", user: { id: user.id, email: user.email, username: user.username } });
  } catch (err) {
    res.status(500).json({ error: "Login failed", details: (err as Error).message });
  }
});

export default apiRouter;
