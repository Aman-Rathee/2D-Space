import { Router } from "express";
import { authRouter } from "./auth";
import { userRouter } from "./user";
import { spaceRouter } from "./space";
import { adminRouter } from "./admin";
import client from '@repo/db/client';

export const router = Router();

router.get("/elements", async (req, res) => {
    try {
        const elements = await client.element.findMany()
        res.json({
            elements: elements.map(e => ({
                id: e.id,
                imageUrl: e.imageUrl,
                width: e.width,
                height: e.height,
                static: e.static
            }))
        });
    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
        });
    }

})

router.get("/avatars", async (req, res) => {
    try {
        const avatars = await client.avatar.findMany()
        res.json({
            avatars: avatars.map(x => ({
                id: x.id,
                imageUrl: x.imageUrl,
                name: x.name
            }))
        });
    } catch (error) {
        res.status(500).json({
            message: 'Internal server error',
        });
    }

})

router.use("/auth", authRouter)
router.use("/user", userRouter)
router.use("/space", spaceRouter)
router.use("/admin", adminRouter)
