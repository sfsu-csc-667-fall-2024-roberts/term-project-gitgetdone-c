// import db from "./connection";
// import bcrypt from "bcrypt";
// import {createHash} from "crypto";
// import {request} from "node:http";

// const CREATE_USERS = `
// INSERT INTO users (username, password, email, gravatar) 
// VALUES ($1, $2, $3, $4) 
// RETURNING id, email, username, gravatar`;

// export type User = {
//     username: string;
//     password: string
//     email: string;
// };

// const create = async (user: User) => {
//     const password = await bcrypt.hash(user.password, 10);
//     const gravatar = createHash("sha256")
//         .update(user.email)
//         .digest("hex");

//     return db.one(CREATE_USERS, [
//         user.username,
//         password,
//         user.email,
//         gravatar,
//     ]);
// }

// const FIND_BY_ID = `
//     SELECT * FROM users WHERE id = $1;
// `;

// const findById = async (id: number) => {
//     return db.oneOrNone(FIND_BY_ID, [id]);
// }

// const FIND_BY_EMAIL = `
//     SELECT * FROM users WHERE email = $1;
// `;

// const findByEmail = async (email: string) => {
//     return db.oneOrNone(FIND_BY_EMAIL, [email]);
// }

// const FIND_BY_USERNAME = `
//     SELECT * FROM users WHERE username = $1;
// `;

// const findByUsername = async (username: string) => {
//     return db.one(FIND_BY_USERNAME, [username]);
// }

// const login = async (user: Omit<User, "email">) => {
//     try {
//         const possibleUser = await findByUsername(user.username);
//         const isValid = await bcrypt.compare(user.password, possibleUser.password);

//         if (isValid) {
//             return {
//                 id: possibleUser.id,
//                 username: possibleUser.username,
//                 email: possibleUser.email,
//                 gravatar: possibleUser.gravatar,
//             };
//         }

//         throw new Error("A user with that username and password does not exist.")
//     }
//     catch (error) {
//         console.error(error);

//         throw error;
//     }
// }

// export default { create, findById, findByEmail, findByUsername, login };