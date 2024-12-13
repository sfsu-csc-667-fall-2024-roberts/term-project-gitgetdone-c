import {Server} from "http";
import {Express, RequestHandler} from "express";
import {Server as SocketIOServer, Socket } from "socket.io";
import {Games} from "../db/";

let io: SocketIOServer | undefined;

const bindSession = async (socket: Socket) => {
    const {request} = socket;

    // @ts-ignore
    socket.join(request.session.id);

    // @ts-ignore
    const userGames = await Games.getUserGameRooms(request.session.user.id);

    userGames.forEach(({game_id}) => {
        socket.join(`game-${game_id}`);
    });

    socket.use((_, next) => {
        // @ts-ignore
        request.session.reload((error) => {
            if (error) {
                socket.disconnect();
            }
            else {
                next();
            }
        })
    });
}

export default function (server: Server, app: Express, sessionMiddleware: RequestHandler): SocketIOServer {
    if (io === undefined) {
        io = new SocketIOServer(server);
        app.set("io", io);
        io.engine.use(sessionMiddleware);

        io.on("connection", async (socket) => {
            bindSession(socket);

            // @ts-ignore
            console.log(`client connected (${socket.request.session.id})`)

            socket.on("disconnect", () => {
                // @ts-ignore
                console.log(`client disconnected (${socket.request.session.id})`)
            })
        });
    }

    return io;
}