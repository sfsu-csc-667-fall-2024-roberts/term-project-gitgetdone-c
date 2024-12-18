import dotenv from "dotenv";
dotenv.config(); // Load the .env file

import { Pool } from "pg";

// Debug: Log environment variables to verify they're loaded
console.log("PGHOST:", process.env.PGHOST || "Not Found");
console.log("PGUSER:", process.env.PGUSER || "Not Found");
console.log("PGPASSWORD:", process.env.PGPASSWORD || "Not Found");
console.log("PGDATABASE:", process.env.PGDATABASE || "Not Found");
console.log("PGPORT:", process.env.PGPORT || "Not Found");
console.log("SESSION_SECRET:", process.env.SESSION_SECRET || "Not Found");

// Configure PostgreSQL connection
const pool = new Pool({
    host: process.env.PGHOST,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    port: parseInt(process.env.PGPORT || "5432"),
});

(async () => {
    try {
        const result = await pool.query("SELECT NOW()");
        console.log("Database connected successfully:", result.rows[0]);
    } catch (error) {
        console.error("Error connecting to the database:", error);
    } finally {
        pool.end();
    }
})();
