import db from "./connection";
import bcrypt from "bcrypt";
import {createHash} from "crypto";
import {request} from "node:http";

const CREATE_USERS = `
INSERT INTO users (username, password, email, gravatar) 
VALUES ($1, $2, $3, $4) 
RETURNING id, email, username, gravatar`;

export type User = {
    username: string;
    password: string
    email: string;
};

const create = async (user: User) => {
    const password = await bcrypt.hash(user.password, 10);
    const gravatar = createHash("sha256")
        .update(user.email)
        .digest("hex");

    return db.one(CREATE_USERS, [
        user.username,
        password,
        user.email,
        gravatar,
    ]);
}

const FIND_BY_ID = `
    SELECT * FROM users WHERE id = $1;
`;

const findById = async (id: number) => {
    return db.oneOrNone(FIND_BY_ID, [id]);
}

const FIND_BY_EMAIL = `
    SELECT * FROM users WHERE email = $1;
`;

const findByEmail = async (email: string) => {
    return db.oneOrNone(FIND_BY_EMAIL, [email]);
}

const FIND_BY_USERNAME = `
    SELECT * FROM users WHERE username = $1;
`;

const findByUsername = async (username: string) => {
    return db.one(FIND_BY_USERNAME, [username]);
}

const login = async ({ email, password }: { email: string; password: string }) => {
    try {
        const result = await db.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        // console.log("Database query result:", result);

        if (!result || result.length === 0) {
            throw new Error("Invalid email or user does not exist.");
        }

        const user = result[0];

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            throw new Error("Invalid credentials");
        }

        return {
            id: user.id,
            username: user.username,
            email: user.email,
            gravatar: user.gravatar,
        };
    } catch (error) {
        // @ts-ignore
        // console.error("Login error:", error.messsage);
        throw error;
    }
};

export default { create, findById, findByEmail, findByUsername, login };