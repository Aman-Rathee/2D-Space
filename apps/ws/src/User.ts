import { WebSocket } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { prisma } from "@repo/db";
import 'dotenv/config'
import { RoomManager } from "./RoomManager";

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) throw new Error("JWT_SECRET is not defined in environment variables");


export class User {
    private ws: WebSocket
    private spaceId?: string;
    public userId?: string;
    private x: number;
    private y: number;

    constructor(ws: WebSocket) {
        this.ws = ws;
        this.x = 0;
        this.y = 0;
        this.initHandler()
    }

    initHandler() {
        this.ws.on("message", async (data) => {
            const parsedData = JSON.parse(data.toString());
            console.log('parseddDataa', parsedData);

            switch (parsedData.type) {
                case "join":
                    const spaceId = parsedData.payload.spaceId;
                    const token = parsedData.payload.token;
                    const userId = (jwt.verify(token, JWT_SECRET!) as JwtPayload).userId
                    if (!userId) {
                        this.ws.close()
                        return
                    }
                    this.userId = userId
                    const space = await prisma.space.findFirst({
                        where: {
                            id: spaceId
                        }
                    })
                    if (!space) {
                        this.ws.close()
                        return;
                    }
                    this.spaceId = spaceId
                    if (RoomManager.getInstance().rooms.get(spaceId)?.find(x => x.userId === userId)) {
                        this.send({
                            type: "error",
                            payload: {
                                message: "User already in room"
                            }
                        });
                        return;
                    }
                    RoomManager.getInstance().addUser(spaceId, this);
                    this.x = Math.floor(Math.random() * space?.width);
                    this.y = Math.floor(Math.random() * space?.height);
                    this.send({
                        type: "space-joined",
                        payload: {
                            spawn: {
                                x: this.x,
                                y: this.y
                            },
                            users: RoomManager.getInstance().rooms.get(spaceId)?.filter(x => x.userId !== this.userId)?.map((u) => ({ id: u.userId })) ?? []
                        }
                    });
                    RoomManager.getInstance().broadcast({
                        type: "user-joined",
                        payload: {
                            userId: this.userId,
                            x: this.x,
                            y: this.y
                        }
                    }, this, this.spaceId!);
                    break;

                case "player-moved":
                    if (!this.spaceId || !this.userId) {
                        this.send({
                            type: "error",
                            payload: {
                                message: "Player not in a valid space"
                            }
                        });
                        return;
                    }

                    const { x, y, direction } = parsedData.payload;
                    this.x = x;
                    this.y = y;
                    RoomManager.getInstance().broadcast({
                        type: "player-moved",
                        payload: {
                            userId: this.userId,
                            x,
                            y,
                            direction
                        }
                    }, this, this.spaceId);
                    break;
            }
        })
    }

    destroy() {
        RoomManager.getInstance().removeUser(this, this.spaceId!);
        RoomManager.getInstance().broadcast({
            type: "user-left",
            payload: {
                userId: this.userId
            }
        }, this, this.spaceId!);
    }

    send(payload: any) {
        this.ws.send(JSON.stringify(payload));
    }
}