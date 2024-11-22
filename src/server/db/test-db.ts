import dotenv from "dotenv";

dotenv.config({ path: "../../../.env" });

import { Pool } from "pg";

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
