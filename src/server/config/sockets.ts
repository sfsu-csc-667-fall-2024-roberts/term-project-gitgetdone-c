import {Server} from "http";
import {Express, RequestHandler} from "express";
import {Server as SocketIOServer, Socket } from "socket.io";

let io: SocketIOServer | undefined;

const bindSession = (socket: Socket) => {
    const {request} = socket;

    // @ts-ignore
    socket.join(request.session.id);

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

        io.on("connection", (socket) => {
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