import { Server } from "http";
import { Express, RequestHandler } from "express";
import { Server as SocketIOServer, Socket } from "socket.io";
import { Games } from "../db";

let io: SocketIOServer | undefined;

const bindSession = async (socket: Socket) => {
    const { request } = socket;

    // @ts-ignore: Bind user to their session room
    socket.join(request.session.id);

    // Join game-specific rooms if the user is in any games
    // @ts-ignore
    const userGames = await Games.getUserGameRooms(request.session.user.id);
    userGames.forEach(({ game_id }) => {
        socket.join(`game-${game_id}`);
    });

    // Reload the session for each request
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
};

export default function configureSocketIO(
    server: Server,
    app: Express,
    sessionMiddleware: RequestHandler
): SocketIOServer {
    if (io === undefined) {
        io = new SocketIOServer(server, {
            cors: {
                origin: "*", // Adjust as needed for security
                methods: ["GET", "POST"],
            },
        });
        app.set("io", io);
        io.engine.use(sessionMiddleware);

        io.on("connection", async (socket) => {
            // Bind session to socket
            await bindSession(socket);

            // Log connection
            // @ts-ignore
            console.log(`Client connected (${socket.request.session.id})`);

            // Handle global chat messages
// Server-side code
// Handle global chat messages
socket.on("sendMessage", ({ roomId, text }) => {
    if (io) {
        // @ts-ignore
        const username = socket.request.session.user.username || "Anonymous";

        // Fallback to a global "lobby" room if roomId is undefined
        const targetRoom = roomId || "lobby";  // Ensure fallback to "lobby"

        console.log(`[Room ${targetRoom}] ${username}: ${text}`); // Debugging

        // Broadcast to the specified room or lobby
        io.to(targetRoom).emit("chatMessage", { username, text });
    } else {
        console.error("Socket.IO instance is not initialized");
    }
});



            // Handle room-based messages (optional)
            socket.on("sendRoomMessage", ({ roomId, text }) => {
                if (io) {
                    // @ts-ignore
                    const username = socket.request.session.user.username || "Anonymous";

                    console.log(`[Room ${roomId}] ${username}: ${text}`); // Debugging

                    // Broadcast the message to a specific room
                    io.to(roomId).emit("chatMessage", { username, text });
                } else {
                    console.error("Socket.IO instance is not initialized");
                }
            });

            // Handle disconnection
            socket.on("disconnect", () => {
                // @ts-ignore
                console.log(`Client disconnected (${socket.request.session.id})`);
            });
        });
    }

    return io!;
}
