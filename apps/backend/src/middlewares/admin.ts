import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import 'dotenv/config'

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) throw new Error("JWT_SECRET is not defined in environment variables");


export const adminMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const token = req.headers['authorization']?.split(" ")[1];
    if (!token) {
        res.status(403).json({ message: "Unauthorized" })
        return
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { role: string, userId: string }
        if (decoded.role !== "Admin") {
            res.status(403).json({ message: "Unauthorized" })
            return
        }
        req.userId = decoded.userId
        next()
    } catch (e) {
        if (e instanceof jwt.TokenExpiredError) {
            res.status(401).json({ message: "Unauthorized: Token has expired" });
            return
        }
        if (e instanceof jwt.JsonWebTokenError) {
            res.status(401).json({ message: "Unauthorized: Invalid token" });
            return
        }
        res.status(500).json({ message: "Internal server error" })
        return
    }
}