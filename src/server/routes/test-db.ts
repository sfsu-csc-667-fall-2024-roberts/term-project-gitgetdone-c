import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config(); // Load .env variables

const pool = new Pool({
    host: process.env.PGHOST,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    port: parseInt(process.env.PGPORT || "5432", 10),
});

async function testConnection() {
    try {
        const result = await pool.query("SELECT NOW()");
        console.log("Database connected successfully:", result.rows[0]);
        pool.end();
    } catch (error) {
        console.error("Error connecting to the database:", error);
    }
}

testConnection();
