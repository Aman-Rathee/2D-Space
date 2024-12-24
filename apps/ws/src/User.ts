import { WebSocket } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import client from "@repo/db/client";
import 'dotenv/config'
import { RoomManager } from "./RoomManager";

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) throw new Error("JWT_SECRET is not defined in environment variables");

function getRandomString(length: number) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

export class User {
    private ws: WebSocket
    private spaceId?: string;
    private userId?: string;
    private x: number;
    private y: number;
    public id: string;

    constructor(ws: WebSocket) {
        this.id = getRandomString(10);
        this.ws = ws;
        this.x = 0;
        this.y = 0;
        this.initHandler()
    }

    initHandler() {
        this.ws.on("message", async (data) => {
            const parsedData = JSON.parse(data.toString());
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
                    const space = await client.space.findFirst({
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
                            users: RoomManager.getInstance().rooms.get(spaceId)?.filter(x => x.id !== this.id)?.map((u) => ({ id: u.id })) ?? []
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