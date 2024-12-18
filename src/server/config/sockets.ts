import { Server } from "http";
import { Express, RequestHandler } from "express";
import { Server as SocketIOServer, Socket } from "socket.io";
import { Games } from "../db/";

let io: SocketIOServer | undefined;

// Safely bind session to socket with minimal changes
const bindSession = async (socket: Socket) => {
    const { request } = socket;

    // Use @ts-ignore to suppress TypeScript errors for session usage
    // @ts-ignore
    if (!request.session || !request.session.user || !request.session.id) {
        console.error("No session or user found for the socket connection.");
        socket.disconnect(); // Disconnect if session is invalid
        return;
    }

    // Join the session room
    // @ts-ignore
    socket.join(request.session.id);

    try {
        // Retrieve user's active game rooms
        // @ts-ignore
        const userGames = await Games.getUserGameRooms(request.session.user.id);

        userGames.forEach(({ game_id }) => {
            socket.join(`game-${game_id}`);
        });

        // Keep the session alive
        socket.use((_, next) => {
            // @ts-ignore
            request.session.reload((error) => {
                if (error) {
                    socket.disconnect();
                } else {
                    next();
                }
            });
        });
    } catch (error) {
        console.error("Error binding session:", error);
        socket.disconnect();
    }
};

export default function (
    server: Server,
    app: Express,
    sessionMiddleware: RequestHandler
): SocketIOServer {
    if (io === undefined) {
        io = new SocketIOServer(server);
        app.set("io", io);
        io.engine.use(sessionMiddleware);

        io.on("connection", async (socket) => {
            await bindSession(socket);

            // @ts-ignore
            console.log(`Client connected (${socket.request.session.id})`);

            socket.on("disconnect", () => {
                // @ts-ignore
                console.log(`Client disconnected (${socket.request.session.id})`);
            });
        });
    }

    return io;
}
