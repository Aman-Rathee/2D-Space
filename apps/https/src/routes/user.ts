import { Router } from "express";
import { bulkMetadata, metadata } from "../controllers/user";
import { userMiddleware } from "../middlewares/user";

export const userRouter = Router();
userRouter.use(userMiddleware)

userRouter.post('/metadata', metadata)
userRouter.get('/metadata/bulk', bulkMetadata) 