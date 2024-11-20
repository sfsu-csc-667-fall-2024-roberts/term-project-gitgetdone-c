import pool from "./connection";

const testQuery = async () => {
  try {
    const [rows] = await pool.query("SELECT * FROM users");
    console.log(rows);
  } catch (err) {
    if (err instanceof Error) {
      console.error("Query failed:", err.message);
    } else {
      console.error("Query failed:", err);
    }
  }
};

testQuery();
